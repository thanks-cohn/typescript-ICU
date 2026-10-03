// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { intersectRects, normalizeRect, observe } from "./index.js";

afterEach(() => { document.body.innerHTML = ""; });

describe("browser geometry", () => {
  it("intersects and normalizes rectangles, including non-overlap", () => {
    expect(intersectRects({ x: -10, y: 10, width: 30, height: 20 }, { x: 0, y: 0, width: 15, height: 15 }))
      .toEqual({ x: 0, y: 10, width: 15, height: 5 });
    expect(intersectRects({ x: 20, y: 20, width: 5, height: 5 }, { x: 0, y: 0, width: 10, height: 10 }).width).toBe(0);
    expect(normalizeRect({ x: 20, y: 10, width: 40, height: 20 }, 100, 50)).toEqual({ x: .2, y: .2, width: .4, height: .4 });
  });

  it("discovers semantic elements and captures parent-relative geometry and clipping", () => {
    document.body.innerHTML = '<main data-perceptual-id="parent"><button aria-label="Add child">ignored</button></main>';
    const parent = document.querySelector("main")!, child = document.querySelector("button")!;
    Object.defineProperty(parent, "getBoundingClientRect", { value: () => ({ left: 10, top: 10, x: 10, y: 10, width: 80, height: 50, right: 90, bottom: 60 }) });
    Object.defineProperty(child, "getBoundingClientRect", { value: () => ({ left: 70, top: 20, x: 70, y: 20, width: 40, height: 20, right: 110, bottom: 40 }) });
    parent.setAttribute("style", "overflow: hidden");
    const observer = observe();
    const snapshot = observer.snapshot(), button = snapshot.surfaces.find((item) => item.role === "button")!;
    expect(button).toMatchObject({ concept: "button", text: "Add child", parentId: "parent",
      geometry: { parentBounds: { x: .75, y: .2, width: .5, height: .4 } },
      visibility: { visible: true, clipped: true, visibleFraction: .5 }, state: { interactive: true } });
    observer.stop();
  });

  it("supports explicit registration when discovery is disabled", () => {
    const node = document.body.appendChild(document.createElement("div"));
    Object.defineProperty(node, "getBoundingClientRect", { value: () => ({ left: 0, top: 0, width: 10, height: 10 }) });
    const observer = observe({ autoDiscover: false });
    observer.registerSurface(node, { id: "custom", concept: "destination-picker", state: { open: true } });
    expect(observer.snapshot().surfaces[0]).toMatchObject({ id: "custom", concept: "destination-picker", state: { open: true } });
    observer.stop();
  });
});
