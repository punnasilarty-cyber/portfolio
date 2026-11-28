// สิ่งที่แว่น X-ray อ่านจากหน้าเว็บจริง: กฎ CSS ที่ตรงกับชิ้นนั้น โค้ด HTML การเข้าถึง สื่อ การเคลื่อนไหว
// และภาพรวมของทั้งหน้า ทุกค่ามาจากเบราว์เซอร์ ไม่มีค่าที่พิมพ์ไว้เอง

import { branches, contrast, hex, nameOf, openTag, rgba, specificity, stateless } from "@/xray";

export const named = (element: Element) => nameOf(element.localName, element.id, Array.from(element.classList));
const round = (value: number) => Math.round(value * 10) / 10;
const sizeOf = (element: Element) => {
  const box = element.getBoundingClientRect();
  return `${Math.round(box.width)} × ${Math.round(box.height)} px`;
};

/** one line of a table: a label in both languages and its value; empty values are left out */
export type Row = [th: string, en: string, value: string];
const filled = (rows: Row[]) => rows.filter(([, , value]) => value !== "");
/** a computed value, unless it is the one everything has anyway */
const unless = (value: string, ...usual: string[]) => (usual.includes(value) ? "" : value);

/** the room an element takes: margin, border, padding and what is left for its content, as top right bottom left */
export function boxOf(element: Element) {
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  const four = (name: (side: string) => string) => ["top", "right", "bottom", "left"].map((side) => round(parseFloat(style.getPropertyValue(name(side))) || 0));
  const margin = four((side) => `margin-${side}`);
  const border = four((side) => `border-${side}-width`);
  const padding = four((side) => `padding-${side}`);
  return {
    margin,
    border,
    padding,
    content: `${Math.max(0, Math.round(box.width - border[1] - border[3] - padding[1] - padding[3]))} × ${Math.max(0, Math.round(box.height - border[0] - border[2] - padding[0] - padding[2]))}`,
  };
}

export function layoutOf(element: Element): Row[] {
  const s = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  const flex = s.display.includes("flex");
  const grid = s.display.includes("grid");
  const text = Array.from(element.childNodes).some((node) => node.nodeType === 3 && node.textContent?.trim());
  return filled([
    ["ขนาด", "Size", sizeOf(element)],
    ["ตำแหน่ง", "Place", `x ${Math.round(box.x)}, y ${Math.round(box.y + scrollY)} · ${s.position}`],
    ["การจัดวาง", "Display", s.display],
    ["ทิศ flex", "Direction", flex ? s.flexDirection : ""],
    ["จัดแนวหลัก", "Justify", flex || grid ? unless(s.justifyContent, "normal") : ""],
    ["จัดแนวขวาง", "Align", flex || grid ? unless(s.alignItems, "normal") : ""],
    ["คอลัมน์", "Columns", grid ? unless(s.gridTemplateColumns, "none") : ""],
    ["ช่องว่าง", "Gap", flex || grid ? unless(s.gap, "normal") : ""],
    ["ลำดับชั้น z", "z-index", unless(s.zIndex, "auto")],
    ["ส่วนที่ล้น", "Overflow", unless(s.overflow, "visible")],
    ["ความทึบ", "Opacity", unless(s.opacity, "1")],
    ["มุมโค้ง", "Corners", unless(s.borderRadius, "0px")],
    ["เส้นขอบ", "Border", parseFloat(s.borderTopWidth) ? `${s.borderTopWidth} ${s.borderTopStyle} ${hex(s.borderTopColor)}` : ""],
    ["เงา", "Shadow", unless(s.boxShadow, "none")],
    ["การแปลง", "Transform", unless(s.transform, "none")],
    ["ฟิลเตอร์", "Filter", unless(s.filter, "none")],
    ["เคอร์เซอร์", "Cursor", unless(s.cursor, "auto")],
    ["ตัวอักษร", "Font", text ? s.fontFamily.split(",")[0].replaceAll('"', "") : ""],
    ["ขนาด / น้ำหนัก", "Size / weight", text ? `${s.fontSize} / ${s.fontWeight}` : ""],
    ["ความสูงบรรทัด", "Line height", text ? unless(s.lineHeight, "normal") : ""],
    ["ระยะตัวอักษร", "Letter spacing", text ? unless(s.letterSpacing, "normal") : ""],
    ["สีตัวอักษร", "Text colour", text ? hex(s.color) : ""],
    ["สีพื้น", "Background", hex(s.backgroundColor)],
    ["ภาพพื้น", "Backdrop", unless(s.backgroundImage, "none").slice(0, 120)],
  ]);
}

export interface Rule {
  selector: string;
  body: string;
  /** the screen or feature condition it sits under */
  when: string;
  /** ids, classes, tags — empty for what is written on the element itself */
  weight: string;
}

/** every style rule of the site, with the conditions that hold now */
function eachRule(visit: (rule: CSSStyleRule, when: string) => void, frames?: Map<string, string>) {
  const walk = (list: CSSRuleList, when: string) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) visit(rule, when);
      else if (rule instanceof CSSMediaRule) {
        if (matchMedia(rule.media.mediaText).matches) walk(rule.cssRules, `@media ${rule.media.mediaText}`);
      } else if (rule instanceof CSSKeyframesRule) frames?.set(rule.name, rule.cssText);
      else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, when);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, "");
    } catch {
      // a sheet from elsewhere may not be read
    }
  }
}

const matches = (element: Element, selector: string) => {
  try {
    return element.matches(selector);
  } catch {
    // a selector this browser cannot test
    return false;
  }
};

/**
 * What the style sheets say about this element: the rules reaching it now (last written first), those waiting for a
 * state such as hover, those drawing its ::before and ::after, the variables they use and the animations they play.
 */
export function rulesOf(element: Element, most = 40) {
  const now: Rule[] = [];
  const waiting: Rule[] = [];
  const drawn: Rule[] = [];
  const frames = new Map<string, string>();
  eachRule((rule, when) => {
    if (!rule.style.length) return;
    const all = branches(rule.selectorText);
    const take = (list: Rule[], selector: string) => list.push({ selector: rule.selectorText, body: rule.style.cssText, when, weight: specificity(selector).join(", ") });
    const direct = all.find((one) => matches(element, one));
    if (direct) return take(now, direct);
    for (const one of all) {
      const pseudo = /::?(before|after|backdrop|placeholder|marker)$/.exec(one);
      if (pseudo) {
        if (matches(element, stateless(one.slice(0, pseudo.index) || "*").plain)) return take(drawn, one);
        continue;
      }
      const { plain, states } = stateless(one);
      if (states.length && matches(element, plain)) return take(waiting, one);
    }
  }, frames);
  const inline = element.getAttribute("style");
  const rules = now.reverse();
  if (inline) rules.unshift({ selector: 'style="…"', body: inline, when: "", weight: "" });
  const style = getComputedStyle(element);
  const named = [...new Set([...rules, ...waiting, ...drawn].flatMap((rule) => Array.from(rule.body.matchAll(/var\((--[\w-]+)/g), (found) => found[1])))];
  return {
    total: rules.length,
    rules: rules.slice(0, most),
    waiting: waiting.reverse().slice(0, 16),
    drawn: drawn.reverse().slice(0, 12),
    variables: named.map((name) => [name, style.getPropertyValue(name).trim()] as [string, string]).filter(([, value]) => value),
    frames: style.animationName
      .split(",")
      .map((name) => frames.get(name.trim()))
      .filter((text): text is string => !!text),
  };
}

/** every property the browser has worked out for this element */
export function computedOf(element: Element): [string, string][] {
  const style = getComputedStyle(element);
  return Array.from(style)
    .filter((name) => !name.startsWith("--"))
    .map((name) => [name, style.getPropertyValue(name)]);
}

/** the handlers React has put on this element */
export function eventsOf(element: Element): string[] {
  const key = Object.keys(element).find((each) => each.startsWith("__reactProps"));
  const props = key ? ((element as unknown as Record<string, Record<string, unknown>>)[key] ?? {}) : {};
  return Object.keys(props).filter((name) => /^on[A-Z]/.test(name) && typeof props[name] === "function");
}

/** the way to this element from the top, as a selector that finds it again */
export function selectorOf(element: Element): string {
  const steps: string[] = [];
  for (let at: Element | null = element; at && at !== document.body; at = at.parentElement) {
    if (at.id) {
      steps.unshift(`#${CSS.escape(at.id)}`);
      return steps.join(" > ");
    }
    const alike = Array.from(at.parentElement?.children ?? []).filter((each) => each.localName === at!.localName);
    steps.unshift(alike.length > 1 ? `${at.localName}:nth-of-type(${alike.indexOf(at) + 1})` : at.localName);
  }
  return ["body", ...steps].join(" > ");
}

export interface Leaf {
  /** which child at each step down from the body, as "0.2.1" */
  at: string;
  label: string;
  depth: number;
  children: number;
  open: boolean;
  chosen: boolean;
}

const inside = (element: Element) => Array.from(element.children).filter((child) => !child.classList.contains("xray") && !["script", "style"].includes(child.localName));

export function elementAt(at: string): Element | null {
  return at.split(".").filter(Boolean).reduce<Element | null>((element, i) => (element ? (inside(element)[Number(i)] ?? null) : null), document.body);
}

/** the whole page as a tree: the branches opened by hand, and always the way down to the chosen element */
export function outlineOf(opened: Set<string>, chosen: Element | null, most = 400): Leaf[] {
  const rows: Leaf[] = [];
  const walk = (element: Element, at: string, depth: number) => {
    if (rows.length >= most) return;
    const children = inside(element);
    const open = !at || opened.has(at) || (!!chosen && element !== chosen && element.contains(chosen));
    rows.push({ at, label: named(element), depth, children: children.length, open, chosen: element === chosen });
    if (open) children.forEach((child, i) => walk(child, at ? `${at}.${i}` : String(i), depth + 1));
  };
  walk(document.body, "", 0);
  return rows;
}

/** the element as written in the page: its opening tag, and the words directly in it */
export function htmlOf(element: Element) {
  return {
    // what has been typed into a field is never shown
    tag: openTag(element.localName, Array.from(element.attributes, ({ name, value }) => [name, name === "value" ? "…" : value])),
    events: eventsOf(element),
    selector: selectorOf(element),
    text: Array.from(element.childNodes)
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join(" ")
      .slice(0, 200),
  };
}

const ROLES: Record<string, string> = { a: "link", button: "button", img: "image", nav: "navigation", main: "main", header: "banner", footer: "contentinfo", ul: "list", ol: "list", li: "listitem", dialog: "dialog", h1: "heading 1", h2: "heading 2", h3: "heading 3", h4: "heading 4", input: "textbox", canvas: "canvas", figure: "figure", section: "region" };

/** how someone using a keyboard or a screen reader meets this element, and how readable its words are */
export function accessOf(element: Element): Row[] {
  const s = getComputedStyle(element);
  const label = element.getAttribute("aria-label") ?? element.getAttribute("alt") ?? element.textContent?.trim() ?? "";
  const hidden = !!element.closest("[aria-hidden='true']");
  // the first solid colour behind it; pictures and gradients behind are not counted
  let behind = null;
  for (let at: Element | null = element; at && !behind; at = at.parentElement) {
    const colour = rgba(getComputedStyle(at).backgroundColor);
    if (colour && colour[3] > 0.9) behind = colour;
  }
  const words = Array.from(element.childNodes).some((node) => node.nodeType === 3 && node.textContent?.trim());
  const ink = rgba(s.color);
  const ratio = words && ink && behind && ink[3] > 0.9 ? contrast(ink, behind) : 0;
  const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
  return filled([
    ["บทบาท", "Role", element.getAttribute("role") ?? ROLES[element.localName] ?? "generic"],
    ["ชื่อที่อ่านออกเสียง", "Spoken name", hidden ? "" : label.slice(0, 120)],
    ["ซ่อนจากโปรแกรมอ่านจอ", "Hidden from readers", hidden ? "✓" : ""],
    ["โฟกัสด้วยคีย์บอร์ด", "Keyboard focus", (element as HTMLElement).tabIndex >= 0 ? `✓ tabindex ${(element as HTMLElement).tabIndex}` : "—"],
    ["คุณสมบัติ ARIA", "ARIA", Array.from(element.attributes).filter((each) => each.name.startsWith("aria-")).map((each) => `${each.name}="${each.value.slice(0, 40)}"`).join(" ")],
    ["ความต่างสี", "Contrast", ratio ? `${ratio.toFixed(2)} : 1` : ""],
    ["ผ่านเกณฑ์ WCAG AA", "Passes WCAG AA", ratio ? (ratio >= (large ? 3 : 4.5) ? "✓" : "✗") + ` (≥ ${large ? 3 : 4.5})` : ""],
  ]);
}

/** pictures, drawings and movement inside this element */
export function mediaOf(element: Element): Row[] {
  const rows: Row[] = [];
  const all = [element, ...Array.from(element.querySelectorAll("img, canvas, svg"))];
  for (const each of all.slice(0, 8)) {
    if (each instanceof HTMLImageElement && each.currentSrc) {
      const file = performance.getEntriesByName(each.currentSrc)[0] as PerformanceResourceTiming | undefined;
      rows.push(["รูปภาพ", "Picture", [decodeURIComponent(each.currentSrc.split("/").pop()!.split("?")[0]).slice(-40), `${each.naturalWidth} × ${each.naturalHeight} → ${sizeOf(each)}`, file?.decodedBodySize ? `${Math.round(file.decodedBodySize / 1024)} KB` : ""].filter(Boolean).join(" · ")]);
    } else if (each instanceof HTMLCanvasElement) rows.push(["ผืนวาด", "Canvas", `${each.width} × ${each.height} → ${sizeOf(each)}`]);
    else if (each instanceof SVGSVGElement) rows.push(["ภาพ SVG", "SVG", `${sizeOf(each)} · ${each.querySelectorAll("*").length} shapes · viewBox ${each.getAttribute("viewBox") ?? "—"}`]);
  }
  for (const motion of element.getAnimations({ subtree: true }).slice(0, 10)) {
    const timing = motion.effect?.getComputedTiming();
    const target = (motion.effect as KeyframeEffect | null)?.target;
    const name = (motion as CSSAnimation).animationName ?? (motion as CSSTransition).transitionProperty ?? "script";
    const length = Number(timing?.duration) || 0;
    rows.push(["การเคลื่อนไหว", "Motion", `${name} · ${round(length / 1000)} s${timing?.iterations === Infinity ? " · ∞" : ""} · ${motion.playState}${target ? ` · ${named(target)}` : ""}`]);
  }
  return rows;
}

/** the whole page: its size, its heaviest files, the typefaces in use and the colours seen most */
export function pageOf() {
  const all = Array.from(document.body.getElementsByTagName("*")).filter((element) => !element.closest(".xray"));
  const files = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  let deepest = 0;
  const colours = new Map<string, number>();
  for (const element of all) {
    let depth = 0;
    for (let at: Element | null = element; at; at = at.parentElement) depth++;
    deepest = Math.max(deepest, depth);
  }
  // enough of the page to know its palette, without weighing on it
  for (const element of all.slice(0, 1500)) {
    const s = getComputedStyle(element);
    for (const colour of [hex(s.color), hex(s.backgroundColor)]) if (/^#[0-9a-f]{6}$/.test(colour)) colours.set(colour, (colours.get(colour) ?? 0) + 1);
  }
  const count = (tag: string) => all.filter((element) => element.localName === tag).length;
  const heavy = [...files].sort((a, b) => b.decodedBodySize - a.decodedBodySize).slice(0, 10);
  const loaded = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const rows: Row[] = [
    ["ชิ้นส่วน (element)", "Elements", String(all.length)],
    ["ซ้อนลึกสุด", "Deepest nesting", String(deepest)],
    ["canvas / svg / img", "canvas / svg / img", `${count("canvas")} / ${count("svg")} / ${count("img")}`],
    ["ปุ่ม / ลิงก์", "Buttons / links", `${count("button")} / ${count("a")}`],
    ["ไฟล์ที่โหลด", "Files loaded", `${files.length} · ${Math.round(files.reduce((sum, file) => sum + file.decodedBodySize, 0) / 1024).toLocaleString("en-US")} KB`],
    ["หน้าพร้อมใช้ใน", "Page ready in", loaded?.domContentLoadedEventEnd ? `${Math.round(loaded.domContentLoadedEventEnd).toLocaleString("en-US")} ms` : ""],
    ["จอ", "Screen", `${innerWidth} × ${innerHeight} · ×${round(devicePixelRatio)}`],
  ];
  return {
    rows: filled(rows),
    files: heavy.map((file) => ({ name: decodeURIComponent(file.name.split("/").pop()!.split("?")[0]).slice(-34) || file.name, kilobytes: Math.round(file.decodedBodySize / 1024) })),
    fonts: [...new Set(Array.from(document.fonts).filter((font) => font.status === "loaded").map((font) => `${font.family.replaceAll('"', "")} ${font.weight}`))],
    colours: [...colours].sort((a, b) => b[1] - a[1]).slice(0, 10),
  };
}
