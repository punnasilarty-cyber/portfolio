"use client";

import { useEffect, useRef, useState } from "react";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { advance, MAX_PLANETS, MAX_STARS, sample, STAR_RADIUS, type Planet, type Star } from "@/universe";

const FLING = 1.6; // how fast a planet leaves for each pixel dragged
const PRESS = 8; // a movement shorter than this is a press, not a drag

/** a pocket universe: press to place a star, drag to throw a planet, and watch gravity do the rest */
export function Universe() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("universe", () => setOn(true)), []);
  return on ? <Space onDone={() => setOn(false)} /> : null;
}

function Space({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // with animation stopped it waits to be started
  const [paused, setPaused] = useState(() => !!document.querySelector("#calm:checked"));
  const [count, setCount] = useState({ stars: 0, planets: 0 });
  const held = useRef(paused);
  const reset = useRef<(withSample: boolean) => void>(() => {});
  useEffect(() => {
    held.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const [w, h] = [sheet.clientWidth, sheet.clientHeight];
    const ratio = Math.min(1.5, window.devicePixelRatio || 1);
    sheet.width = w * ratio;
    sheet.height = h * ratio;
    pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    let stars: Star[] = [];
    let planets: Planet[] = [];
    let aim: { id: number; x: number; y: number; toX: number; toY: number } | null = null;
    let shown = "";
    let frame = 0;
    let before = 0;

    reset.current = (withSample) => {
      ({ stars, planets } = withSample ? sample(w, h) : { stars: [], planets: [] });
    };
    reset.current(true);

    const point = (event: PointerEvent) => {
      const box = sheet.getBoundingClientRect();
      return [event.clientX - box.x, event.clientY - box.y] as const;
    };
    const down = (event: PointerEvent) => {
      if (aim) return;
      const [x, y] = point(event);
      aim = { id: event.pointerId, x, y, toX: x, toY: y };
      sheet.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (aim?.id !== event.pointerId) return;
      [aim.toX, aim.toY] = point(event);
    };
    const up = (event: PointerEvent) => {
      if (aim?.id !== event.pointerId) return;
      const [dx, dy] = [aim.toX - aim.x, aim.toY - aim.y];
      if (Math.hypot(dx, dy) < PRESS) {
        if (stars.length < MAX_STARS) stars.push({ x: aim.x, y: aim.y, mass: 1 });
      } else {
        if (planets.length >= MAX_PLANETS) planets.shift();
        planets.push({ x: aim.x, y: aim.y, vx: dx * FLING, vy: dy * FLING, hue: Math.floor(Math.random() * 360), trail: [] });
      }
      aim = null;
    };
    const cancel = () => (aim = null);

    const tick = (now: number) => {
      const dt = Math.min(0.033, before ? (now - before) / 1000 : 0);
      before = now;
      if (!held.current && dt) planets = advance(stars, planets, dt, w, h);
      pen.fillStyle = "#04050a";
      pen.fillRect(0, 0, w, h);
      pen.fillStyle = "#ffffff55";
      for (let i = 0; i < 90; i++) pen.fillRect((i * 137.5) % w, (i * 89.3 + i * i * 7) % h, 1.4, 1.4);
      for (const star of stars) {
        const glow = pen.createRadialGradient(star.x, star.y, 2, star.x, star.y, STAR_RADIUS * 4);
        glow.addColorStop(0, "#fff7d6");
        glow.addColorStop(0.28, "#fbbf24");
        glow.addColorStop(1, "rgba(251,191,36,0)");
        pen.fillStyle = glow;
        pen.beginPath();
        pen.arc(star.x, star.y, STAR_RADIUS * 4, 0, Math.PI * 2);
        pen.fill();
      }
      for (const planet of planets) {
        pen.strokeStyle = `hsla(${planet.hue}, 90%, 70%, 0.45)`;
        pen.lineWidth = 2;
        pen.beginPath();
        planet.trail.forEach(([x, y], i) => (i ? pen.lineTo(x, y) : pen.moveTo(x, y)));
        pen.stroke();
        pen.fillStyle = `hsl(${planet.hue}, 90%, 72%)`;
        pen.beginPath();
        pen.arc(planet.x, planet.y, 5, 0, Math.PI * 2);
        pen.fill();
      }
      if (aim) {
        pen.strokeStyle = "#ffffff";
        pen.setLineDash([6, 6]);
        pen.beginPath();
        pen.moveTo(aim.x, aim.y);
        pen.lineTo(aim.toX, aim.toY);
        pen.stroke();
        pen.setLineDash([]);
      }
      const next = `${stars.length} ${planets.length}`;
      if (next !== shown) {
        shown = next;
        setCount({ stars: stars.length, planets: planets.length });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    sheet.addEventListener("pointerdown", down);
    sheet.addEventListener("pointermove", move);
    sheet.addEventListener("pointerup", up);
    sheet.addEventListener("pointercancel", cancel);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={english ? "Rule the universe" : "ควบคุมจักรวาล"} className="universe">
      <header>
        <p>
          <b>{english ? "Rule the universe" : "ควบคุมจักรวาล"}</b>
          <span>{english ? "Press: place a star · Drag and let go: throw a planet" : "แตะ: วางดาวฤกษ์ · ลากแล้วปล่อย: เหวี่ยงดาวเคราะห์"}</span>
        </p>
        <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          {english ? "Close" : "ปิด"} (Esc)
        </button>
      </header>
      <canvas ref={canvas} role="img" aria-label={english ? "Stars and planets moving under gravity" : "ดาวฤกษ์และดาวเคราะห์เคลื่อนที่ตามแรงโน้มถ่วง"} />
      <footer>
        <span data-testid="counts">
          {english ? `Stars ${count.stars}/${MAX_STARS} · Planets ${count.planets}` : `ดาวฤกษ์ ${count.stars}/${MAX_STARS} · ดาวเคราะห์ ${count.planets}`}
        </span>
        <button type="button" onClick={() => setPaused(!paused)} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {paused ? (english ? "Play" : "เล่น") : english ? "Pause" : "หยุด"}
        </button>
        <button type="button" onClick={() => reset.current(true)} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Sample system" : "ระบบตัวอย่าง"}
        </button>
        <button type="button" onClick={() => reset.current(false)} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Clear" : "ล้างอวกาศ"}
        </button>
      </footer>
    </dialog>
  );
}
