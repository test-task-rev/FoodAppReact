export interface CameraIntrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface PhotoCapture {
  uri: string;
  intrinsics: CameraIntrinsics;
  timestamp: Date;
}
