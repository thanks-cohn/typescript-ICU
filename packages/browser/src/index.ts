import type { Rect, SnapshotEnvelope, SurfaceChange, SurfaceChangeListener, SurfaceSnapshot, VisibilityState } from "@perceptual/core";

export interface ObserveOptions {
  root?: Document | Element;
  autoDiscover?: boolean;
  geometryTolerance?: number;
}
export interface BrowserObserver {
  snapshot(): SnapshotEnvelope;
  stop(): void;
  registerSurface(element: Element, surface: Partial<SurfaceSnapshot> & Pick<SurfaceSnapshot, "id" | "concept">): void;
  unregisterSurface(id: string): void;
  watch(listener: SurfaceChangeListener): () => void;
}

const SELECTOR = ["button", "a[href]", "input", "select", "textarea", "dialog", "nav", "main", "aside",
  "header", "footer", "img", "video", "audio", "canvas", "iframe", "[role]", "[data-perceptual-id]",
  "[data-perceptual-concept]"].join(",");
const roleConcept: Record<string, string> = { button: "button", link: "link", textbox: "text-input", combobox: "select",
  dialog: "dialog", navigation: "navigation", main: "main-content", complementary: "aside", banner: "header",
  contentinfo: "footer", img: "image" };
const tagRole: Record<string, string> = { BUTTON: "button", A: "link", INPUT: "textbox", SELECT: "combobox",
  TEXTAREA: "textbox", DIALOG: "dialog", NAV: "navigation", MAIN: "main", ASIDE: "complementary", HEADER: "banner",
  FOOTER: "contentinfo", IMG: "img" };

export function intersectRects(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  return { x, y, width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x),
    height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y) };
}
export function normalizeRect(rect: Rect, width: number, height: number): Rect {
  return { x: width ? rect.x / width : 0, y: height ? rect.y / height : 0,
    width: width ? rect.width / width : 0, height: height ? rect.height / height : 0 };
}
const asRect = (rect: DOMRect | ClientRect): Rect => ({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
const area = (rect: Rect) => Math.max(0, rect.width) * Math.max(0, rect.height);

function accessibleName(element: Element): string | undefined {
  return element.getAttribute("aria-label") || element.getAttribute("alt") ||
    (element.getAttribute("aria-labelledby")?.split(/\s+/).map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" ")) ||
    element.textContent?.trim().replace(/\s+/g, " ").slice(0, 500) || undefined;
}
function isInteractive(element: Element, role?: string) {
  return ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName) || element.hasAttribute("tabindex") ||
    ["button", "link", "textbox", "checkbox", "radio", "combobox", "slider"].includes(role ?? "");
}

export function observe(options: ObserveOptions = {}): BrowserObserver {
  const root = options.root ?? document;
  const win = root.ownerDocument?.defaultView ?? (root as Document).defaultView;
  if (!win) throw new Error("observe() requires a root attached to a Window");
  const explicit = new Map<Element, Partial<SurfaceSnapshot> & Pick<SurfaceSnapshot, "id" | "concept">>();
  const generatedIds = new WeakMap<Element, string>();
  const listeners = new Set<SurfaceChangeListener>();
  let sequence = 0, stopped = false, scheduled = false, previous: SnapshotEnvelope | undefined;

  const elements = () => {
    const discovered = options.autoDiscover === false ? [] : [...root.querySelectorAll(SELECTOR)];
    return [...new Set([...discovered, ...explicit.keys()])];
  };
  const identity = (el: Element) => explicit.get(el)?.id || el.getAttribute("data-perceptual-id") ||
    generatedIds.get(el) || (() => { const id = `surface-${++sequence}`; generatedIds.set(el, id); return id; })();

  const build = (): SnapshotEnvelope => {
    const width = win.innerWidth, height = win.innerHeight;
    const observed = elements(), ids = new Map(observed.map((el) => [el, identity(el)]));
    const surfaces = observed.map((element): SurfaceSnapshot => {
      const given = explicit.get(element), role = given?.role ?? element.getAttribute("role") ?? tagRole[element.tagName];
      const concept = given?.concept ?? element.getAttribute("data-perceptual-concept") ?? roleConcept[role ?? ""] ?? element.tagName.toLowerCase();
      const pixelBounds = asRect(element.getBoundingClientRect());
      let clipBounds = intersectRects(pixelBounds, { x: 0, y: 0, width, height });
      let ancestor = element.parentElement, semanticParent: Element | undefined;
      let ancestorHidden: VisibilityState["hiddenReason"] | undefined;
      while (ancestor) {
        if (!semanticParent && ids.has(ancestor)) semanticParent = ancestor;
        const style = win.getComputedStyle(ancestor);
        if (!ancestorHidden && style.display === "none") ancestorHidden = "display";
        else if (!ancestorHidden && (style.visibility === "hidden" || style.visibility === "collapse")) ancestorHidden = "visibility";
        else if (!ancestorHidden && style.opacity !== "" && Number(style.opacity) === 0) ancestorHidden = "opacity";
        if ([style.overflow, style.overflowX, style.overflowY].some((value) => ["hidden", "clip", "scroll", "auto"].includes(value)))
          clipBounds = intersectRects(clipBounds, asRect(ancestor.getBoundingClientRect()));
        ancestor = ancestor.parentElement;
      }
      const style = win.getComputedStyle(element), total = area(pixelBounds), visibleArea = area(clipBounds);
      let hiddenReason: VisibilityState["hiddenReason"] | undefined;
      if (style.display === "none") hiddenReason = "display";
      else if (style.visibility === "hidden" || style.visibility === "collapse") hiddenReason = "visibility";
      else if (style.opacity !== "" && Number(style.opacity) === 0) hiddenReason = "opacity";
      else if (!total) hiddenReason = "zero-size";
      else if (!visibleArea) hiddenReason = "outside-clip";
      hiddenReason ??= ancestorHidden;
      const fraction = total ? visibleArea / total : 0;
      const parentRect = semanticParent && asRect(semanticParent.getBoundingClientRect());
      const surface: SurfaceSnapshot = { ...given, id: ids.get(element)!, concept, role: role ?? undefined,
        text: given?.text ?? accessibleName(element), state: { ...given?.state, interactive: isInteractive(element, role),
          focused: element === element.ownerDocument.activeElement, disabled: element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true" },
        geometry: { pixelBounds, viewportBounds: normalizeRect(pixelBounds, width, height), clipBounds,
          ...(parentRect && { parentBounds: normalizeRect({ x: pixelBounds.x - parentRect.x, y: pixelBounds.y - parentRect.y,
            width: pixelBounds.width, height: pixelBounds.height }, parentRect.width, parentRect.height) }) },
        visibility: { visible: !hiddenReason, clipped: visibleArea + 0.01 < total, visibleFraction: fraction, ...(hiddenReason && { hiddenReason }) },
        ...(semanticParent && { parentId: ids.get(semanticParent) }) };
      return surface;
    });
    const byId = new Map(surfaces.map((surface) => [surface.id, surface]));
    for (const surface of surfaces) if (surface.parentId) (byId.get(surface.parentId)!.childIds ??= []).push(surface.id);
    return { version: "0.1", timestamp: Date.now(), viewport: { width, height, devicePixelRatio: win.devicePixelRatio },
      environment: { userAgent: win.navigator.userAgent, language: win.navigator.language },
      tolerances: { geometryPixels: options.geometryTolerance ?? 0 }, surfaces };
  };

  const emitChanges = () => {
    scheduled = false; if (stopped) return;
    const next = build(), before = new Map(previous?.surfaces.map((s) => [s.id, s]) ?? []), after = new Map(next.surfaces.map((s) => [s.id, s]));
    const events: SurfaceChange[] = [];
    for (const [id, now] of after) { const old = before.get(id);
      if (!old) events.push({ type: "surface-added", surfaceId: id, snapshot: next });
      else { const a = old.geometry?.pixelBounds, b = now.geometry?.pixelBounds;
        if (a && b && (a.x !== b.x || a.y !== b.y)) events.push({ type: "surface-moved", surfaceId: id, snapshot: next });
        if (a && b && (a.width !== b.width || a.height !== b.height)) events.push({ type: "surface-resized", surfaceId: id, snapshot: next });
        if (old.visibility?.visible !== now.visibility?.visible) events.push({ type: now.visibility?.visible ? "surface-visible" : "surface-hidden", surfaceId: id, snapshot: next });
        if (JSON.stringify(old.state) !== JSON.stringify(now.state)) events.push({ type: "state-changed", surfaceId: id, snapshot: next });
      }}
    for (const id of before.keys()) if (!after.has(id)) events.push({ type: "surface-removed", surfaceId: id, snapshot: next });
    if (previous?.viewport && (previous.viewport.width !== next.viewport?.width || previous.viewport.height !== next.viewport?.height))
      events.push({ type: "viewport-changed", snapshot: next });
    previous = next; for (const event of events) for (const listener of listeners) listener(event);
  };
  const schedule = () => { if (!scheduled && !stopped) { scheduled = true; win.requestAnimationFrame(emitChanges); } };
  const mutation = new win.MutationObserver(schedule); mutation.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
  const resize = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(schedule) : undefined;
  for (const element of elements()) resize?.observe(element);
  for (const event of ["resize", "scroll", "focus", "blur", "input", "change"]) win.addEventListener(event, schedule, true);
  previous = build();

  return {
    snapshot: build,
    registerSurface(element, surface) { explicit.set(element, surface); resize?.observe(element); schedule(); },
    unregisterSurface(id) { for (const [element, value] of explicit) if (value.id === id) { explicit.delete(element); resize?.unobserve(element); } schedule(); },
    watch(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    stop() { stopped = true; mutation.disconnect(); resize?.disconnect(); for (const event of ["resize", "scroll", "focus", "blur", "input", "change"]) win.removeEventListener(event, schedule, true); listeners.clear(); },
  };
}
