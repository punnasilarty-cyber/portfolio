"use client";

import { useEffect } from "react";

const PULL = 0.22; // how far a button leans toward the pointer, as a share of the distance from its middle

/** buttons lean toward the pointer. Mouse only, and the stop box ends it */
export function ButtonLean() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let last: PointerEvent;
    let held: HTMLElement | null = null;

    const release = () => {
      if (held) held.style.translate = "";
      held = null;
    };
    const draw = () => {
      frame = 0;
      if (document.querySelector("#calm:checked")) return release();
      const button = (last.target as Element).closest<HTMLElement>(".solx-btn-primary, .solx-btn-ghost");
      if (button !== held) release();
      if (!button) return;
      held = button;
      const box = button.getBoundingClientRect();
      // measured without the lean already applied, or the button would chase itself
      const [leanX, leanY] = button.style.translate.split(" ").map((part) => parseFloat(part) || 0);
      const x = last.clientX - (box.x - (leanX || 0) + box.width / 2);
      const y = last.clientY - (box.y - (leanY || 0) + box.height / 2);
      button.style.translate = `${(x * PULL).toFixed(1)}px ${(y * PULL).toFixed(1)}px`;
    };
    const moved = (event: PointerEvent) => {
      last = event;
      frame ||= requestAnimationFrame(draw);
    };
    window.addEventListener("pointermove", moved, { passive: true });
    document.documentElement.addEventListener("pointerleave", release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", moved);
      document.documentElement.removeEventListener("pointerleave", release);
      release();
    };
  }, []);

  return null;
}
