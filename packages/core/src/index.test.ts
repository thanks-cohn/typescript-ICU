import { describe, expect, it } from "vitest";
import { SurfaceRegistry } from "./index.js";

describe("SurfaceRegistry", () => {
  it("stores defensive copies of serializable surfaces", () => {
    const registry = new SurfaceRegistry();
    const original = { id: "dialog", concept: "dialog", state: { open: true } };
    registry.register(original);
    original.state.open = false;
    expect(registry.get("dialog")?.state).toEqual({ open: true });
    expect(registry.unregister("dialog")).toBe(true);
    expect(registry.list()).toEqual([]);
  });

  it("rejects surfaces without meaningful identity", () => {
    const registry = new SurfaceRegistry();
    expect(() => registry.register({ id: "", concept: "button" })).toThrow(TypeError);
  });
});
