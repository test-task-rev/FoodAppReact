import Foundation
import AVFoundation
import Photos

@objc(CameraIntrinsicsModule)
class CameraIntrinsicsModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func getCameraIntrinsics(_ width: NSNumber,
                           height: NSNumber,
                           position: NSString,
                           resolver: @escaping RCTPromiseResolveBlock,
                           rejecter: @escaping RCTPromiseRejectBlock) {

    // Get the camera device
    let devicePosition: AVCaptureDevice.Position = (position as String) == "front" ? .front : .back

    guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: devicePosition) else {
      rejecter("CAMERA_NOT_FOUND", "Camera device not found", nil)
      return
    }

    let dimensions = CMVideoDimensions(width: Int32(truncating: width), height: Int32(truncating: height))

    // Get the REAL intrinsic matrix from ARKit factory calibration
    let intrinsicMatrix = device.intrinsicMatrix(for: dimensions)

    // The intrinsic matrix is a 3x3 matrix in column-major order:
    // [ fx  0  cx ]
    // [ 0  fy  cy ]
    // [ 0   0   1 ]
    //
    // In column-major: [fx, 0, 0, 0, fy, 0, cx, cy, 1]
    let fx = Double(intrinsicMatrix.columns.0.x)
    let fy = Double(intrinsicMatrix.columns.1.y)
    let cx = Double(intrinsicMatrix.columns.2.x)
    let cy = Double(intrinsicMatrix.columns.2.y)

    let result: [String: Any] = [
      "fx": fx,
      "fy": fy,
      "cx": cx,
      "cy": cy,
      "width": width,
      "height": height,
      "source": "arkit_factory_calibration"
    ]

    resolver(result)
  }

  @objc
  func getIntrinsicsFromPhoto(_ assetId: String,
                              resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {

    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)

    guard let asset = fetchResult.firstObject else {
      rejecter("ASSET_NOT_FOUND", "Photo asset not found", nil)
      return
    }

    let options = PHImageRequestOptions()
    options.version = .original
    options.isSynchronous = true

    PHImageManager.default().requestImageDataAndOrientation(for: asset, options: options) { data, _, _, info in
      guard let imageData = data,
            let imageSource = CGImageSourceCreateWithData(imageData as CFData, nil) else {
        rejecter("IMAGE_LOAD_FAILED", "Failed to load image data", nil)
        return
      }

      guard let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [String: Any] else {
        rejecter("NO_PROPERTIES", "No image properties found", nil)
        return
      }

      // Check for embedded intrinsics first
      if let makerNote = properties[kCGImagePropertyMakerAppleDictionary as String] as? [String: Any] {
        if let fx = makerNote["CameraIntrinsicFx"] as? Double,
           let fy = makerNote["CameraIntrinsicFy"] as? Double,
           let cx = makerNote["CameraIntrinsicCx"] as? Double,
           let cy = makerNote["CameraIntrinsicCy"] as? Double,
           let width = makerNote["IntrinsicWidth"] as? Int,
           let height = makerNote["IntrinsicHeight"] as? Int {

          let result: [String: Any] = [
            "fx": fx,
            "fy": fy,
            "cx": cx,
            "cy": cy,
            "width": width,
            "height": height
          ]

          resolver(result)
          return
        }
      }

      rejecter("NO_INTRINSICS", "No camera intrinsics found in photo metadata", nil)
    }
  }

  @objc
  func savePhotoWithIntrinsics(_ photoData: String,
                               intrinsics: NSDictionary,
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock) {

    guard let data = Data(base64Encoded: photoData),
          let image = UIImage(data: data) else {
      rejecter("INVALID_DATA", "Invalid photo data", nil)
      return
    }

    guard let imageData = image.jpegData(compressionQuality: 0.95) else {
      rejecter("CONVERSION_FAILED", "Failed to convert image", nil)
      return
    }

    guard let source = CGImageSourceCreateWithData(imageData as CFData, nil),
          let uti = CGImageSourceGetType(source) else {
      rejecter("SOURCE_CREATION_FAILED", "Failed to create image source", nil)
      return
    }

    let destData = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(destData, uti, 1, nil) else {
      rejecter("DESTINATION_CREATION_FAILED", "Failed to create destination", nil)
      return
    }

    var metadata = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [String: Any] ?? [:]

    var makerNote: [String: Any] = metadata[kCGImagePropertyMakerAppleDictionary as String] as? [String: Any] ?? [:]

    makerNote["CameraIntrinsicFx"] = intrinsics["fx"]
    makerNote["CameraIntrinsicFy"] = intrinsics["fy"]
    makerNote["CameraIntrinsicCx"] = intrinsics["cx"]
    makerNote["CameraIntrinsicCy"] = intrinsics["cy"]
    makerNote["IntrinsicWidth"] = intrinsics["width"]
    makerNote["IntrinsicHeight"] = intrinsics["height"]

    metadata[kCGImagePropertyMakerAppleDictionary as String] = makerNote

    CGImageDestinationAddImageFromSource(destination, source, 0, metadata as CFDictionary)

    guard CGImageDestinationFinalize(destination) else {
      rejecter("FINALIZE_FAILED", "Failed to finalize image", nil)
      return
    }

    PHPhotoLibrary.shared().performChanges({
      let request = PHAssetCreationRequest.forAsset()
      request.addResource(with: .photo, data: destData as Data, options: nil)
    }) { success, error in
      if success {
        resolver(["success": true])
      } else {
        rejecter("SAVE_FAILED", "Failed to save to photo library", error)
      }
    }
  }
}
