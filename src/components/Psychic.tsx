"use client";

import { useEffect, useRef, useState } from "react";
import { pieces } from "@/components/Blackhole";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { bodyAt, pieceAt, restingPairs, step, type Body } from "@/psychic";

const HOME_MS = 650;
const FASTEST = 2600; // pixels a second

/** the visitor takes hold of the page: lift, swing and throw what is on screen, then send it all home */
export function Psychic() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("psychic", () => setOn(true)), []);
  return on ? <Power onDone={() => setOn(false)} /> : null;
}

function Power({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const canvas = useRef<HTMLCanvasElement>(null);
  const release = useRef<() => void>(onDone);

  useEffect(() => {
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const [w, h] = [innerWidth, innerHeight];
    sheet.width = w;
    sheet.height = h;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--a2").trim();
    const calm = !!document.querySelector("#calm:checked");
    const found = pieces(document.body).slice(0, 80);
    const before = found.map((piece) => ({ translate: piece.style.translate, rotate: piece.style.rotate, transition: piece.style.transition }));
    const bodies: Body[] = found.map((piece) => {
      piece.style.transition = "none";
      const box = piece.getBoundingClientRect();
      return bodyAt(box.x + box.width / 2, box.y + box.height / 2, box.width, box.height);
    });
    const resting = restingPairs(bodies);

    const hand = { x: 0, y: 0, held: -1, dx: 0, dy: 0, pointer: -1 };
    let wave = -1; // seconds since the power was let go
    let from: { x: number; y: number; angle: number }[] = [];
    let frame = 0;
    let before_ = 0;

    const letGo = () => {
      const body = bodies[hand.held];
      if (!body) return;
      body.held = false;
      const fast = Math.hypot(body.vx, body.vy);
      if (calm) body.vx = body.vy = body.spin = 0;
      else if (fast > FASTEST) {
        body.vx *= FASTEST / fast;
        body.vy *= FASTEST / fast;
      }
      body.spin = calm ? 0 : body.vx * 0.05;
      hand.held = -1;
    };
    const down = (event: PointerEvent) => {
      if (wave >= 0 || hand.held >= 0) return;
      const at = pieceAt(bodies, event.clientX, event.clientY);
      Object.assign(hand, { x: event.clientX, y: event.clientY });
      if (at < 0) return;
      const body = bodies[at];
      Object.assign(hand, { held: at, pointer: event.pointerId, dx: body.x - event.clientX, dy: body.y - event.clientY });
      Object.assign(body, { held: true, awake: true, vx: 0, vy: 0, spin: 0 });
      sheet.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (hand.held >= 0 && event.pointerId !== hand.pointer) return;
      Object.assign(hand, { x: event.clientX, y: event.clientY });
    };
    const send = () => {
      if (wave >= 0) return;
      letGo();
      if (calm) return onDone();
      wave = 0;
      from = bodies.map(({ x, y, angle }) => ({ x, y, angle }));
    };
    release.current = send;

    const tick = (now: number) => {
      const dt = Math.min(0.033, before_ ? (now - before_) / 1000 : 0.016);
      before_ = now;
      pen.clearRect(0, 0, w, h);
      const held = bodies[hand.held];
      if (held && dt) {
        // it trails the hand a little, which is what gives a throw its speed
        const [x, y] = [held.x, held.y];
        const pull = 1 - Math.exp(-18 * dt);
        held.x += (hand.x + hand.dx - held.x) * pull;
        held.y += (hand.y + hand.dy - held.y) * pull;
        held.vx = (held.x - x) / dt;
        held.vy = (held.y - y) / dt;
        held.angle += (Math.max(-18, Math.min(18, held.vx * 0.02)) - held.angle) * pull;
      }
      if (wave < 0) step(bodies, dt, w, h, resting);
      else {
        wave += dt;
        const k = 1 - (1 - Math.min(1, (wave * 1000) / HOME_MS)) ** 3;
        bodies.forEach((body, i) => {
          body.x = from[i].x + (body.homeX - from[i].x) * k;
          body.y = from[i].y + (body.homeY - from[i].y) * k;
          // by the shortest turn back to upright
          body.angle = (from[i].angle - Math.round(from[i].angle / 360) * 360) * (1 - k);
        });
        pen.strokeStyle = color;
        pen.lineWidth = 14 * (1 - k);
        pen.beginPath();
        pen.arc(hand.x || w / 2, hand.y || h / 2, k * Math.hypot(w, h), 0, Math.PI * 2);
        pen.stroke();
        if ((wave * 1000) >= HOME_MS) return onDone();
      }
      found.forEach((piece, i) => {
        const body = bodies[i];
        if (!body.awake) return;
        piece.style.translate = `${(body.x - body.homeX).toFixed(1)}px ${(body.y - body.homeY).toFixed(1)}px`;
        piece.style.rotate = `${body.angle.toFixed(1)}deg`;
      });
      if (held) aura(held, now / 1000);
      frame = requestAnimationFrame(tick);
    };

    /** a glow around the held piece, rings, and wavering lines of force from the hand */
    function aura(body: Body, t: number) {
      pen.save();
      pen.strokeStyle = color;
      pen.shadowColor = color;
      pen.shadowBlur = 24;
      pen.lineWidth = 2.5;
      pen.beginPath();
      pen.roundRect(body.x - body.w / 2 - 6, body.y - body.h / 2 - 6, body.w + 12, body.h + 12, 14);
      pen.stroke();
      for (let ring = 0; ring < 3; ring++) {
        const grow = calm ? ring / 3 : (t * 0.9 + ring / 3) % 1;
        pen.globalAlpha = 1 - grow;
        pen.beginPath();
        pen.arc(hand.x, hand.y, 12 + grow * 60, 0, Math.PI * 2);
        pen.stroke();
      }
      pen.globalAlpha = 0.75;
      for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const [x, y] = [body.x + (cx * body.w) / 2, body.y + (cy * body.h) / 2];
        pen.beginPath();
        pen.moveTo(hand.x, hand.y);
        for (let i = 1; i <= 10; i++) {
          const k = i / 10;
          const sway = calm ? 0 : Math.sin(k * 9 - t * 14 + cx * 2 + cy) * 12 * Math.sin(k * Math.PI);
          pen.lineTo(hand.x + (x - hand.x) * k + sway, hand.y + (y - hand.y) * k - sway);
        }
        pen.stroke();
      }
      pen.restore();
    }

    const key = (event: KeyboardEvent) => event.key === "Escape" && send();
    const still = (event: Event) => event.preventDefault();
    sheet.addEventListener("pointerdown", down);
    sheet.addEventListener("pointermove", move);
    sheet.addEventListener("pointerup", letGo);
    sheet.addEventListener("pointercancel", letGo);
    // the page must stay put while its pieces are loose
    window.addEventListener("wheel", still, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("resize", onDone);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", still);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", onDone);
      found.forEach((piece, i) => Object.assign(piece.style, before[i]));
    };
  }, [onDone]);

  return (
    <div className="psychic">
      <canvas ref={canvas} aria-hidden="true" />
      <div>
        <p role="status">{english ? "Psychic power: grab anything and throw it" : "พลังจิต: จับอะไรก็ได้แล้วเหวี่ยง"}</p>
        <button autoFocus type="button" onClick={() => release.current()} className="solx-btn-primary px-5 py-2 text-sm">
          {english ? "Release (Esc)" : "ปล่อยพลัง (Esc)"}
        </button>
      </div>
    </div>
  );
}
