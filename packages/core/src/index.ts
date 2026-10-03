export type SurfaceId = string;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SurfaceGeometry {
  pixelBounds: Rect;
  viewportBounds: Rect;
  parentBounds?: Rect;
}

export interface VisibilityState {
  visible: boolean;
  clipped: boolean;
  visibleFraction?: number;
}

export interface SurfaceRelationship {
  type: string;
  target: SurfaceId;
}

export interface SurfaceAction {
  id: string;
  label?: string;
}

export interface SurfaceSnapshot {
  id: SurfaceId;
  concept: string;
  role?: string;
  text?: string;
  state?: Record<string, unknown>;
  geometry?: SurfaceGeometry;
  visibility?: VisibilityState;
  parentId?: SurfaceId;
  childIds?: SurfaceId[];
  relationships?: SurfaceRelationship[];
  actions?: SurfaceAction[];
}

export interface Diagnostic {
  type: string;
  surfaceId: SurfaceId;
  message?: string;
  data?: Record<string, unknown>;
}

export interface SnapshotEnvelope {
  version: string;
  timestamp: number;
  viewport?: {
    width: number;
    height: number;
    devicePixelRatio?: number;
  };
  surfaces: SurfaceSnapshot[];
  diagnostics?: Diagnostic[];
}

export interface PerceptualExpectation {
  visible?: boolean;
  containedBy?: SurfaceId;
  centered?: boolean;
  modal?: boolean;
}

export interface PerceptualContract {
  id: string;
  surfaceId: SurfaceId;
  concept?: string;
  expected: PerceptualExpectation;
}
