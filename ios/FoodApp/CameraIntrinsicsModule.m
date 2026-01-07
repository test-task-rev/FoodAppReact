#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CameraIntrinsicsModule, NSObject)

RCT_EXTERN_METHOD(getIntrinsicsFromPhoto:(NSString *)assetId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(savePhotoWithIntrinsics:(NSString *)photoData
                  intrinsics:(NSDictionary *)intrinsics
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
