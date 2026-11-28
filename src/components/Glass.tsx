"use client";

import { useEffect, useRef, useState } from "react";
import { RobotArt } from "@/components/RobotArt";
import { profile } from "@/content";
import { onFeature } from "@/features";
import { cracks, shards, type Point } from "@/glass";
import { useLang } from "@/i18n";

const BLOWS = 3;
const BACK_MS = 900;

/** the screen is a pane of glass: strike it three times and it falls away from a hidden page */
export function Glass() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("glass", () => setOn(true)), []);
  return on ? <Pane onDone={() => setOn(false)} /> : null;
}

type Shard = { points: Point[]; cx: number; cy: number; x: number; y: number; vx: number; vy: number; angle: number; spin: number; wait: number };

function Pane({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [blows, setBlows] = useState(0);
  const [phase, setPhase] = useState<"whole" | "broken" | "mending">("whole");
  const strike = useRef<(x?: number, y?: number) => void>(() => {});
  const mend = useRef<() => void>(() => {});

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const [w, h] = [window.innerWidth, window.innerHeight];
    sheet.width = w;
    sheet.height = h;
    const calm = !!document.querySelector("#calm:checked");
    const lines: Point[][] = [];
    let pieces: Shard[] = [];
    let count = 0;
    let frame = 0;
    let began = 0;
    let before = 0;
    let way: "fall" | "back" = "fall";
    let from: { x: number; y: number; angle: number }[] = [];

    function drawCracks() {
      pen.clearRect(0, 0, w, h);
      pen.lineCap = "round";
      for (const [width, color] of [[4, "rgba(0,0,0,0.55)"], [1.4, "rgba(235,248,255,0.95)"]] as const) {
        pen.lineWidth = width;
        pen.strokeStyle = color;
        pen.beginPath();
        for (const line of lines) line.forEach(([x, y], i) => (i ? pen.lineTo(x, y) : pen.moveTo(x, y)));
        pen.stroke();
      }
    }

    function drawShards() {
      pen.clearRect(0, 0, w, h);
      for (const shard of pieces) {
        pen.save();
        pen.translate(shard.cx + shard.x, shard.cy + shard.y);
        pen.rotate(shard.angle);
        pen.beginPath();
        shard.points.forEach(([x, y], i) => (i ? pen.lineTo(x - shard.cx, y - shard.cy) : pen.moveTo(x - shard.cx, y - shard.cy)));
        pen.closePath();
        // dark glass catching a slanted light
        const shine = pen.createLinearGradient(-90, -90, 90, 90);
        shine.addColorStop(0, "rgba(160,200,230,0.28)");
        shine.addColorStop(0.5, "rgba(20,30,45,0.72)");
        shine.addColorStop(1, "rgba(120,170,210,0.2)");
        pen.fillStyle = shine;
        pen.fill();
        pen.strokeStyle = "rgba(220,242,255,0.75)";
        pen.lineWidth = 1.2;
        pen.stroke();
        pen.restore();
      }
    }

    const tick = (now: number) => {
      began ||= now;
      const dt = Math.min(0.033, before ? (now - before) / 1000 : 0.016);
      before = now;
      const t = (now - began) / 1000;
      if (way === "fall") {
        for (const shard of pieces) {
          if (t < shard.wait) continue;
          shard.vy += 1800 * dt;
          shard.x += shard.vx * dt;
          shard.y += shard.vy * dt;
          shard.angle += shard.spin * dt;
        }
        drawShards();
        if (pieces.every((shard) => shard.cy + shard.y > h * 2)) return;
      } else {
        const k = Math.min(1, (t * 1000) / BACK_MS);
        const e = 1 - (1 - k) ** 3;
        pieces.forEach((shard, i) => {
          shard.x = from[i].x * (1 - e);
          shard.y = from[i].y * (1 - e);
          shard.angle = from[i].angle * (1 - e);
        });
        drawShards();
        if (k >= 1) return onDone();
      }
      frame = requestAnimationFrame(tick);
    };

    strike.current = (x = w * (0.3 + Math.random() * 0.4), y = h * (0.3 + Math.random() * 0.4)) => {
      if (count >= BLOWS) return;
      count++;
      setBlows(count);
      if (count < BLOWS) {
        lines.push(...cracks(x, y, Math.random));
        return drawCracks();
      }
      setPhase("broken");
      if (calm) return pen.clearRect(0, 0, w, h);
      pieces = shards(x, y, w, h, Math.random).map((points) => {
        const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
        const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
        const away = Math.hypot(cx - x, cy - y) || 1;
        return { points, cx, cy, x: 0, y: 0, vx: ((cx - x) / away) * (60 + Math.random() * 220), vy: ((cy - y) / away) * 120 - Math.random() * 200, angle: 0, spin: (Math.random() - 0.5) * 5, wait: Math.min(0.5, away / 1600) };
      });
      frame = requestAnimationFrame(tick);
    };
    mend.current = () => {
      cancelAnimationFrame(frame);
      if (calm || !pieces.length) return onDone();
      setPhase("mending");
      // fallen pieces come back from just below the screen, not from wherever they ended up
      from = pieces.map((shard) => ({ x: shard.x, y: Math.min(shard.y, h * 1.2 - shard.cy), angle: shard.angle }));
      way = "back";
      began = 0;
      before = 0;
      frame = requestAnimationFrame(tick);
    };
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <dialog
      ref={dialog}
      onClose={onDone}
      onCancel={(event) => {
        // Esc puts the pane back together first
        event.preventDefault();
        mend.current();
      }}
      aria-label={english ? "Break the glass" : "ทุบกระจก"}
      className={`glass is-${phase}`}
    >
      {phase !== "whole" && (
        <div className="glass-behind">
          <RobotArt />
          <h2>{english ? "You found the page behind the glass" : "คุณพบหน้าลับหลังกระจก"}</h2>
          <p>{profile.name}</p>
        </div>
      )}
      <canvas ref={canvas} aria-hidden="true" onPointerDown={(event) => strike.current(event.clientX, event.clientY)} />
      <div className="glass-bar">
        <p role="status">
          {phase === "whole"
            ? english ? `Strike the glass: ${BLOWS - blows} more` : `แตะกระจกอีก ${BLOWS - blows} ครั้ง`
            : english ? "Shattered!" : "กระจกแตกแล้ว!"}
        </p>
        <div>
          {phase === "whole" && (
            <button type="button" onClick={() => strike.current()} className="solx-btn-primary px-5 py-2 text-sm">
              {english ? "Strike" : "ทุบ"}
            </button>
          )}
          <button autoFocus type="button" onClick={() => mend.current()} className="solx-btn-ghost px-5 py-2 text-sm">
            {phase === "whole" ? (english ? "Leave (Esc)" : "ออก (Esc)") : english ? "Put it back (Esc)" : "ประกอบกลับ (Esc)"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
