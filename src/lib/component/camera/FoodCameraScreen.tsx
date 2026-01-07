import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
  CameraRuntimeError,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraIntrinsics, PhotoCapture } from '../../types/camera';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FoodCameraScreen: React.FC = () => {
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [isActive, setIsActive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const unsubscribe = () => {
      setIsActive(false);
    };
    return unsubscribe;
  }, []);

  const extractIntrinsicsFromPhoto = useCallback(
    async (photo: PhotoFile): Promise<CameraIntrinsics> => {
      const metadata = photo.metadata;

      if (!metadata) {
        throw new Error('No metadata available');
      }

      const width = photo.width;
      const height = photo.height;

      let fx: number;
      let fy: number;
      let cx: number;
      let cy: number;

      if (Platform.OS === 'ios') {
        const calibrationData = (metadata as any).Orientation;

        if (
          (metadata as any).FocalLength &&
          (metadata as any).FocalLengthIn35mmFormat
        ) {
          const focalLengthMm = (metadata as any).FocalLength;
          const focalLength35mm = (metadata as any).FocalLengthIn35mmFormat;

          const sensorWidthMm = (focalLengthMm / focalLength35mm) * 36;

          fx = (focalLengthMm / sensorWidthMm) * width;
          fy = fx;
          cx = width / 2;
          cy = height / 2;
        } else {
          const estimatedFocalLength35mm = 26;
          const sensorWidthMm = 8.8;
          const focalLengthMm = (estimatedFocalLength35mm * sensorWidthMm) / 36;

          fx = (focalLengthMm / sensorWidthMm) * width;
          fy = fx;
          cx = width / 2;
          cy = height / 2;
        }
      } else {
        fx = width * 1.2;
        fy = width * 1.2;
        cx = width / 2;
        cy = height / 2;
      }

      return {
        fx: Math.round(fx * 100) / 100,
        fy: Math.round(fy * 100) / 100,
        cx: Math.round(cx * 100) / 100,
        cy: Math.round(cy * 100) / 100,
        width,
        height,
      };
    },
    []
  );

  const savePhotoToDevice = useCallback(async (photo: PhotoFile): Promise<string> => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `food_${timestamp}.jpg`;
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    await RNFS.copyFile(photo.path, destPath);

    return destPath;
  }, []);

  const handleCapture = useCallback(async () => {
    if (!camera.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await camera.current.takePhoto({
        flash,
        enableShutterSound: true,
      });

      const intrinsics = await extractIntrinsicsFromPhoto(photo);

      const savedPath = await savePhotoToDevice(photo);

      const intrinsicsMessage = `Camera Intrinsics:\n\n` +
        `fx: ${intrinsics.fx.toFixed(2)}px\n` +
        `fy: ${intrinsics.fy.toFixed(2)}px\n` +
        `cx: ${intrinsics.cx.toFixed(2)}px\n` +
        `cy: ${intrinsics.cy.toFixed(2)}px\n` +
        `\nImage: ${intrinsics.width}×${intrinsics.height}px\n` +
        `\nSaved to:\n${savedPath}`;

      Alert.alert('Photo Captured', intrinsicsMessage, [
        {
          text: 'OK',
          style: 'default',
        },
      ]);

      console.log('Photo captured:', {
        path: savedPath,
        intrinsics,
      });
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', `Failed to capture photo: ${error}`);
    } finally {
      setIsCapturing(false);
    }
  }, [flash, extractIntrinsicsFromPhoto, savePhotoToDevice]);

  const toggleFlash = useCallback(() => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const handleError = useCallback((error: CameraRuntimeError) => {
    console.error('Camera error:', error);
    Alert.alert('Camera Error', error.message);
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={true}
        onError={handleError}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.flashText}>
              {flash === 'off' ? '⚡ OFF' : flash === 'on' ? '⚡ ON' : '⚡ AUTO'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guideContainer}>
          <View style={styles.guideBorder} />
          <Text style={styles.guideText}>Position food in frame</Text>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>
            Tap to capture with camera intrinsics
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flashText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guideBorder: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bottomBar: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureContainer: {
    marginBottom: 12,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
