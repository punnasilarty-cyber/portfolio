"use client";

import { useEffect, useRef, useState, type PointerEvent as Pressed } from "react";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { createNet, ENOUGH, MAX_KINDS, raster, SIDE, varied, type Net, type Stroke } from "@/teach";

const ROUNDS = 60;
const NAMES = { th: ["วงกลม", "สามเหลี่ยม", "ดาว", "บ้าน", "หัวใจ"], en: ["Circle", "Triangle", "Star", "House", "Heart"] };

/** draw a few examples, train a small network on them in the browser, then let it guess new drawings */
export function Teach() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("teach", () => setOn(true)), []);
  return on ? <Lesson onDone={() => setOn(false)} /> : null;
}

function Lesson({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const say = (th: string, en: string) => (english ? en : th);
  const dialog = useRef<HTMLDialogElement>(null);
  const board = useRef<HTMLCanvasElement>(null);
  const eye = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const net = useRef<Net | null>(null);
  const frame = useRef(0);
  const [names, setNames] = useState(() => NAMES[english ? "en" : "th"].slice(0, 3));
  const [examples, setExamples] = useState<Stroke[][][]>(() => names.map(() => []));
  const [inked, setInked] = useState(false);
  const [losses, setLosses] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [chances, setChances] = useState<number[] | null>(null);
  const training = losses.length > 0 && !ready;
  const enough = examples.every((list) => list.length >= ENOUGH);

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    return () => cancelAnimationFrame(frame.current);
  }, []);

  /** the board, and beside it the little grid the model really sees */
  function paint() {
    const pen = board.current!.getContext("2d")!;
    pen.clearRect(0, 0, board.current!.width, board.current!.height);
    pen.strokeStyle = "#e9fbff";
    pen.lineWidth = 9;
    pen.lineCap = "round";
    pen.lineJoin = "round";
    for (const stroke of strokes.current) {
      pen.beginPath();
      stroke.forEach(([x, y]) => pen.lineTo(x, y));
      // a single press leaves a dot
      if (stroke.length === 1) pen.lineTo(stroke[0][0] + 0.1, stroke[0][1]);
      pen.stroke();
    }
    const seen = eye.current!.getContext("2d")!;
    raster(strokes.current).forEach((ink, i) => {
      seen.fillStyle = `rgb(${Math.round(12 + ink * 100)},${Math.round(14 + ink * 220)},${Math.round(22 + ink * 233)})`;
      seen.fillRect(i % SIDE, Math.floor(i / SIDE), 1, 1);
    });
  }
  useEffect(paint, []);

  function point(event: Pressed<HTMLCanvasElement>): [number, number] {
    const box = event.currentTarget.getBoundingClientRect();
    return [((event.clientX - box.x) / box.width) * event.currentTarget.width, ((event.clientY - box.y) / box.height) * event.currentTarget.height];
  }

  function lift() {
    if (!drawing.current) return;
    drawing.current = false;
    if (ready) setChances(net.current!.guess(raster(strokes.current)));
  }

  function wipe() {
    strokes.current = [];
    setInked(false);
    setChances(null);
    paint();
  }

  /** anything that changes what is to be learned throws the old lesson away */
  function forget() {
    cancelAnimationFrame(frame.current);
    net.current = null;
    setReady(false);
    setLosses([]);
    setChances(null);
  }

  function keep(kind: number) {
    const drawn = strokes.current;
    setExamples((all) => all.map((list, i) => (i === kind ? [...list, drawn] : list)));
    forget();
    wipe();
  }

  function train() {
    forget();
    wipe();
    const learner = createNet(names.length);
    const samples = examples.flatMap((list, kind) => list.flatMap((drawn) => varied(drawn, kind)));
    const seen: number[] = [];
    // one round a frame, so the falling loss can be watched
    const round = () => {
      seen.push(learner.epoch(samples));
      setLosses([...seen]);
      if (seen.length < ROUNDS) frame.current = requestAnimationFrame(round);
      else {
        net.current = learner;
        setReady(true);
      }
    };
    frame.current = requestAnimationFrame(round);
  }

  const best = chances ? chances.indexOf(Math.max(...chances)) : -1;
  const highest = Math.max(...losses, 0.001);
  const step = !enough ? say(`ขั้นที่ 1: วาด แล้วกด “สอน” ให้ครบแบบละ ${ENOUGH} รูป`, `Step 1: draw, then press “Teach”, ${ENOUGH} of each kind`) : training ? say("กำลังเรียนรู้…", "Learning…") : !ready ? say("ขั้นที่ 2: กด “ฝึกโมเดล”", "Step 2: press “Train”") : say("ขั้นที่ 3: วาดรูปใหม่ ให้ AI ทาย", "Step 3: draw something new for it to guess");

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={say("สอน AI ด้วยตัวเอง", "Teach an AI")} className="teach">
      <header>
        <h3>{say("สอน AI ด้วยตัวเอง", "Teach an AI")}</h3>
        <button type="button" onClick={() => dialog.current!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          {say("ปิด", "Close")}
        </button>
      </header>
      <p role="status" className="teach-step">
        {step}
      </p>
      <div className="teach-body">
        <div className="teach-board">
          <canvas
            ref={board}
            width={300}
            height={300}
            aria-label={say("กระดานวาดรูป", "Drawing board")}
            onPointerDown={(event) => {
              if (training) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drawing.current = true;
              strokes.current = [...strokes.current, [point(event)]];
              setInked(true);
              paint();
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return;
              strokes.current.at(-1)!.push(point(event));
              paint();
            }}
            onPointerUp={lift}
            onPointerCancel={lift}
          />
          <div>
            <button type="button" onClick={wipe} disabled={!inked} className="solx-btn-ghost px-3 py-1.5 text-xs">
              {say("ล้างกระดาน", "Clear")}
            </button>
            <figure>
              <canvas ref={eye} width={SIDE} height={SIDE} aria-hidden="true" />
              <figcaption>{say(`ที่ AI เห็น ${SIDE}×${SIDE}`, `What the AI sees, ${SIDE}×${SIDE}`)}</figcaption>
            </figure>
          </div>
        </div>
        <div className="teach-side">
          <ul>
            {names.map((name, kind) => (
              <li key={kind} className={kind === best ? "is-best" : ""}>
                <input value={name} maxLength={16} aria-label={say(`ชื่อแบบที่ ${kind + 1}`, `Name of kind ${kind + 1}`)} onChange={(event) => setNames(names.map((old, i) => (i === kind ? event.target.value : old)))} />
                <button type="button" onClick={() => keep(kind)} disabled={!inked || training} className="solx-btn-ghost px-3 py-1 text-xs">
                  {say("สอน", "Teach")} ({examples[kind].length})
                </button>
                <meter min={0} max={1} value={chances?.[kind] ?? 0} aria-label={name} />
                <b>{chances ? `${Math.round(chances[kind] * 100)}%` : "–"}</b>
              </li>
            ))}
          </ul>
          <div className="teach-keys">
            <button type="button" onClick={train} disabled={!enough || training} className="solx-btn-primary px-4 py-2 text-sm">
              {say("ฝึกโมเดล", "Train")}
            </button>
            {names.length < MAX_KINDS && (
              <button
                type="button"
                disabled={training}
                onClick={() => {
                  setNames([...names, NAMES[english ? "en" : "th"][names.length]]);
                  setExamples([...examples, []]);
                  forget();
                }}
                className="solx-btn-ghost px-3 py-2 text-xs"
              >
                {say("+ เพิ่มแบบ", "+ Add a kind")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setExamples(names.map(() => []));
                forget();
                wipe();
              }}
              className="solx-btn-ghost px-3 py-2 text-xs"
            >
              {say("เริ่มใหม่", "Start over")}
            </button>
          </div>
          {losses.length > 0 && (
            <figure className="teach-loss">
              <svg viewBox={`0 0 ${ROUNDS} 40`} preserveAspectRatio="none" aria-hidden="true">
                <polyline points={losses.map((loss, i) => `${i + 0.5},${39 - (loss / highest) * 38}`).join(" ")} />
              </svg>
              <figcaption>
                {say("ค่าความผิดพลาด (loss)", "Loss")} · {say("รอบที่", "round")} {losses.length}/{ROUNDS} · {losses.at(-1)!.toFixed(3)}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
      <small>
        {say(
          `โครงข่ายประสาท ${SIDE * SIDE} → 24 → ${names.length} เขียนเอง ฝึกในเบราว์เซอร์ รูปไม่ถูกส่งออกจากเครื่อง ตัวอย่างน้อยจึงทายผิดได้`,
          `A hand-written ${SIDE * SIDE} → 24 → ${names.length} neural network, trained in your browser; drawings stay on this device. With few examples it can be wrong`,
        )}
      </small>
    </dialog>
  );
}
