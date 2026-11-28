"use client";

import { useEffect, useRef, useState } from "react";
import { XrayTab, TABS, type Detail, type Tab } from "@/components/XrayTabs";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { PARTS, tree, under, type Box } from "@/xray";
import { kindOf, KINDS } from "@/xray-words";
import { accessOf, boxOf, computedOf, elementAt, htmlOf, layoutOf, mediaOf, named, outlineOf, pageOf, rulesOf } from "@/xray-inspect";

/** a lens over the page that shows what lies behind each part; the page underneath keeps working and scrolling */
export function Xray() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("xray", () => setOn(true)), []);
  return on ? <Lens onDone={() => setOn(false)} /> : null;
}

// the last size takes in the whole screen
const SIZES = [110, 190, 300, Infinity];
const STEP_3D = 22; // how far each layer of nesting stands out from the one below, in pixels

/** reads from the page what the open tab shows */
function read(tab: Tab, element: Element | null, part: Element | null, opened: Set<string>): Detail | null {
  if (tab === "tree") return { tab, rows: outlineOf(opened, element) };
  if (tab === "part") return { tab, inside: part?.querySelectorAll("*").length ?? 0, code: part ? tree(part).join("\n") : "" };
  if (tab === "speed") return { tab };
  if (tab === "code") return { tab };
  if (!element) return null;
  if (tab === "box") return { tab, box: boxOf(element), rows: layoutOf(element) };
  if (tab === "css") return { tab, ...rulesOf(element) };
  if (tab === "computed") return { tab, values: computedOf(element) };
  if (tab === "html") return { tab, ...htmlOf(element), code: tree(element, 4, 40).join("\n") };
  if (tab === "media") return { tab, rows: mediaOf(element) };
  if (tab === "access") return { tab, rows: accessOf(element) };
  return null;
}

function Lens({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const say = (th: string, en: string) => (english ? en : th);
  const glass = useRef<HTMLDivElement>(null);
  const marks = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState<{ kind: number; name: string; path: string; detail: Detail | null }>({ kind: -1, name: "", path: "", detail: null });
  const [tab, setTab] = useState<Tab>("part");
  // counted when its tab is opened, not on every beat
  const [page, setPage] = useState<ReturnType<typeof pageOf> | null>(null);
  // the element being read while held, which the arrows move up and down the tree
  const chosen = useRef<Element | null>(null);
  const [held, setHeld] = useState(false);
  const [size, setSize] = useState(1);
  const [bones, setBones] = useState(true);
  const [spacing, setSpacing] = useState(true);
  const [folded, setFolded] = useState(false);
  const [deep3d, setDeep3d] = useState(false);
  const [rulers, setRulers] = useState(false);
  const [wide, setWide] = useState(false);
  const [film, setFilm] = useState(true);
  const opened = useRef(new Set<string>());
  const pick = useRef<(at: string) => void>(() => {});
  // read by the drawing, which is set up only once per language
  const options = useRef({ held, size, bones, spacing, tab, deep3d, rulers, film });
  const redraw = useRef(() => {});
  const step = useRef<(way: "up" | "down") => void>(() => {});
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
    if (!held) chosen.current = null;
    options.current = { held, size, bones, spacing, tab, deep3d, rulers, film };
    redraw.current();
  });

  useEffect(() => {
    // where the lens is; it stays there while held, and the page may still scroll under it
    let x = innerWidth > 900 ? innerWidth * 0.36 : innerWidth / 2;
    let y = innerHeight * 0.4;
    let frame = 0;
    let last = "";
    const draw = () => {
      frame = 0;
      // the three-dimensional view needs the room of the whole screen
      const whole = options.current.deep3d || SIZES[options.current.size] === Infinity;
      const radius = whole ? 190 : Math.min(SIZES[options.current.size], innerWidth * 0.46);
      // every part now on screen, measured afresh: the page scrolls and moves beneath the lens
      const seen = PARTS.flatMap((part, kind) =>
        Array.from(document.querySelectorAll(part.find), (element) => ({ kind, element, box: element.getBoundingClientRect() })).filter(
          ({ box }) => box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight,
        ),
      );
      const mark = (box: Box, name: string, look = "") => {
        const outline = document.createElement("i");
        Object.assign(outline.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px` });
        outline.dataset.name = name;
        if (look) outline.className = look;
        return outline;
      };
      const shapes: HTMLElement[] = seen.map(({ kind, box }) => mark(box, PARTS[kind][english ? "en" : "th"][0]));
      const hit = under(seen.map(({ box }) => box), x, y);
      if (hit >= 0) {
        shapes[hit].classList.add("is-under");
        // the bones of this part: every element it is built from (enough of them to read)
        for (const child of options.current.bones ? Array.from(seen[hit].element.querySelectorAll("*")).slice(0, 140) : []) {
          const small = child.getBoundingClientRect();
          if (small.width < 4 || small.height < 4) continue;
          const written = Array.from(child.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent)
            .join("")
            .trim();
          const bone = mark(small, small.width > 54 && small.height > 14 ? `<${child.localName}>` : "", "is-bone");
          bone.style.setProperty("--kind", KINDS[kindOf(child.localName, !!written)].colour);
          // on the film the words themselves show through, as bones would
          if (options.current.film && written) {
            const words = document.createElement("span");
            words.textContent = written.slice(0, 160);
            words.style.font = getComputedStyle(child).font;
            bone.append(words);
          }
          shapes.push(bone);
        }
      }
      const below = document.elementsFromPoint(x, y).find((element) => !element.closest(".xray") && element !== document.documentElement && element !== document.body);
      const deepest = chosen.current?.isConnected ? chosen.current : below;
      if (options.current.held && deepest) chosen.current = deepest;
      if (deepest) {
        const box = deepest.getBoundingClientRect();
        if (options.current.spacing) {
          const style = getComputedStyle(deepest);
          const px = (value: string) => Math.max(0, parseFloat(value) || 0);
          const [top, right, bottom, left] = [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(px);
          // the room around it (margin) and the room inside it (padding), as thick coloured edges
          const outer = mark({ x: box.x - left, y: box.y - top, width: box.width + left + right, height: box.height + top + bottom }, "", "is-margin");
          outer.style.borderWidth = `${top}px ${right}px ${bottom}px ${left}px`;
          const inner = mark(box, "", "is-padding");
          inner.style.borderWidth = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].join(" ");
          shapes.push(outer, inner);
        }
        shapes.push(mark(box, "", "is-deep"));
        const tag = document.createElement("code");
        tag.textContent = `<${named(deepest)}>\n${Math.round(box.width)} × ${Math.round(box.height)} px`;
        Object.assign(tag.style, { left: `${x}px`, top: `${y + radius * 0.55}px` });
        const cross = document.createElement("s");
        Object.assign(cross.style, { left: `${x}px`, top: `${y}px` });
        shapes.push(tag, cross);
      }
      if (deepest && options.current.rulers && !options.current.deep3d) {
        // lines along its edges across the screen, and how far it stands from the sides of what holds it
        const box = deepest.getBoundingClientRect();
        const outer = (deepest.parentElement ?? document.body).getBoundingClientRect();
        const rule = (look: string, place: Partial<CSSStyleDeclaration>, name = "") => {
          const line = document.createElement("u");
          line.className = look;
          line.dataset.name = name;
          Object.assign(line.style, place);
          shapes.push(line);
        };
        for (const top of [box.top, box.bottom]) rule("is-across", { top: `${top}px` });
        for (const left of [box.left, box.right]) rule("is-down", { left: `${left}px` });
        const middle = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const gap = (from: number, to: number, across: boolean) => {
          const length = Math.round(to - from);
          if (length < 1) return;
          rule(across ? "is-gap-across" : "is-gap-down", across ? { left: `${from}px`, top: `${middle.y}px`, width: `${to - from}px` } : { left: `${middle.x}px`, top: `${from}px`, height: `${to - from}px` }, String(length));
        };
        gap(outer.left, box.left, true);
        gap(box.right, outer.right, true);
        gap(outer.top, box.top, false);
        gap(box.bottom, outer.bottom, false);
      }
      const stage = marks.current!;
      if (options.current.deep3d) {
        // every element on screen, each layer of nesting lifted further out, the whole turned by the pointer
        const layers: HTMLElement[] = [];
        for (const element of Array.from(document.body.getElementsByTagName("*"))) {
          if (layers.length >= 450) break;
          if (element.closest(".xray")) continue;
          const box = element.getBoundingClientRect();
          if (box.width < 14 || box.height < 10 || box.bottom < 0 || box.top > innerHeight || box.right < 0 || box.left > innerWidth) continue;
          let depth = 0;
          for (let at = element.parentElement; at && at !== document.body; at = at.parentElement) depth++;
          const layer = mark(box, element === deepest ? named(element) : "", element === deepest ? "is-layer is-chosen" : "is-layer");
          layer.style.transform = `translateZ(${(depth - 4) * STEP_3D}px)`;
          layer.style.setProperty("--hue", String((190 + depth * 24) % 360));
          layers.push(layer);
        }
        stage.replaceChildren(...layers);
        stage.style.transform = `perspective(1600px) scale(0.8) rotateX(${(0.5 - y / innerHeight) * 50 + 8}deg) rotateY(${(x / innerWidth - 0.5) * 70}deg)`;
      } else {
        stage.replaceChildren(...shapes);
        stage.style.transform = "";
      }
      stage.className = options.current.deep3d ? "is-3d" : "";
      glass.current!.classList.toggle("is-film", options.current.film && !options.current.deep3d);
      const path: string[] = [];
      for (let at: Element | null = deepest ?? null; at && at !== document.documentElement; at = at.parentElement) path.unshift(named(at));
      const next = {
        kind: hit < 0 ? -1 : seen[hit].kind,
        name: deepest ? named(deepest) : "",
        path: path.slice(-5).join(" › "),
        detail: read(options.current.tab, deepest ?? null, hit < 0 ? null : seen[hit].element, opened.current),
      };
      const words = JSON.stringify(next);
      if (words !== last) {
        last = words;
        setFound(next);
      }
      glass.current!.style.clipPath = whole ? "none" : `circle(${radius}px at ${x}px ${y}px)`;
      ring.current!.hidden = whole;
      Object.assign(ring.current!.style, { left: `${x - radius}px`, top: `${y - radius}px`, width: `${radius * 2}px`, height: `${radius * 2}px` });
    };
    const ask = () => {
      frame ||= requestAnimationFrame(draw);
    };
    redraw.current = ask;
    step.current = (way) => {
      const from = chosen.current ?? document.elementsFromPoint(x, y).find((element) => !element.closest(".xray"));
      const to = way === "up" ? from?.parentElement : from?.firstElementChild;
      if (!to || to === document.documentElement || to === document.body) return;
      chosen.current = to;
      options.current.held = true;
      setHeld(true);
      ask();
    };
    // a row of the tree: the lens goes there and holds
    pick.current = (at) => {
      const element = elementAt(at);
      if (!element) return;
      element.scrollIntoView({ block: "center", behavior: "instant" });
      const box = element.getBoundingClientRect();
      if (box.width) [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
      chosen.current = element;
      options.current.held = true;
      setHeld(true);
      ask();
    };
    const move = (target: EventTarget | null, toX: number, toY: number) => {
      // not while held, nor while the pointer is busy with the panel
      if (options.current.held || (target instanceof Element && target.closest(".xray-panel"))) return;
      [x, y] = [toX, toY];
      ask();
    };
    const point = (event: PointerEvent) => move(event.target, event.clientX, event.clientY);
    // a finger dragging to scroll cancels pointer events, so touches are followed on their own
    const touch = (event: TouchEvent) => move(event.target, event.touches[0].clientX, event.touches[0].clientY);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") done.current();
      else if (event.code === "KeyF" && !event.ctrlKey && !event.metaKey && !(event.target instanceof Element && event.target.closest("input, textarea"))) setHeld((now) => !now);
    };
    draw();
    addEventListener("pointermove", point, { passive: true });
    addEventListener("pointerdown", point, { passive: true });
    addEventListener("touchmove", touch, { passive: true });
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    addEventListener("keydown", key);
    // parts that slide or tilt on their own are followed too
    const beat = setInterval(ask, 250);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(beat);
      removeEventListener("pointermove", point);
      removeEventListener("pointerdown", point);
      removeEventListener("touchmove", touch);
      removeEventListener("scroll", ask);
      removeEventListener("resize", ask);
      removeEventListener("keydown", key);
    };
  }, [english]);

  const part = PARTS[found.kind];
  const words = part?.[english ? "en" : "th"];
  const detail: Detail | null = tab === "page" ? page && { tab: "page", page } : found.detail?.tab === tab ? found.detail : null;
  const toggle = (label: string, pressed: boolean, press: () => void) => (
    <button type="button" aria-pressed={pressed} onClick={press}>
      {label}
    </button>
  );
  return (
    <div className="xray">
      <div ref={glass} className="xray-glass" aria-hidden="true">
        <div ref={marks} />
      </div>
      <div ref={ring} className={held ? "xray-ring is-held" : "xray-ring"} aria-hidden="true" />
      <aside className={`xray-panel${folded ? " is-folded" : ""}${wide ? " is-wide" : ""}`} aria-label={say("ผลการส่อง", "What the lens sees")}>
        <header>
          <b>{words ? words[0] : say("แว่น X-ray", "X-ray lens")}</b>
          <button type="button" aria-expanded={!folded} onClick={() => setFolded(!folded)}>
            {folded ? say("กาง", "Open") : say("ย่อ", "Fold")}
          </button>
          <button type="button" onClick={onDone} className="xray-close">
            {say("ปิด", "Close")}
          </button>
        </header>
        <div className="xray-keys">
          {toggle(say("ตรึง (F)", "Hold (F)"), held, () => setHeld(!held))}
          {toggle(say("โครงสร้าง", "Bones"), bones, () => setBones(!bones))}
          {toggle(say("ระยะห่าง", "Spacing"), spacing, () => setSpacing(!spacing))}
          {toggle(say("ฟิล์ม", "Film"), film, () => setFilm(!film))}
          {toggle(say("ไม้บรรทัด", "Rulers"), rulers, () => setRulers(!rulers))}
          {toggle(say("3 มิติ", "3D"), deep3d, () => setDeep3d(!deep3d))}
          <button type="button" onClick={() => setSize((size + 1) % SIZES.length)}>
            {say("แว่น", "Lens")} {["S", "M", "L", say("เต็มจอ", "Full")][size]}
          </button>
          <button type="button" aria-pressed={wide} onClick={() => setWide(!wide)} className="xray-widen">
            {say("แผงกว้าง", "Wide")}
          </button>
        </div>
        <ul className="xray-legend" aria-label={say("สีในแว่น", "Colours in the lens")}>
          {Object.values(KINDS).map((kind) => (
            <li key={kind.en}>
              <i style={{ background: kind.colour }} />
              {kind[english ? "en" : "th"]}
            </li>
          ))}
        </ul>
        <div role="tablist" className="xray-tabs">
          {TABS.map((each) => (
            <button
              key={each.id}
              type="button"
              role="tab"
              aria-selected={tab === each.id}
              onClick={() => {
                setTab(each.id);
                setFolded(false);
                if (each.id === "page") setPage(pageOf());
              }}
            >
              {each[english ? "en" : "th"]}
            </button>
          ))}
        </div>
        <div className="xray-body" role="tabpanel">
          {!["page", "part", "tree", "code", "speed"].includes(tab) && found.name && (
            <div className="xray-at">
              <p>
                <code>{found.name}</code>
                <button type="button" onClick={() => step.current("up")} title={say("ขึ้นไปชั้นนอก", "Out to the parent")}>
                  ↑ {say("ชั้นนอก", "Out")}
                </button>
                <button type="button" onClick={() => step.current("down")} title={say("ลงไปชั้นใน", "In to the first child")}>
                  ↓ {say("ชั้นใน", "In")}
                </button>
              </p>
              <p className="xray-path">{found.path}</p>
            </div>
          )}
          <XrayTab
            detail={detail}
            part={part}
            name={found.name}
            english={english}
            onPick={(at) => pick.current(at)}
            onToggle={(at) => {
              // the way to the chosen element is always open, so letting go of it is what closes that branch
              if (!opened.current.delete(at)) opened.current.add(at);
              redraw.current();
            }}
          />
        </div>
      </aside>
    </div>
  );
}
