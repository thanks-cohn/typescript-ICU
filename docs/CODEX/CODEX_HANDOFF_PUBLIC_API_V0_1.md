# Codex handoff: Public API v0.1 and adopter readiness

**Date:** 2026-10-03  
**Starting SHA:** `f09f0992d68aaf8b597130ce2894e9ef3b4893eb`  
**Branch observed throughout:** `work`

## Executive status

The small v0.1 API is documented, versioned, built as ESM JavaScript plus declarations, covered by discovery/conformance tests, exercised from packed artifacts by a plain-JavaScript consumer, and backed by CI. The browser example now uses an import map to built ESM and was served/fetched locally. No registry publication or license decision was made.

The checkout was already on `work`, not `main`, at task start. In accordance with the simultaneous instruction not to create or switch branches, no branch was created or switched. Therefore the requested confirmation that work stayed on `main` cannot honestly be made. The continuation owner should determine how this commit is to be integrated with `main`.

## Public API decisions

- Public API version and snapshot version are separately exported as `PUBLIC_API_VERSION = "0.1"` and `SNAPSHOT_VERSION = "0.1"`; packages are SemVer `0.1.0`.
- Stabilized core contracts: `SurfaceId`, `Rect`, geometry, visibility, surfaces, diagnostics, snapshot/change/provider contracts, perceptual contract types, and `SurfaceRegistry`.
- Stabilized browser operations: `observe`, `snapshot`, `stop`, registration, unregistration, and watch. The existing rectangle helpers remain public for v0.1.
- Stabilized diagnostics: `diagnose` and `containmentOverflow`, with measured payload semantics.
- Stabilized agent operations: `describe`, `snapshot`, list, exact id/concept lookup, clipped-region hit testing, validate, and watch.
- Stabilized capture types: `CaptureProvider` and `CaptureResult`; no implementation is implied.
- Ordering, coordinate spaces, defensive copies, unsupported behavior, evolution rules, and known limitations are specified in `docs/API/PUBLIC_API_V0_1.md`.

## Discovery

`describe()` is complete and returns JSON-serializable API/snapshot versions, a fixed operation list, diagnostics/watch availability, optional configured capture capabilities, and optional neutral implementation metadata. Capture flags are descriptive and do not add query operations.

## Packaging and consumers

- Every package is still private but now versioned `0.1.0` with explicit ESM `exports`, `main`, `types`, and `files` pointing at `dist`.
- Per-package build configs emit `.js`, `.js.map`, `.d.ts`, and `.d.ts.map`.
- The plain-JavaScript smoke script builds, packs core/diagnostics/agent, installs tarballs in a temporary ordinary npm project, imports built package entry points, exercises registry/query/discovery/diagnostics, and invokes only `node` in the consumer.
- TypeScript declaration generation and repository strict type checking pass. A separate packed TypeScript consumer fixture was not added; this is the clearest remaining packaging-proof improvement.

## Vanilla browser proof

The example uses a native import map to `packages/browser/dist/index.js` and the repository includes a dependency-free Node static server. The page and built browser module were successfully fetched with `curl`. Interactive execution in a real browser was not performed, so visual/console behavior beyond the existing jsdom browser tests remains unverified.

## Conformance and CI

Agent tests now protect discovery, defensive query copies, ordering, and clipped-region hit testing. Existing tests continue to cover snapshot version fixtures, registry copies, DOM geometry/visibility, and diagnostic names/payloads. GitHub Actions runs clean install, check, tests, build, and packed-consumer smoke on Node 20.

## Documentation

- `docs/API/PUBLIC_API_V0_1.md` is the normative implemented contract.
- `docs/API/README.md` points to it and preserves the maintenance rule.
- `docs/API/CURRENT_API_V0_1.md` is retained with an explicit historical notice.
- The root README now gives accurate local package, query/diagnostic, annotation, consumer-smoke, and vanilla-browser onboarding.

## Release blockers and limitations

- **Blocker:** no repository license exists; no license metadata was invented.
- Packages are private, unpublished, and use provisional names.
- No CommonJS or legacy-browser output is provided.
- No capture implementation, transport server, schema runtime validator, vision/occlusion proof, calibration, framework adapter, canvas/3D provider, or native integration exists.
- `npm ci` reports two moderate dependency audit findings; they were not automatically changed because doing so could introduce unrelated/breaking upgrades.

## Commands actually executed

Successful after fixes:

- `npm ci` — installed 153 packages; npm reported two moderate audit findings.
- `npm run check` — passed.
- `npm test` — 4 files and 12 tests passed.
- `npm run build` — all five packages built.
- `npm run test:consumer` — packed artifacts installed and the plain-JavaScript assertion printed `plain JavaScript consumer passed`.
- `npm run example:vanilla` — server started at `127.0.0.1:4173`.
- `curl --fail --silent http://127.0.0.1:4173/examples/vanilla/ | rg 'importmap|packages/browser/dist/index.js'` — import map found.
- `curl --fail --silent http://127.0.0.1:4173/packages/browser/dist/index.js | rg 'export function observe'` — built browser JavaScript found.

An initial combined verification exposed two setup issues: dependencies had not been installed, then the first consumer script used `npm pack packages/core`, which npm interpreted as a GitHub shorthand. Both were corrected (`npm ci`, and `./packages/...`) before the successful results above. A duplicate TypeScript `module` key warning was also removed.

## Files changed

API/runtime: core and agent sources/tests. Packaging: root and five package manifests, five package build configs, lockfile, consumer/server scripts. Adoption: vanilla HTML, README, CI workflow. Documentation: the API index/reference/history notice and this handoff.

## Completed / partial / deferred / unverified

- **Completed:** version distinction; discovery; built ESM/declarations; package exports; JS packed-consumer proof; conformance additions; CI; official API reference; onboarding; honest license status.
- **Partial:** vanilla proof (served and fetched, but not executed in a real browser); TypeScript consumer proof (declarations generated and checked, no isolated packed fixture).
- **Deferred by scope:** transports, capture implementation, larger adapters, vision, calibration, 3D, native, repair.
- **Unverified:** registry publication/install, real-browser interactive example, CommonJS/older browsers, downstream projects.

## Best continuation point

First reconcile this commit onto the intended `main` branch. Then add an isolated packed TypeScript consumer compile and a lightweight real-browser smoke test. Before any public release, the owner must choose a license and decide final package naming/publication metadata. Broader observation providers should follow only after these release-foundation decisions.
