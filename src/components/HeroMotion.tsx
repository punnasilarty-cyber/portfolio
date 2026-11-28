"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "01<>{}[]=+*#%$/\\|";
// the code texture; ASCII only so every character fills exactly one cell
const SOURCE = `type Cue = { text: string; start: number; end: number; style: Style }; export function highlight(words: Word[], active: number) { return words.map((word, i) => ({ ...word, scale: i === active ? 1.18 : 1, fill: i === active ? accent : white })); } export async function render(clip: Clip, preset: Preset) { const cues = await transcribe(clip.audio, { lang: "th", maxChars: 18 }); for (const cue of cues) { const frames = timeline(cue.start, cue.end, 30); preset.apply(frames, { font: "thai-display", stroke: 4, shadow: true, safeArea: "9:16" }); } return exportVideo(clip, { format: "mp4", codec: "h264", height: 1920 }); } function timeline(start: number, end: number, fps: number) { const count = Math.max(1, Math.round((end - start) * fps)); return Array.from({ length: count }, (_, i) => ({ at: start + i / fps, ease: 1 - Math.pow(1 - i / count, 3) })); } `;
const ROWS_PER_SECOND = 1.1;
const SHAPE = "</>";
// one round: the shape assembles and the light crosses it once; also the resting frame
const ROUND_SECONDS = 1.8 / 0.22;

const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** a colour of the theme, written in globals.css as #rrggbb */
const themeColor = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const mix = (stops: number[][], u: number) => {
  const k = clamp(u) * 2;
  const i = Math.min(1, Math.floor(k));
  const c = stops[i].map((v, n) => Math.round(v + (stops[i + 1][n] - v) * (k - i)));
  return `rgb(${c.join(",")})`;
};

/** A wall of code with a large code tag lit out of it. It moves for one round, then rests; `still` only rests. */
export function HeroMotion({ still = false }: { still?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // one round on every visit, by the owner's choice even where the system asks for less motion
  const [playing, setPlaying] = useState(!still);

  useEffect(() => {
    if (still) return;
    const timer = setTimeout(() => setPlaying(false), ROUND_SECONDS * 1000);
    // lets the headline decode; stays set so the settled letters do not fade in again
    document.documentElement.dataset.motion = "on";
    return () => {
      clearTimeout(timer);
      delete document.documentElement.dataset.motion;
    };
  }, [still]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const section = canvas?.parentElement;
    if (!canvas || !ctx || !section) return;

    let width = 0;
    let height = 0;
    let cw = 0;
    let lh = 0;
    let font = "";
    let dimFont = "";
    let cols = 0;
    let rows = 0;
    // grid cells covered by the shape; u runs 0..1 diagonally across it
    let cells: { x: number; y: number; u: number }[] = [];

    let stops: number[][] = [];
    let dim = "";
    let spark = "";

    function layout() {
      stops = ["--a1", "--a2", "--a4"].map((name) => [1, 3, 5].map((at) => parseInt(themeColor(name).slice(at, at + 2), 16)));
      dim = themeColor("--code-dim");
      spark = themeColor("--a4");
      const dpr = Math.min(1.25, window.devicePixelRatio || 1);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = width < 700 ? 11 : 13;
      font = `800 ${size}px ui-monospace, Menlo, Consolas, monospace`;
      dimFont = `400 ${size}px ui-monospace, Menlo, Consolas, monospace`;
      ctx!.font = font;
      cw = ctx!.measureText("M").width;
      lh = Math.round(size * 1.32);
      cols = Math.ceil(width / cw);
      rows = Math.ceil(height / lh);

      const stage = document.createElement("canvas");
      stage.width = width;
      stage.height = height;
      const g = stage.getContext("2d", { willReadFrequently: true })!;
      let big = height * 0.92;
      g.font = `900 ${big}px "Arial Black", Arial, sans-serif`;
      big *= Math.min(1, (width * 0.9) / g.measureText(SHAPE).width);
      g.font = `900 ${big}px "Arial Black", Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(SHAPE, width / 2, height / 2);
      // the symbols have thin strokes, so thicken them until they read through the code
      g.lineWidth = big * 0.05;
      g.lineJoin = "round";
      g.strokeText(SHAPE, width / 2, height / 2);
      const span = g.measureText(SHAPE).width;
      const data = g.getImageData(0, 0, width, height).data;
      cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = Math.min(width - 1, Math.round((x + 0.5) * cw));
          const py = Math.min(height - 1, Math.round((y + 0.5) * lh));
          if (data[(py * width + px) * 4 + 3] > 120) {
            const u = ((px - (width - span) / 2) / span) * 0.6 + (py / height) * 0.4;
            cells.push({ x, y, u });
          }
        }
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.textBaseline = "top";
      // the code scrolls up one whole row at a time, like a terminal
      const scroll = Math.floor(time * ROWS_PER_SECOND);
      const offset = (y: number) => ((y + scroll) * cols) % SOURCE.length;
      const charAt = (x: number, y: number) => SOURCE[(offset(y) + x) % SOURCE.length];
      const twice = SOURCE.repeat(Math.ceil(cols / SOURCE.length) + 1);

      ctx!.font = dimFont;
      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = dim;
      for (let y = 0; y < rows; y++) ctx!.fillText(twice.substr(offset(y), cols), 0, y * lh);

      // a few characters twinkle, each on its own clock
      ctx!.fillStyle = spark;
      for (let k = 0; k < 40; k++) {
        const clock = time * 0.7 + hash(k, 9);
        const spot = Math.floor(hash(k, Math.floor(clock)) * cols * rows);
        const x = spot % cols;
        const y = Math.floor(spot / cols);
        ctx!.globalAlpha = 0.45 * Math.sin((clock % 1) * Math.PI);
        ctx!.fillText(charAt(x, y), x * cw, y * lh);
      }

      ctx!.font = font;
      // a band of light that keeps crossing the shape
      const sweep = ((time * 0.22) % 1.8) - 0.4;
      for (const cell of cells) {
        const id = cell.y * 1000 + cell.x;
        const on = 0.2 + hash(id, 1) * 1.8;
        const alpha = clamp((time - on) / 0.45);
        if (alpha <= 0.01) continue;
        // flickers while arriving, then a few cells at a time keep changing
        const scrambling = time < on + 0.45 || hash(id, Math.floor(time * 3)) > 0.97;
        const own = charAt(cell.x, cell.y);
        const glyph = scrambling
          ? GLYPHS[Math.floor(hash(id, Math.floor(time * 18)) * GLYPHS.length)]
          : own === " " ? "·" : own;
        const shine = Math.exp(-((cell.u - sweep) ** 2) / 0.006);
        const color = mix(stops, cell.u);
        // kept low so the headline in front stays readable
        ctx!.globalAlpha = alpha * (0.38 + 0.45 * shine);
        ctx!.fillStyle = shine > 0.6 ? "#ffffff" : color;
        ctx!.fillText(glyph, cell.x * cw, cell.y * lh);
      }
      ctx!.globalAlpha = 1;
    }

    let frame = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 33) return; // about 30 fps
      last = now;
      draw((now - start) / 1000);
    };
    const redraw = () => {
      // a page kept hidden after navigation reports a 0 x 0 canvas
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      layout();
      draw(playing ? (performance.now() - start) / 1000 : ROUND_SECONDS);
    };

    redraw();
    if (playing) frame = requestAnimationFrame(tick);
    window.addEventListener("theme-change", redraw);
    const resize = new ResizeObserver(redraw);
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    seen.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("theme-change", redraw);
      resize.disconnect();
      seen.disconnect();
    };
  }, [playing]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:linear-gradient(180deg,#000_68%,transparent)]" />
  );
}
