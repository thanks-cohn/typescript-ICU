# ICU Current API v0.1

**Status:** Implemented but provisional  
**Repository state reviewed:** `main` at `9808bb1430b11e4f19165e433b051e49a53b85d5`  
**Purpose:** Accurately document the public surface that exists before the Public API v0.1 hardening run.

This document describes the code that exists today. It is not a promise that every current name is already stable.

## 1. Current package surface

The workspace currently contains five API packages:

- `@perceptual/core`
- `@perceptual/browser`
- `@perceptual/diagnostics`
- `@perceptual/agent`
- `@perceptual/capture`

Their names are still described by the repository as provisional.

The packages are currently workspace-private, versioned `0.0.0`, and export TypeScript source paths directly. The root build can compile the workspace, but the packages are not yet configured as polished standalone distributable packages.

## 2. Core serialized contracts

`@perceptual/core` currently exports the serializable perceptual model.

### Geometry

```ts
type SurfaceId = string;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SurfaceGeometry {
  pixelBounds: Rect;
  viewportBounds: Rect;
  parentBounds?: Rect;
  clipBounds?: Rect;
}
```

`pixelBounds` are CSS pixels relative to the viewport. `viewportBounds` are normalized against viewport width and height. `parentBounds` are normalized against the nearest observed semantic parent. `clipBounds` represent the portion surviving viewport and ancestor clipping.

### Visibility

```ts
interface VisibilityState {
  visible: boolean;
  clipped: boolean;
  visibleFraction?: number;
  hiddenReason?: "display" | "visibility" | "opacity" | "zero-size" | "outside-clip";
}
```

### Surface snapshot

```ts
interface SurfaceSnapshot {
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
```

### Snapshot envelope

```ts
interface SnapshotEnvelope {
  version: "0.1";
  timestamp: number;
  viewport?: {
    width: number;
    height: number;
    devicePixelRatio?: number;
  };
  environment?: {
    userAgent?: string;
    language?: string;
  };
  tolerances?: {
    geometryPixels?: number;
    visibleFraction?: number;
  };
  surfaces: SurfaceSnapshot[];
  diagnostics?: Diagnostic[];
}
```

The current serialized snapshot version is therefore `0.1`.

### Changes and providers

The core currently exports normalized change types:

- `surface-added`
- `surface-removed`
- `surface-moved`
- `surface-resized`
- `surface-hidden`
- `surface-visible`
- `state-changed`
- `viewport-changed`

It also exports `SnapshotProvider`, `DiagnosticProvider`, perceptual contract types, diagnostics types, and the framework-independent `SurfaceRegistry`.

## 3. Browser API

`@perceptual/browser` currently exports:

```ts
observe(options?: ObserveOptions): BrowserObserver
intersectRects(a: Rect, b: Rect): Rect
normalizeRect(rect: Rect, width: number, height: number): Rect
```

### Observe options

```ts
interface ObserveOptions {
  root?: Document | Element;
  autoDiscover?: boolean;
  geometryTolerance?: number;
}
```

### Browser observer

```ts
interface BrowserObserver {
  snapshot(): SnapshotEnvelope;
  stop(): void;
  registerSurface(
    element: Element,
    surface: Partial<SurfaceSnapshot> &
      Pick<SurfaceSnapshot, "id" | "concept">
  ): void;
  unregisterSurface(id: string): void;
  watch(listener: SurfaceChangeListener): () => void;
}
```

The observer currently discovers semantic HTML, ARIA-role-bearing elements, and explicitly annotated elements. It computes CSS-pixel bounds, viewport-normalized bounds, nearest observed semantic parent, ancestor clipping, visibility, accessible text/name heuristics, interactivity, focus, and disabled state.

Explicit annotations currently include:

- `data-perceptual-id`
- `data-perceptual-concept`

## 4. Diagnostics API

`@perceptual/diagnostics` currently exports:

```ts
diagnose(snapshot: SnapshotEnvelope): Diagnostic[]
containmentOverflow(child: Rect, parent: Rect): {
  overflowLeft: number;
  overflowTop: number;
  overflowRight: number;
  overflowBottom: number;
}
```

Current diagnostic types include:

- `outside-parent-bounds`
- `viewport-overflow`
- `clipped-content`
- `zero-size-visible-element`
- `hidden-interactive-control`
- `contract-violation` in the core diagnostic type union, though no general contract evaluator is implemented yet.

Diagnostics are designed to operate on serialized snapshots rather than requiring browser objects.

## 5. Agent query API

`@perceptual/agent` currently exports:

```ts
createQueryApi(
  provider: SnapshotProvider,
  options?: QueryOptions
): PerceptualQueryApi
```

The returned query surface currently provides:

```ts
snapshot(): SnapshotEnvelope;
listSurfaces(): SurfaceSnapshot[];
getSurface(id: string): SurfaceSnapshot | undefined;
findByConcept(concept: string): SurfaceSnapshot[];
hitTest(x: number, y: number): SurfaceSnapshot[];
validate(): Diagnostic[];
watch(listener: SurfaceChangeListener): () => void;
```

This API is deliberately transport-independent and can later be wrapped by MCP, HTTP, WebSocket, extension messaging, Electron IPC, or another transport.

`hitTest` currently considers visible surfaces only and uses `clipBounds` when present, otherwise `pixelBounds`.

`validate` uses an injected diagnostic function when supplied, otherwise snapshot diagnostics, otherwise an empty list.

## 6. Capture contract

`@perceptual/capture` currently defines an interface only:

```ts
interface CaptureProvider {
  captureViewport(): Promise<CaptureResult>;
  captureRegion?(rect: Rect): Promise<CaptureResult>;
  captureSurface?(surfaceId: string): Promise<CaptureResult>;
}
```

No browser screenshot implementation is currently part of v0.1.

This is intentional: capture mechanisms are adapters and ICU should not depend on one screenshot provider.

## 7. Current example usage

The TypeScript example composes the browser observer, diagnostics, and query API:

```ts
const observer = observe();
export const interfaceView = createQueryApi(observer, { diagnose });
```

The vanilla JavaScript example currently imports `@perceptual/browser` with a bare package specifier. The workspace proves source-level behavior, but this example does **not yet** constitute a clean browser package-consumption proof because the packages are private and their exports point at TypeScript source.

This is a known early-adopter-readiness gap.

## 8. Important current limitations

The next API hardening run should treat these as explicit facts:

- Public contracts are still marked provisional.
- Workspace packages are `private: true`.
- Package versions are `0.0.0`.
- Package exports point directly to `.ts` source.
- There is no clean `npm pack` consumer proof.
- There is no browser-native/import-map packaging proof.
- There is no repository CI workflow yet.
- There is no repository license file or package license declaration visible in the current tree; publishing should not invent a license decision.
- Capture is an interface only.
- React, Vue, Svelte, Web Components, Canvas, Three.js, Babylon.js, WebGL/WebGPU, Electron/native, and vision-specific adapters are not dedicated implementations yet.
- 3D projected geometry and full calibration remain future work.
- The agent API has no explicit API/capability discovery operation yet.
- No MCP, HTTP, WebSocket, or extension transport is canonical or implemented as the standard.

## 9. What should remain conceptually stable

Even if names are refined during Public API v0.1 stabilization, the durable concepts already visible in the implementation are:

- semantic surfaces,
- serializable snapshots,
- geometry in explicit coordinate spaces,
- visibility and clipping,
- parent/child and other relationships,
- interaction affordances/state,
- pure diagnostics over snapshots,
- normalized change events,
- transport-independent querying,
- optional capture providers,
- progressive semantic annotation,
- and the principle that DOM state is evidence rather than the whole of user-visible truth.

The next run should stabilize these ideas without prematurely freezing implementation accidents.
