# Perceptual Interface Runtime

A small, framework- and transport-independent runtime for exposing **what the user sees** as structured surfaces, geometry, visibility, changes, and diagnostics. DOM state is evidence rather than a guarantee of perceptual truth.

## What v0.1 provides

- zero-config discovery of semantic HTML, ARIA roles, and explicit annotations;
- CSS-pixel, viewport-normalized, parent-normalized, and clipped bounds;
- visibility/clipping evidence and containment/viewport diagnostics;
- JSON snapshots, normalized change events, transport-neutral queries, and API discovery;
- optional capture-provider types without coupling to a screenshot mechanism;
- built ESM JavaScript and TypeScript declarations for all five packages.

`observe()` returns a `BrowserObserver` whose `snapshot()` describes currently observed semantic surfaces and whose `watch()` reports normalized changes. It does not prove occlusion, readability, or rendered pixels.

## Five-minute local start

Packages are not published. Clone the repository and use the workspace artifacts:

```sh
npm ci
npm run build
npm test
```

JavaScript and TypeScript use the same ESM API:

```js
import { createQueryApi } from "@perceptual/agent";
import { observe } from "@perceptual/browser";
import { diagnose } from "@perceptual/diagnostics";

const observer = observe();
const api = createQueryApi(observer, { diagnose });
console.log(api.describe());
console.log(api.listSurfaces());
console.log(api.validate());
const unwatch = api.watch((change) => console.log(change));
```

Workspace consumers resolve packages through npm workspaces. External local consumers can run `npm pack ./packages/core` (and the packages they need), then install the resulting tarballs together. `npm run test:consumer` automates that clean plain-JavaScript proof and never invokes TypeScript in the consumer.

### Vanilla browser, without a bundler

```sh
npm run build
npm run example:vanilla
# open http://127.0.0.1:4173/examples/vanilla/
```

The example's import map points at built browser ESM. Serving the repository root is intentional; opening the HTML as `file:` is not supported. Inspect `globalThis.runtime.snapshot()` in developer tools.

## Zero config and explicit meaning

Automatic discovery covers common controls, landmarks, media, `[role]`, and annotated elements. Generated ids are local to an observer session. Add durable meaning with HTML:

```html
<section data-perceptual-id="upload" data-perceptual-concept="upload-panel">
  <button data-perceptual-id="upload.add-child">Add child</button>
</section>
```

Or register an element directly:

```js
observer.registerSurface(element, { id: "upload.add-child", concept: "button" });
```

## Status and boundaries

The exact Public API v0.1 contract is in [`docs/API/PUBLIC_API_V0_1.md`](docs/API/PUBLIC_API_V0_1.md). Packages remain private and unpublished; package names are provisional, and the absent repository license blocks public release. There is no built-in capture, MCP/HTTP server, runtime schema validator, vision/occlusion verification, calibration, framework adapter, canvas/3D provider, or native bridge yet.
