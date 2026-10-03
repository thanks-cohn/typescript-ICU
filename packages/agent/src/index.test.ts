import { describe, expect, it } from "vitest";
import type { SnapshotEnvelope } from "@perceptual/core";
import { createQueryApi } from "./index.js";

const snapshot: SnapshotEnvelope = { version: "0.1", timestamp: 1, surfaces: [
  { id: "one", concept: "button", geometry: { pixelBounds: { x: 0, y: 0, width: 20, height: 20 }, viewportBounds: { x: 0, y: 0, width: .2, height: .2 } }, visibility: { visible: true, clipped: false } },
  { id: "two", concept: "button", geometry: { pixelBounds: { x: 10, y: 10, width: 20, height: 20 }, viewportBounds: { x: .1, y: .1, width: .2, height: .2 } }, visibility: { visible: false, clipped: false } },
] };

describe("query API", () => {
  it("queries snapshots without a transport", () => {
    const api = createQueryApi({ snapshot: () => snapshot });
    expect(api.listSurfaces()).toHaveLength(2);
    expect(api.getSurface("one")?.concept).toBe("button");
    expect(api.findByConcept("button")).toHaveLength(2);
    expect(api.hitTest(15, 15).map((surface) => surface.id)).toEqual(["one"]);
  });

  it("describes capabilities and returns defensive copies", () => {
    const api = createQueryApi({ snapshot: () => snapshot }, { diagnose: () => [], implementation: { profile: "test" } });
    expect(api.describe()).toEqual({ apiVersion: "0.1", snapshotVersion: "0.1",
      operations: ["describe", "snapshot", "listSurfaces", "getSurface", "findByConcept", "hitTest", "validate", "watch"],
      capabilities: { diagnostics: true, watch: false }, implementation: { profile: "test" } });
    const listed = api.listSurfaces();
    listed[0]!.concept = "changed";
    expect(api.getSurface("one")?.concept).toBe("button");
  });

  it("hit tests the clipped region in reverse snapshot order", () => {
    const layered: SnapshotEnvelope = { ...snapshot, surfaces: snapshot.surfaces.map((surface) => ({ ...surface,
      visibility: { visible: true, clipped: false }, geometry: { ...surface.geometry!, clipBounds: { x: 10, y: 10, width: 5, height: 5 } } })) };
    const api = createQueryApi({ snapshot: () => layered });
    expect(api.hitTest(12, 12).map(({ id }) => id)).toEqual(["two", "one"]);
    expect(api.hitTest(5, 5)).toEqual([]);
  });
});
