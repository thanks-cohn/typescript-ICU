import type { Rect } from "@perceptual/core";

export interface CaptureResult {
  mimeType: string;
  width: number;
  height: number;
  data: string | Uint8Array;
}

export interface CaptureProvider {
  captureViewport(): Promise<CaptureResult>;
  captureRegion?(rect: Rect): Promise<CaptureResult>;
  captureSurface?(surfaceId: string): Promise<CaptureResult>;
}
