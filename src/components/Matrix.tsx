"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content";
import { foundSecret, onFeature } from "@/features";
import { useLang } from "@/i18n";

const GLYPHS = "アイウエオカキクケコサシスセソタチツテト0123456789<>{}[]=+*#$%";
const RAIN = 3.6; // seconds of rain before the letters gather into the name
const LASTS = 9;

/** code rains down the screen, then gathers into the owner's name */
export function Matrix() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("matrix", () => setOn(true)), []);
  return on ? <Rain onDone={() => setOn(false)} /> : null;
}

function Rain({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    foundSecret("matrix");
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const ratio = Math.min(1.5, window.devicePixelRatio || 1);
    const [w, h] = [window.innerWidth, window.innerHeight];
    sheet.width = w * ratio;
    sheet.height = h * ratio;
    pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    const cell = w < 600 ? 12 : 16;
    const theme = getComputedStyle(document.documentElement);
    const [color, pale] = [theme.getPropertyValue("--a2").trim(), theme.getPropertyValue("--a4").trim()];
    const calm = !!document.querySelector("#calm:checked");
    const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    // the places the name covers, found by writing it once out of sight
    const stencil = document.createElement("canvas");
    stencil.width = w;
    stencil.height = h;
    const ink = stencil.getContext("2d", { willReadFrequently: true })!;
    // two lines, so it stays large on a narrow screen
    const lines = profile.name.toUpperCase().split(" ");
    ink.font = "900 100px Arial Black, Arial, sans-serif";
    const size = Math.min(h / (lines.length + 1), (w * 0.9 * 100) / Math.max(...lines.map((line) => ink.measureText(line).width)));
    ink.font = `900 ${size}px Arial Black, Arial, sans-serif`;
    ink.textAlign = "center";
    ink.textBaseline = "middle";
    lines.forEach((line, i) => ink.fillText(line, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.05));
    const data = ink.getImageData(0, 0, w, h).data;
    const step = cell * 0.6;
    const targets: { x: number; y: number; fromX: number; fromY: number; wait: number; glyph: string }[] = [];
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 128) targets.push({ x, y, fromX: x + (Math.random() - 0.5) * w * 0.5, fromY: -Math.random() * h, wait: Math.random() * 0.9, glyph: pick() });
      }
    }
    const drops = Array.from({ length: Math.ceil(w / cell) }, () => ({ y: -Math.random() * h, pace: 220 + Math.random() * 420 }));

    let frame = 0;
    let began = 0;
    let before = 0;
    const tick = (now: number) => {
      began ||= now;
      const t = calm ? LASTS - 1 : (now - began) / 1000;
      const dt = Math.min(0.05, before ? (now - before) / 1000 : 0);
      before = now;
      // earlier letters fade instead of vanishing, which leaves the tails
      pen.fillStyle = "rgba(3,5,6,0.22)";
      pen.fillRect(0, 0, w, h);
      pen.font = `700 ${cell}px ui-monospace, Consolas, monospace`;
      pen.textAlign = "center";
      const rain = Math.max(0, 1 - Math.max(0, t - RAIN) / 1.6);
      drops.forEach((drop, i) => {
        drop.y += drop.pace * dt;
        if (drop.y > h) drop.y = -Math.random() * h * 0.5;
        if (!rain) return;
        pen.globalAlpha = rain;
        pen.fillStyle = Math.random() < 0.08 ? "#ffffff" : color;
        pen.fillText(pick(), i * cell + cell / 2, drop.y);
      });
      if (t > RAIN) {
        pen.font = `700 ${step * 1.15}px ui-monospace, Consolas, monospace`;
        for (const letter of targets) {
          const k = Math.min(1, Math.max(0, (t - RAIN - letter.wait) / 1.4));
          if (!k) continue;
          const e = 1 - (1 - k) ** 3;
          if (Math.random() < 0.02) letter.glyph = pick();
          pen.globalAlpha = e;
          pen.fillStyle = k < 1 ? color : pale;
          pen.fillText(letter.glyph, letter.fromX + (letter.x - letter.fromX) * e, letter.fromY + (letter.y - letter.fromY) * e);
        }
      }
      pen.globalAlpha = 1;
      if ((now - began) / 1000 > (calm ? 4 : LASTS)) return onDone();
      frame = requestAnimationFrame(tick);
    };
    pen.fillStyle = "#030506";
    pen.fillRect(0, 0, w, h);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // one run from start to end
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={english ? "Code rain" : "ฝนรหัส"} className="matrix">
      <canvas ref={canvas} aria-hidden="true" />
      <p className="sr-only">{profile.name}</p>
      <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-ghost px-4 py-1.5 text-xs">
        {english ? "Close" : "ปิด"} (Esc)
      </button>
    </dialog>
  );
}
