"use client";

import { useEffect, useRef, useState } from "react";
import { WARP, warpVeil } from "@/features";

/** pressing a menu link jumps there through a tunnel of light instead of scrolling past everything */
export function Warp() {
  const [to, setTo] = useState<string | null>(null);

  useEffect(() => {
    const pressed = (event: MouseEvent) => {
      // the keyboard, new-tab presses and a stopped page keep the ordinary link
      if (event.button !== 0 || event.detail === 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || document.querySelector("#calm:checked")) return;
      const link = (event.target as Element).closest("header nav a[href^='#'], .dots a[href^='#']");
      if (!link) return;
      event.preventDefault();
      setTo(link.getAttribute("href"));
    };
    document.addEventListener("click", pressed);
    return () => document.removeEventListener("click", pressed);
  }, []);

  return to ? <Tunnel to={to} onDone={() => setTo(null)} /> : null;
}

function Tunnel({ to, onDone }: { to: string; onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const [w, h] = [innerWidth, innerHeight];
    sheet.width = w;
    sheet.height = h;
    const theme = getComputedStyle(document.documentElement);
    const colors = [theme.getPropertyValue("--a2").trim(), theme.getPropertyValue("--a4").trim(), "#ffffff"];
    const reach = Math.hypot(w, h) / 2;
    const stars = Array.from({ length: 170 }, (_, i) => ({ angle: Math.random() * Math.PI * 2, start: 0.04 + Math.random() * 0.7, color: colors[i % colors.length] }));
    let frame = 0;
    let began = 0;
    let jumped = false;
    // aimed again on every frame while hidden, since sections change height as they come into view
    const jump = () => {
      const target = to === "#top" ? null : document.getElementById(to.slice(1));
      // measured by layout, since a section about to animate in is drawn a little off its real place
      let top = target ? -parseFloat(getComputedStyle(target).scrollMarginTop) : 0;
      for (let box = target; box; box = box.offsetParent as HTMLElement | null) top += box.offsetTop;
      window.scrollTo({ top, behavior: "instant" });
      if (!jumped) history.pushState(null, "", to);
      jumped = true;
    };
    const tick = (now: number) => {
      began ||= now;
      const t = (now - began) / WARP.lasts;
      const veil = warpVeil(t);
      pen.clearRect(0, 0, w, h);
      pen.globalAlpha = veil;
      pen.fillStyle = "#050607";
      pen.fillRect(0, 0, w, h);
      for (const star of stars) {
        const near = star.start + t * t * 1.6;
        const far = near + 0.04 + veil * 0.28;
        pen.strokeStyle = star.color;
        pen.lineWidth = 0.6 + near * 2;
        pen.beginPath();
        pen.moveTo(w / 2 + Math.cos(star.angle) * near * reach, h / 2 + Math.sin(star.angle) * near * reach);
        pen.lineTo(w / 2 + Math.cos(star.angle) * far * reach, h / 2 + Math.sin(star.angle) * far * reach);
        pen.stroke();
      }
      if (t >= WARP.jumpAt) jump();
      if (t >= 1) return onDone();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // a page that is not being drawn still has to get there
    const late = setTimeout(() => {
      jump();
      onDone();
    }, WARP.lasts + 600);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(late);
    };
  }, [to, onDone]);

  return <canvas ref={canvas} aria-hidden="true" className="warp" />;
}
