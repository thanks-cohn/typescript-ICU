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
});
