# RFC-001: ICU Calibration Lab — screen, interaction, canvas and 3D calibration

**Status:** PROPOSAL ONLY — not approved, implemented, or part of the v0.1 public API.
**Date:** 2026-10-13
**Repository:** typescript-ICU / Perceptual Interface Runtime
**Principle:** An agent must be able to distinguish what the application intended to display and receive from what a human actually sees and can interact with.

## Problem
A successful DOM render or 3D frame does not prove correct screen-space coordinates, hit targets, canvas scaling, camera projection, visual overlap, text readability, or interaction. Different monitors, OS scaling, zoom levels, browsers, graphics backends and input types can expose disagreement. Games especially require an end-to-end proof of world → camera → screen → pointer → target, not merely a screenshot.

## Purpose (independent of dependencies)
Offer a repeatable, machine-readable, human-confirmable calibration protocol. It must help a human and an agent pinpoint *where and why* display, geometry or interaction diverges, reproduce the result on another machine, and verify repair. A future agent should be able to recreate this subsystem from its purpose and behavioral contracts if every chosen implementation dependency disappears.

## Scope: six suites
1. **Screen geometry:** report reported physical screen size (where permitted), CSS viewport, visual viewport, devicePixelRatio, scroll offsets, transform state, available zoom clues, canvas backing-store vs CSS size, and environment uncertainty. Never claim to know physical millimeters or true OS scale when the browser does not expose them.
2. **Pointer & drawing:** human/automated click targets, drag paths, rectangles, circles, polygon outlines, fill regions, pointer capture, hover, touch/stylus where supported. Compare expected target/path against observed hit testing and drawn overlay. Validate coordinate conversion and tolerance.
3. **3D:** expose adapter contracts for camera matrices, viewport, render target, world-space projection, screen-to-world ray, raycast hits, frustum clipping, depth/occlusion hints, scene identifiers. Test camera presets, CSS transforms, resizing and non-default canvas scale. Never infer that a projected point is visible solely because it is inside the frustum.
4. **Form and DOM:** text entry, focus order, tabbing, select, scroll, accessible name, bounding box and clickable area vs painted location. Redact all entered values and sensitive content.
5. **Visual:** compare intended anchors, alignments, outlines, clipping, overlays and optional screenshots; report dimensions, severity and evidence. Pixel diff alone is insufficient proof of correctness; human review of aesthetic intent remains necessary.
6. **Cross-environment:** run protocol in Chromium/Firefox/WebKit and real devices when available; record browser/build/OS/browser engine where observable, viewport, DPR, locale, input mode, graphics diagnostics only with permission. Simulated viewport matrix is not equivalent to real hardware.

## Normative proposed invariants
- CAL-001: A calibration run is repeatable with stable step IDs, expected observations, actual observations, tolerance, pass/fail/indeterminate, and timestamp; uncertainty is explicit.
- CAL-002: Every reported coordinate declares its coordinate space, origin, units and transform sequence. Distinguish CSS px, backing-store px, normalized viewport coordinates, world coordinates and device pixels; do not silently conflate them.
- CAL-003: Testing identical semantic targets in narrow and wide containers exposes different geometry but preserves surface identity.
- CAL-004: Pointer injection and manual tests agree about event target/point within declared tolerances. Synthetic pointer input is labeled as synthetic and may not model real physical devices.
- CAL-005: Draw/outline/fill exercises retain expected shapes and report path deviation, clipping, scaling and transforms; no unqualified claims of pixel-perfect accuracy.
- CAL-006: World→screen→raycast roundtrips identify misses, transforms, occlusion uncertainty and camera mismatch, with diagnostic evidence.
- CAL-007: Canvas CSS sizes, backing-store sizes and DPR are reported separately and tested through resize/zoom where feasible.
- CAL-008: Form interactions preserve focus, reachability and semantic association; user-entered values never appear in default output.
- CAL-009: Screenshots/video are **opt-in** behind a capture provider, local by default, with explicit consent and retention rules. Structured results default to sanitized diagnostics.
- CAL-010: Calibration works in plain JavaScript as well as TypeScript; core meaning is independent of transport/framework/renderer.
- CAL-011: Browser feature gaps produce unsupported/indeterminate, not false failures or false success.
- CAL-012: Agent can identify likely mismatch stage (layout, projection, viewport mapping, input mapping, hit testing, render/occlusion) and reproduce with an attached test fixture.
- CAL-013: Existing ICU v0.1 API stays compatible; experimental capabilities are separately named/versioned until approved through API governance.
- CAL-014: Running or removing calibration cannot alter application layout or leave event listeners/overlays after teardown.
- CAL-015: Another agent can implement a replacement from this RFC and conformance fixtures without access to original internals.

## Interaction calibration workflow
A test scene offers crosshair targets, click grid, drag line, trace polygon, resize rectangle, draw circle, fill selection, and standard form fields. Record intent (target, shape, path), environmental measurements, raw pointer events, coordinate conversions, hit result, rendered feedback, delta and probable failure stage. Provide annotated overlay and a human-confirmable summary. Only synthetic actions authorized by test harness; never input into third-party pages without consent.

## 3D example
At a known camera pose, select an annotated 3D object; adapter supplies object/world bounds, matrices and projected polygon. Display its expected outline and clickable centroid in an independently layered debug overlay. Human clicks or pointer simulation; compare screen point, actual raycast hit and picked object. Rotate/zoom/change camera, resize canvas and repeat. Record differences between projected geometry and rendered pixels; depth and occlusion remain uncertain without appropriate render evidence.

## Versioned JSON report — illustrative, not canonical
```json
{
  "schema": "icu.calibration.proposal.v0",
  "runId": "example-run",
  "environment": {
    "viewportCssPx": {"width": 1366, "height": 768},
    "dpr": 1.25,
    "browser": {"name": "reported-browser", "version": "reported-version"}
  },
  "tests": [{
    "id": "pointer.center-target",
    "status": "indeterminate",
    "expected": {"surfaceId": "example.target", "space": "viewport-css-px", "x": 100, "y": 100},
    "observed": {"surfaceId": "example.target", "space": "viewport-css-px", "x": 101, "y": 100},
    "tolerance": {"positionCssPx": 2},
    "evidence": [],
    "limitations": ["Illustrative values only, no actual test executed"]
  }]
}
```
Final schema must validate, carry versioned evidence/reference fields and omit page text, screenshots, typed values and secrets by default. Report comparison across sessions must normalize coordinate spaces, and distinguish hardware variation from regressions.

## Architecture proposal
- Core: framework-neutral contracts and pure comparison/coordinate helpers.
- Browser calibration adapter: DOM, visual viewport, canvas and pointer observations.
- 3D adapter interface: no mandatory Three.js/Babylon/etc.; renderer-specific implementations remain optional.
- Independent overlay/capture provider: sandboxable, tear-down safe, consent-gated.
- Runner/lab: deterministic fixtures plus guided physical-device verification.
- Report and replay: schema validation, comparison and agent-readable root-cause evidence; replay must not require recording private form data.
- Integration: reuse ICU surface IDs, geometry, observer/query concepts where compatible; avoid new v0.1 API claims without an explicit versioned proposal.

## Verification matrix
Test 320×640, 667×375, 768×1024, 1366×768, 1920×1080, ultrawide; DPR 1 and noninteger DPR where supported; zoom, scroll, CSS transform, nested iframes if same-origin/authorized, fullscreen if allowed; WebGL renderer resize and multiple camera views; pointer vs touch; RTL, long text and keyboard. Test Chromium/Firefox/WebKit in automation and **real machines separately**. Never imply all environments were actually tested.

## Forever Works durability / recovery
Store purpose, observable contracts, minimal offline fixture, public schema, adapter responsibility, diagnostic sample, dependency inventory, CI commands, known environment limitations, golden artifacts and migration decisions. If any dependency disappears, reimplement adapters while preserving contract assertions and calibrated observations. Test at least one dependency replacement as a proof-of-recovery exercise; report unsupported/untested states explicitly.

## Relationship with Any-Shape
Any-Shape describes how composition ought to adapt; ICU Calibration Lab verifies what the browser actually drew and how interactions map to visual targets. Integration must be optional; neither project is a runtime dependency of the other. Potential shared fixtures and report mapping can be standardized later.

## Scope boundaries, risks and unresolved questions
Do not assert perfect visual equality across hardware. OS/monitor physical characteristics may be unavailable from browser APIs. Screenshot pixel differences may reflect font rasterization, anti-aliasing or GPU. Synthetic pointer events are not a substitute for physical touch accuracy. Accessibility needs manual and automated checks. Protect user privacy; require permission for visual captures and cross-origin integrations. Avoid benchmarking real hardware through untrusted code.

## Decision requested
Approve a **separate experimental calibration subsystem**, without destabilizing ICU v0.1, starting with pure coordinate-space contract tests, browser viewport/pointer/DOM fixtures, a human calibration playground and report schema. Add 3D renderer adapters only after baseline evidence and migration-safe contracts exist.

## Implementation status
No code, benchmark, CI result, or physical calibration is claimed by this RFC.
