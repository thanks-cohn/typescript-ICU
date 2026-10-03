# Codex Request: ICU Public API v0.1 + Early-Adopter Readiness

## Mission

Use approximately **30 minutes** to move ICU / the Perceptual Interface Runtime from a strong browser-first v0.1 proof into an **early, coherent, externally consumable API foundation**.

Do not spend this run expanding into React, Vue, Three.js, computer vision, native desktop capture, or a large new ontology.

The highest-value work now is to stabilize and package the useful core that already exists.

The project vision is:

> **An API for what the user sees.**

The system should expose semantic, structural, geometric, behavioral, rendered, and eventually perceptual evidence in a form that an unfamiliar agent can query without scraping project-specific implementation details.

The enduring principle remains:

> **Zero configuration gives useful sight. Configuration gives understanding. Calibration gives precision. Vision gives verification.**

## Required reading

Before changing anything, read completely:

- `AGENTS.md`
- `README.md`
- `docs/FOUNDATIONAL_PERCEPTUAL_INTERFACE_STANDARD_PROPOSAL.md`
- `docs/STANDARDIZATION_CHARTER.md`
- `docs/CODEX_IMPLEMENTATION_PLAN.md`
- `docs/API/README.md`
- `docs/API/CURRENT_API_V0_1.md`

Then inspect all current package source, tests, manifests, examples, TypeScript configuration, and build scripts.

Do not rely only on the planning documents. Reconcile them with the implementation that actually exists.

## Main-only execution rule

Work **directly on the current `main` branch for the entire task**.

Do not create or switch to another branch.

Do not open a pull request.

Commit coherent work directly to `main`.

## 30-minute execution and handoff requirement

Use approximately 30 minutes.

Early in the run, prioritize the public contract, package boundaries, and clean consumer path.

As the final several minutes approach, prioritize:

- stabilization,
- targeted verification,
- accurate official API documentation,
- coherent commits,
- and the mandatory handoff.

By approximately the end of the window, create or update and commit:

`docs/CODEX/CODEX_HANDOFF_PUBLIC_API_V0_1.md`

The handoff is mandatory whether the full request is complete or partial.

Clearly distinguish completed, partial, deferred, failing, and unverified work.

Do not claim a build, browser behavior, package-consumer path, or test passed unless it was actually executed successfully.

## 1. Establish the official Public API v0.1 contract

The permanent official API documentation lives under:

`docs/API/`

Create or update:

- `docs/API/README.md`
- `docs/API/PUBLIC_API_V0_1.md`

Retain `docs/API/CURRENT_API_V0_1.md` as a historical pre-hardening snapshot unless there is a compelling reason to supersede it with an explicit note.

The Public API v0.1 document must accurately specify the behavior actually implemented by the end of the run.

Document at minimum:

- API/version terminology,
- serialized snapshot version,
- package responsibilities,
- exported public operations/types,
- coordinate-space semantics,
- visibility semantics,
- diagnostics and diagnostic payload conventions,
- normalized change events,
- query behavior,
- capture-provider contract,
- error/unsupported behavior where applicable,
- deterministic ordering expectations where relevant,
- compatibility/evolution rules,
- and what remains explicitly experimental or deferred.

Do not document aspirational behavior as implemented.

### API documentation maintenance rule

Any public API change made during this run must update `docs/API/` in the same coherent change.

**Change the API, change `docs/API/`.**

Add this rule to `AGENTS.md` if it is not already present.

## 2. Decide what should be stable

The current source exposes useful concepts but marks public contracts provisional.

Stabilize only the smallest defensible v0.1 surface.

Strong candidates to preserve include:

### Core

- `SurfaceId`
- `Rect`
- `SurfaceGeometry`
- `VisibilityState`
- `SurfaceSnapshot`
- `Diagnostic`
- `SnapshotEnvelope`
- `SurfaceChange`
- provider interfaces
- `SurfaceRegistry`

### Browser

- `observe(options?)`
- observer `snapshot()`
- `stop()`
- `registerSurface()`
- `unregisterSurface()`
- `watch()`

### Diagnostics

- `diagnose(snapshot)`
- stable diagnostic type names and payload semantics

### Agent query surface

- `createQueryApi()`
- `snapshot()`
- `listSurfaces()`
- `getSurface()`
- `findByConcept()`
- `hitTest()`
- `validate()`
- `watch()`

### Capture

- `CaptureProvider`
- `CaptureResult`

You may refine names or factor internal helpers when necessary, but avoid gratuitous breaking changes.

Do not freeze helpers as public API merely because they are currently exported unless they serve a durable concept.

## 3. Add API discovery

An unfamiliar agent or adapter should be able to discover the ICU contract it is speaking to.

Add a small transport-independent discovery capability to the agent-facing layer, such as `describe()`, returning JSON-serializable information including appropriate fields such as:

- public API version,
- snapshot/schema version,
- supported query operations,
- diagnostics availability,
- watch availability,
- capture capabilities when configured,
- implementation/profile information where useful.

Do not make vendor identity part of semantic correctness.

Keep discovery small and durable.

## 4. Make packages genuinely consumable

This is one of the most important parts of the run.

Today the workspace packages are private `0.0.0` packages and export TypeScript source directly.

Create a coherent package build/distribution foundation so a consumer can use built JavaScript and declarations without compiling ICU's TypeScript source itself.

Prefer:

- ESM,
- generated `.js`,
- generated `.d.ts`,
- explicit package exports,
- minimal/no runtime dependencies outside the ICU workspace graph,
- and no unnecessary bundler dependency if TypeScript itself can provide a clean solution.

A JavaScript consumer must not need `tsc` to consume the packed artifact.

Do not publish packages to a registry in this run.

Do not remove `private: true` merely to simulate publication if legal/release prerequisites are unresolved.

## 5. Prove plain JavaScript consumption

JavaScript and TypeScript are both first-class consumer targets.

Add a clean-consumer proof that:

1. builds/packs the relevant package or packages,
2. installs them into a temporary ordinary JavaScript consumer,
3. imports the public API from built JavaScript,
4. exercises a meaningful non-DOM core/query/diagnostic path,
5. and does not invoke TypeScript in the consumer.

This does **not** require a second independently authored JavaScript implementation. ICU may remain TypeScript-authored while producing first-class JavaScript artifacts.

## 6. Make the vanilla browser story true

The current vanilla example uses a bare import from `@perceptual/browser`, but that is not yet a browser-native proof.

Make the vanilla example honestly runnable through one documented low-friction path.

Good options include:

- browser ESM plus an import map against built local package artifacts,
- or another dependency-light approach that preserves the project's portability goals.

Avoid introducing a heavy framework or bundler solely to make the demo work.

If a clean browser-native proof cannot be completed in the time window, document the exact remaining gap rather than pretending the current bare import is sufficient.

## 7. Preserve and strengthen transport independence

The semantic/query API must remain independent of:

- MCP,
- HTTP,
- WebSocket,
- browser-extension messaging,
- Electron IPC,
- and any single agent vendor.

Do **not** build an MCP or HTTP server in this run.

If useful, document how a future transport adapter should map onto the same query API.

## 8. Diagnostics and query conformance

Add a small API/conformance layer that tests observable public behavior rather than implementation details.

At minimum, cover high-value semantics such as:

- snapshot version,
- surface ordering/lookup behavior,
- concept lookup,
- hit testing and clipping behavior,
- diagnostics names/payloads,
- change-event normalization where practical,
- discovery output,
- and defensive serialization/copy behavior.

Do not weaken existing tests.

Prefer shared fixtures or golden JSON where that meaningfully guards serialized compatibility.

## 9. Package and API versioning

Choose and document a coherent v0.1 versioning approach.

At minimum distinguish:

- Public API version,
- snapshot/schema version,
- package version.

Do not imply that changing one necessarily changes all three.

Avoid unnecessary versioning machinery, but make the distinction explicit so future evolution is possible.

## 10. Release-readiness audit

Perform a focused early-adopter audit.

Inspect:

- package names,
- package versions,
- package exports,
- build outputs,
- declaration outputs,
- workspace dependencies,
- Node/runtime requirements,
- browser support assumptions,
- README usage,
- examples,
- API docs,
- tests,
- CI,
- license status,
- and claims of framework independence.

### License rule

The current repository does not appear to contain an explicit license file.

Do **not** invent or choose a license on behalf of the owner.

Instead, document the missing license as a public-release blocker if it remains missing.

Package metadata must not falsely claim a license that the repository has not established.

## 11. Add CI if absent

The repository currently lacks a visible GitHub Actions workflow.

Add a minimal CI workflow if practical that runs the meaningful supported checks, such as:

- install,
- type check,
- tests,
- build,
- package/consumer smoke proof.

Keep CI boring and portable.

## 12. API ergonomics without API bloat

The current package split is good.

Do not collapse the architecture into one giant package merely for convenience.

A small convenience composition layer is acceptable only if it materially improves the primary use case without duplicating semantics.

For example, it may be reasonable to make the canonical browser path concise:

```ts
const observer = observe();
const api = createQueryApi(observer, { diagnose });
```

or to introduce an equally small convenience façade if it clearly improves adoption.

Do not add dozens of convenience methods.

## 13. Preserve the perceptual model

Do not regress the core distinctions that make ICU valuable.

In particular preserve:

- logical truth is not perceptual truth,
- DOM existence is not visibility,
- geometry has explicit coordinate spaces,
- clipping and visible fraction matter,
- semantic identity should survive framework rewrites,
- diagnostics should distinguish measured evidence from inference,
- capture is optional,
- transport is replaceable,
- and the standard should be usable on low-power hardware without defaulting to expensive vision.

## 14. Explicitly defer larger adapters

Unless all core work is complete and verified, defer:

- React adapter,
- Vue adapter,
- Svelte adapter,
- Web Components-specific adapter,
- Three.js adapter,
- Babylon.js adapter,
- Canvas semantic provider,
- WebGL/WebGPU scene provider,
- Electron/native bridge,
- full screenshot implementation,
- computer-vision pipeline,
- 3D projection model,
- calibration CLI,
- automatic repair.

These are later milestones.

## 15. README / five-minute onboarding

Improve the top-level README so an unfamiliar developer can answer within a few minutes:

- What problem does ICU solve?
- What does `observe()` give me?
- How do I query what the user sees?
- How do I run diagnostics?
- How do JavaScript and TypeScript consumers install/use it?
- What does zero-config discover?
- How do I add explicit semantic identity?
- What is not implemented yet?

Use commands and imports that actually work after this run.

Do not advertise registry installation if packages have not been published.

## 16. Verification priorities

Run the strongest relevant verification that fits the window.

Prioritize:

- `npm ci` or equivalent clean install,
- `npm run check`,
- `npm test`,
- `npm run build`,
- package-consumer smoke test,
- browser/vanilla example verification where practical,
- API/conformance tests,
- `git diff --check`,
- and CI-equivalent commands.

If package build structure changes, prove that consumers import built `.js` rather than workspace `.ts`.

Report environmental limitations accurately.

## 17. Mandatory handoff

By approximately the end of the run create and commit:

`docs/CODEX/CODEX_HANDOFF_PUBLIC_API_V0_1.md`

Include:

- public API decisions,
- operations/types stabilized,
- API discovery status,
- package build/export status,
- JavaScript consumer status,
- TypeScript consumer status,
- vanilla browser proof status,
- diagnostics/query conformance status,
- CI status,
- documentation updates,
- release blockers,
- license status,
- tests/commands actually executed and exact results,
- files changed,
- completed/partial/deferred/unverified work,
- confirmation work stayed on `main`,
- latest `main` SHA available to the run,
- and the exact best continuation point.

## 18. Acceptance criteria

A strong result should satisfy as many of these as possible without sacrificing correctness:

1. `docs/API/PUBLIC_API_V0_1.md` exists and matches reality.
2. Official API docs distinguish stable, provisional, and deferred behavior.
3. API/capability discovery exists.
4. Package consumers import built JavaScript, not raw TypeScript source.
5. Type declarations are available to TypeScript consumers.
6. A clean ordinary JavaScript consumer proof passes without `tsc`.
7. The vanilla browser story is executable or its remaining gap is precisely documented.
8. Existing core/browser/diagnostic/agent behavior remains covered.
9. API/conformance coverage protects serialized behavior.
10. Public API, snapshot, and package versions are clearly distinguished.
11. README onboarding is accurate and materially better.
12. CI exists and covers core checks if practical.
13. No transport or framework becomes canonical.
14. No license is invented.
15. The mandatory handoff is committed on `main`.

## Desired end state

At the end of this run ICU should move from:

> a strong internal v0.1 implementation with provisional package contracts

toward:

> **an early but genuinely consumable perceptual-interface API with documented semantics, built JavaScript artifacts, strong TypeScript support, and a credible zero-config browser path**

The next major phase after that should be broader observation providers, capture integration, calibration, and eventually 3D/runtime-specific adapters—not another round of package-foundation work.
