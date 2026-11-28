"use client";

import { useEffect, useRef, useState } from "react";
import { pieces } from "@/components/Blackhole";
import { BLAST_LASTS, CHARGE, power, spread, WAVE } from "@/blast";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";

const MOST_GRAINS = 2600;

/** gather a ball of energy and fire it: the page blows into dust, then draws itself together again */
export function Blast() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("blast", () => setOn(true)), []);
  return on ? <Shot onDone={() => setOn(false)} /> : null;
}

type Grain = { x: number; y: number; dx: number; dy: number; delay: number; color: string; size: number };

function Shot({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<"charge" | "fired">("charge");
  const hold = useRef<() => void>(() => {});
  const fire = useRef<() => void>(() => {});

  useEffect(() => {
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const [w, h] = [innerWidth, innerHeight];
    sheet.width = w;
    sheet.height = h;
    const [cx, cy] = [w / 2, h / 2];
    const theme = getComputedStyle(document.documentElement);
    const [accent, pale] = [theme.getPropertyValue("--a2").trim(), theme.getPropertyValue("--a4").trim()];
    const calm = !!document.querySelector("#calm:checked");
    let holding = 0; // when the press began; 0 while nothing is pressed
    let charged = 0; // seconds of charge gathered
    let shot = 0; // when it was fired
    let force = 0;
    const grains: Grain[] = [];
    let blown: { piece: HTMLElement; before: string; delay: number; gone: boolean }[] = [];
    let frame = 0;

    /** turns everything on screen into grains of its own colours */
    function shatter() {
      const found = pieces(document.body).slice(0, 90);
      const area = found.reduce((sum, piece) => sum + piece.getBoundingClientRect().width * piece.getBoundingClientRect().height, 0);
      const gap = Math.max(7, Math.sqrt(area / MOST_GRAINS));
      blown = found.map((piece) => {
        const box = piece.getBoundingClientRect();
        const style = getComputedStyle(piece);
        const solid = !/rgba?\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor) ? style.backgroundColor : null;
        const delay = (Math.hypot(box.x + box.width / 2 - cx, box.y + box.height / 2 - cy) / Math.hypot(cx, cy)) * WAVE;
        for (let y = box.top + gap / 2; y < box.bottom && grains.length < MOST_GRAINS * 1.5; y += gap) {
          for (let x = box.left + gap / 2; x < box.right; x += gap) {
            if (x < 0 || x > w || y < 0 || y > h) continue;
            const angle = Math.atan2(y - cy, x - cx) + (Math.random() - 0.5) * 0.7;
            const far = (90 + Math.random() * 320) * force;
            const pick = Math.random();
            grains.push({ x, y, dx: Math.cos(angle) * far, dy: Math.sin(angle) * far, delay, color: pick < 0.55 ? (solid ?? style.color) : pick < 0.8 ? accent : pick < 0.9 ? pale : style.color, size: 1.5 + Math.random() * gap * 0.35 });
          }
        }
        return { piece, before: piece.style.visibility, delay, gone: false };
      });
    }

    function orb(x: number, y: number, r: number, t: number) {
      const glow = pen.createRadialGradient(x, y, 0, x, y, r * 2.4);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.3, pale);
      glow.addColorStop(0.55, accent);
      glow.addColorStop(1, "transparent");
      pen.fillStyle = glow;
      pen.beginPath();
      pen.arc(x, y, r * 2.4, 0, Math.PI * 2);
      pen.fill();
      // sparks drawn in toward the ball while it gathers
      pen.strokeStyle = accent;
      pen.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const angle = i * 2.4 + t * 1.5;
        const far = r * 2.2 + 130 * (1 - ((t * 1.4 + i / 14) % 1));
        pen.beginPath();
        pen.moveTo(x + Math.cos(angle) * far, y + Math.sin(angle) * far);
        pen.lineTo(x + Math.cos(angle) * (far - 18), y + Math.sin(angle) * (far - 18));
        pen.stroke();
      }
    }

    const tick = (now: number) => {
      pen.clearRect(0, 0, w, h);
      if (!shot) {
        // a frame's time can be a little earlier than the press it follows
        const held = charged + (holding ? Math.max(0, now - holding) / 1000 : 0);
        orb(cx, cy, 10 + Math.min(1, held / CHARGE) * Math.min(w, h) * 0.09, calm ? 0 : now / 1000);
        // the meter under the ball
        pen.fillStyle = "rgba(0,0,0,0.6)";
        pen.fillRect(cx - 90, cy + Math.min(w, h) * 0.28, 180, 8);
        pen.fillStyle = accent;
        pen.fillRect(cx - 90, cy + Math.min(w, h) * 0.28, 180 * Math.min(1, held / CHARGE), 8);
      } else {
        const t = Math.max(0, now - shot) / 1000;
        for (const item of blown) {
          // hidden from the moment the wave reaches it until its grains are nearly home
          const gone = t >= item.delay && t < BLAST_LASTS - 0.12;
          if (gone !== item.gone) {
            item.gone = gone;
            item.piece.style.visibility = gone ? "hidden" : item.before;
          }
        }
        for (const grain of grains) {
          if (t < grain.delay || t >= BLAST_LASTS - 0.12) continue;
          const s = spread(t, grain.delay);
          pen.fillStyle = grain.color;
          pen.fillRect(grain.x + grain.dx * s, grain.y + grain.dy * s + s * s * 40, grain.size, grain.size);
        }
        const ring = t / WAVE;
        if (ring < 1.4) {
          pen.strokeStyle = accent;
          pen.globalAlpha = Math.max(0, 1 - ring / 1.4);
          pen.lineWidth = 26 * force;
          pen.beginPath();
          pen.arc(cx, cy, ring * Math.hypot(cx, cy), 0, Math.PI * 2);
          pen.stroke();
          pen.globalAlpha = 1;
        }
        if (t >= BLAST_LASTS) return onDone();
      }
      frame = requestAnimationFrame(tick);
    };

    hold.current = () => {
      if (!shot && !holding) holding = performance.now();
    };
    fire.current = () => {
      if (shot) return;
      if (holding) charged += (performance.now() - holding) / 1000;
      holding = 0;
      force = power(charged);
      setStage("fired");
      // with animation stopped nothing is thrown about
      if (calm) return onDone();
      shatter();
      shot = performance.now();
    };
    const key = (event: KeyboardEvent) => event.key === "Escape" && onDone();
    const still = (event: Event) => event.preventDefault();
    const down = (event: PointerEvent) => {
      sheet.setPointerCapture(event.pointerId);
      hold.current();
    };
    const up = () => holding && fire.current();
    sheet.addEventListener("pointerdown", down);
    sheet.addEventListener("pointerup", up);
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", still, { passive: false });
    window.addEventListener("resize", onDone);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", key);
      window.removeEventListener("wheel", still);
      window.removeEventListener("resize", onDone);
      for (const item of blown) item.piece.style.visibility = item.before;
    };
  }, [onDone]);

  return (
    <div className="psychic blast">
      <canvas ref={canvas} aria-hidden="true" />
      <div>
        <p role="status">
          {stage === "charge" ? (english ? "Hold to charge, let go to fire" : "กดค้างเพื่อชาร์จ ปล่อยเพื่อยิง") : english ? "BOOM!" : "ตูม!"}
        </p>
        {stage === "charge" && (
          <p className="blast-keys">
            <button autoFocus type="button" onClick={() => fire.current()} className="solx-btn-primary px-5 py-2 text-sm">
              {english ? "Fire" : "ยิง"}
            </button>
            <button type="button" onClick={onDone} className="solx-btn-ghost px-5 py-2 text-sm">
              {english ? "Cancel (Esc)" : "ยกเลิก (Esc)"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
