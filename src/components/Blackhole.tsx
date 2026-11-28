"use client";

import { useEffect, useState } from "react";
import { onFeature, spiral } from "@/features";
import { useLang } from "@/i18n";

const LASTS = 4600; // in, held, and thrown back out (globals.css times the hole to match)
const STEPS = 12;

/** everything on the screen winds down into a black hole, then is thrown back to its place */
export function Blackhole() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("blackhole", () => setOn(true)), []);
  return on ? <Hole onDone={() => setOn(false)} /> : null;
}

/** the pieces to pull: the largest things on screen that are still small next to it */
function pieces(from: Element, found: HTMLElement[] = []) {
  for (const child of from.children) {
    if (!(child instanceof HTMLElement || child instanceof SVGSVGElement) || child.matches("dialog, script, style, .hole")) continue;
    const box = child.getBoundingClientRect();
    const style = getComputedStyle(child);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const seen = box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
    // a box with no size of its own may still hold things that show
    if (seen && style.display !== "inline" && (box.width * box.height < innerWidth * innerHeight * 0.18 || !child.children.length)) found.push(child as HTMLElement);
    else pieces(child, found);
  }
  return found;
}

function Hole({ onDone }: { onDone: () => void }) {
  const { english } = useLang();

  useEffect(() => {
    const calm = !!document.querySelector("#calm:checked");
    const [cx, cy] = [innerWidth / 2, innerHeight / 2];
    const pulls = calm
      ? []
      : pieces(document.body).slice(0, 120).map((piece) => {
          const box = piece.getBoundingClientRect();
          const [dx, dy] = [cx - box.x - box.width / 2, cy - box.y - box.height / 2];
          const inward = Array.from({ length: STEPS + 1 }, (_, i) => {
            const k = i / STEPS;
            const [x, y] = spiral(k, dx, dy);
            return { offset: k * 0.5, translate: `${x}px ${y}px`, rotate: `${k * k * 540}deg`, scale: `${1 - k}` };
          });
          const home = { translate: "0px 0px", rotate: "720deg", scale: "1" };
          // individual transform properties, so a piece keeps whatever transform it already has
          return piece.animate([...inward, { offset: 0.66, translate: `${dx}px ${dy}px`, rotate: "540deg", scale: "0" }, { offset: 0.9, ...home, scale: "1.08" }, { offset: 1, ...home }], { duration: LASTS, easing: "linear" });
        });
    const done = setTimeout(onDone, calm ? 1800 : LASTS);
    const key = (event: KeyboardEvent) => event.key === "Escape" && onDone();
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(done);
      window.removeEventListener("keydown", key);
      pulls.forEach((pull) => pull.cancel());
    };
  }, [onDone]);

  return (
    <div className="hole" onClick={onDone}>
      <div aria-hidden="true">
        <i />
        <b />
      </div>
      <p role="status">{english ? "Black hole (Esc to escape)" : "หลุมดำ (กด Esc เพื่อหนี)"}</p>
    </div>
  );
}
