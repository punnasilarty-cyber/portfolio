"use client";

import { useEffect, useRef } from "react";

const PULL = 0.22; // how far a button leans toward the pointer, as a share of the distance from its middle

/** a soft light that follows the mouse, and buttons that lean toward it. Mouse only, and the stop box ends it */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const light = glow.current!;
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
      light.style.transform = `translate(${last.clientX}px, ${last.clientY}px)`;
      light.classList.add("is-on");
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
    const left = () => {
      light.classList.remove("is-on");
      release();
    };
    window.addEventListener("pointermove", moved, { passive: true });
    document.documentElement.addEventListener("pointerleave", left);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", moved);
      document.documentElement.removeEventListener("pointerleave", left);
      release();
    };
  }, []);

  return <div ref={glow} aria-hidden="true" className="cursor-glow" />;
}
