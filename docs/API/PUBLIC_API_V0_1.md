# ICU Public API v0.1

**Status:** Stable early-adopter contract within the `0.1` line  
**Package version:** `0.1.0`  
**Public API version:** `0.1`  
**Snapshot/schema version:** `0.1`

This document is the normative reference for the implemented v0.1 surface. “Stable” means compatible changes are preferred within v0.1; it does not mean the project is published or production-complete.

## Versions and compatibility

Package SemVer, the discovery `apiVersion`, and snapshot `version` are separate. A package patch may fix implementation behavior without changing either serialized version. A new optional field is compatible. Removing or changing the meaning/type of an operation, required field, event, or diagnostic requires an API version change; an incompatible snapshot shape requires a snapshot version change. Consumers must ignore unknown optional fields and diagnostic types. The package names remain provisional pending project naming and release decisions.

`PUBLIC_API_VERSION` and `SNAPSHOT_VERSION` are exported by `@perceptual/core` and both equal `"0.1"`.

## Packages and distribution

All packages are ESM-only, remain `private`, and are version `0.1.0`. `npm run build` writes ES2022 JavaScript, source maps, declarations, and declaration maps to each package's `dist/`. Package `exports`, `main`, and `types` select those built files; consumers do not compile ICU source. Node 20 or newer is the supported toolchain/runtime for non-browser package use. Browser code assumes modern DOM APIs, ES modules, import maps for the supplied example, and `structuredClone` where query/registry APIs are used.

- `@perceptual/core`: serialized contracts, version constants, providers, and `SurfaceRegistry`.
- `@perceptual/browser`: zero-config DOM observation and `BrowserObserver`.
- `@perceptual/diagnostics`: pure snapshot diagnostics.
- `@perceptual/agent`: transport-neutral discovery and queries.
- `@perceptual/capture`: capture types only; no capture implementation.

## Core serialized contract

`Rect` has numeric `x`, `y`, `width`, and `height`. `SurfaceGeometry` requires `pixelBounds` and `viewportBounds`, and may include `parentBounds` and `clipBounds`. `VisibilityState` requires `visible` and `clipped`, with optional `visibleFraction` and `hiddenReason` (`display`, `visibility`, `opacity`, `zero-size`, or `outside-clip`).

A `SurfaceSnapshot` requires string `id` and `concept`, and may include `role`, `text`, JSON-compatible `state`, geometry, visibility, `parentId`, ordered `childIds`, relationships, and actions. A `SnapshotEnvelope` is:

```ts
interface SnapshotEnvelope {
  version: "0.1";
  timestamp: number;
  viewport?: { width: number; height: number; devicePixelRatio?: number };
  environment?: { userAgent?: string; language?: string };
  tolerances?: { geometryPixels?: number; visibleFraction?: number };
  surfaces: SurfaceSnapshot[];
  diagnostics?: Diagnostic[];
}
```

Values crossing the public serialized boundary must be JSON-serializable. `SurfaceRegistry.register`, `get`, and `list` use defensive structured clones. Registration rejects an empty id or concept; registering an existing id replaces it while retaining JavaScript `Map` insertion position.

### Coordinate spaces

- `pixelBounds`: CSS pixels relative to the viewport; values can be negative or beyond viewport edges.
- `viewportBounds`: each pixel coordinate/dimension divided by viewport width/height. Zero viewport dimensions produce zero on that axis. Values are not clamped.
- `parentBounds`: child origin relative to the nearest observed semantic parent's origin, then all coordinates/dimensions normalized by that parent's width/height. Values are not clamped.
- `clipBounds`: CSS-pixel intersection surviving the viewport and clipping ancestors; non-overlap is a zero-area rectangle.

## Browser API

```ts
observe(options?: {
  root?: Document | Element;
  autoDiscover?: boolean;
  geometryTolerance?: number;
}): BrowserObserver
```

A missing `root` uses global `document`; a root not attached to a `Window` throws. Automatic discovery, in DOM order, includes semantic controls/landmarks/media, ARIA-role elements, and elements with `data-perceptual-id` or `data-perceptual-concept`. Generated ids are observer-local `surface-N` values and are stable for an element during that observer's lifetime. Explicit registration is available even with discovery disabled:

```ts
snapshot(): SnapshotEnvelope;
registerSurface(element, { id, concept, ...overrides }): void;
unregisterSurface(id: string): void;
watch(listener): () => void;
stop(): void;
```

Snapshots report DOM evidence, not guaranteed perceptual truth. `visible` is false for the implemented CSS/ancestor hidden reasons, zero area, or zero surviving clip area. `clipped` compares surviving area with original area (0.01 CSS-pixel-area tolerance); `visibleFraction` is surviving/original area, or zero for zero area. Occlusion, paint order, readability, and pixel verification are not evaluated.

`watch` coalesces DOM/resize/input triggers through `requestAnimationFrame`. Events are emitted in snapshot surface order, then removals in previous order, then `viewport-changed`. A changed surface may yield multiple events in this order: moved, resized, visibility, state. `stop()` disconnects observation and clears listeners.

`intersectRects` and `normalizeRect` remain exported geometry utilities in v0.1.

## Change events

`SurfaceChange.type` is one of `surface-added`, `surface-removed`, `surface-moved`, `surface-resized`, `surface-hidden`, `surface-visible`, `state-changed`, or `viewport-changed`. Every event contains the resulting snapshot; surface-specific events contain `surfaceId`. Providers without watch support are valid.

## Diagnostics

`diagnose(snapshot)` returns diagnostics in surface order. For each surface it checks, in order: parent overflow, viewport overflow, clipping, visible zero size, and hidden interactivity. `geometryPixels` is a strict overflow tolerance. Diagnostic payloads are measured evidence:

- `outside-parent-bounds`: `data.parentId` plus `overflowLeft`, `overflowTop`, `overflowRight`, `overflowBottom` in CSS pixels.
- `viewport-overflow`: the four CSS-pixel overflow values.
- `clipped-content`: `data.visibleFraction`.
- `zero-size-visible-element`: no required data.
- `hidden-interactive-control`: `data.hiddenReason`.

`contract-violation` is reserved in the core type union but no v0.1 evaluator emits it. `containmentOverflow(child, parent)` remains public and returns non-negative edge overflow values.

## Query and discovery API

`createQueryApi(provider, options?)` accepts any `SnapshotProvider`. All snapshot query results are taken from a fresh defensive clone.

- `describe()` returns JSON-serializable `apiVersion`, `snapshotVersion`, the supported operation list, diagnostics/watch capability flags, optional configured capture capability flags, and optional neutral implementation metadata.
- `snapshot()` returns a clone.
- `listSurfaces()` preserves provider snapshot order.
- `getSurface(id)` returns the first exact id match or `undefined`.
- `findByConcept(concept)` returns all exact, case-sensitive matches in snapshot order.
- `hitTest(x, y)` includes only explicitly visible surfaces with geometry, tests `clipBounds` when present and otherwise `pixelBounds`, treats edges as inclusive, and reverses snapshot order as an approximate front-to-back order. It does not claim true paint/z order.
- `validate()` uses the configured diagnostic function, otherwise embedded snapshot diagnostics, otherwise `[]`.
- `watch(listener)` delegates to the provider or returns a no-op unsubscribe function.

`describe().capabilities.capture` is descriptive configuration; it does not add capture operations. Transport adapters may serialize these same calls over MCP, HTTP, WebSocket, extension messaging, or IPC, but no transport defines semantics or is included.

## Capture contract

`CaptureProvider` requires `captureViewport()` and may provide `captureRegion(rect)` and `captureSurface(surfaceId)`. Each resolves to `{ mimeType, width, height, data }`, where `data` is a string or `Uint8Array`. Providers define data encoding, errors, permissions, and unsupported behavior. No built-in provider exists, and snapshots/queries do not depend on capture.

## Experimental, unsupported, and deferred

Package names and explicit implementation metadata are provisional. There is no registry publication, license grant, CommonJS build, legacy-browser build, runtime schema validator, screenshot implementation, accessibility-tree provider, occlusion/vision proof, calibration, framework adapter, canvas/3D provider, native bridge, server, or canonical transport. A missing repository license is a public-release blocker. React/Vue/Svelte/Web Components-specific, Three.js/Babylon.js, WebGL/WebGPU, Electron/native, vision, 3D projection, calibration, and automatic repair remain deferred.
