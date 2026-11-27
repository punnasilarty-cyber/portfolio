"use client";

import { useEffect, useRef } from "react";

const words = new Intl.Segmenter("th", { granularity: "word" });
// graphemes, not code points: Thai vowel and tone marks must stay on their consonant
const letters = new Intl.Segmenter("th", { granularity: "grapheme" });

const GLYPHS = "01<>{}[]=+*#%$/\\|";
const SWAP_MS = 60;
const FIRST_MS = 600; // everything churns this long before the first letter resolves
const STEP_MS = 75;

/**
 * Text that decodes: symbols keep changing and resolve left to right. Words stay
 * unbreakable so Thai wraps correctly. Without motion the letters just fade in.
 */
export function StaggerText({
  text,
  start = 0,
  gradient = false,
}: {
  text: string;
  /** position of the first letter in the whole sequence */
  start?: number;
  gradient?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    const cells = Array.from(root.querySelectorAll<HTMLElement>(".solx-letter"));
    const reset = () => cells.forEach((cell) => cell.classList.remove("is-scrambling", "is-settled"));
    let frame = 0;
    let seen: IntersectionObserver | undefined;

    function run() {
      const began = performance.now();
      let swapped = -1;
      const tick = (now: number) => {
        const elapsed = now - began;
        const swap = Math.floor(elapsed / SWAP_MS);
        let pending = false;
        cells.forEach((cell, i) => {
          const done = !cell.textContent?.trim() || elapsed >= FIRST_MS + (start + i) * STEP_MS;
          cell.classList.toggle("is-scrambling", !done);
          cell.classList.toggle("is-settled", done);
          if (done) return;
          pending = true;
          // the symbol lives in an attribute so it never becomes part of the text
          if (swap !== swapped) cell.dataset.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        });
        swapped = swap;
        if (pending) frame = requestAnimationFrame(tick);
      };
      tick(began);
    }

    function play() {
      cancelAnimationFrame(frame);
      seen?.disconnect();
      reset();
      if (html.dataset.motion !== "on") return;
      seen = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          seen?.disconnect();
          run();
        },
        { threshold: 0.2 }
      );
      seen.observe(root!);
    }

    play();
    const motion = new MutationObserver(play);
    motion.observe(html, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      motion.disconnect();
      seen?.disconnect();
      cancelAnimationFrame(frame);
      reset();
    };
  }, [start, text]);

  const parts = Array.from(words.segment(text), (w) =>
    Array.from(letters.segment(w.segment), (l) => l.segment)
  );
  const total = parts.flat().length;
  let index = 0;

  return (
    // hidden from screen readers: the parent must carry the full text in aria-label
    <span ref={ref} aria-hidden="true">
      {parts.map((word, w) => (
        <span key={w} className="inline-block whitespace-pre">
          {word.map((letter) => {
            const i = index++;
            const u = i / Math.max(total - 1, 1);
            return (
              <span
                key={i}
                className="solx-letter"
                style={
                  {
                    "--d": `${300 + (start + i) * 65}ms`,
                    "--c": ["#dc2626", "#f87171", "#fecaca"][(start + i) % 3],
                  } as React.CSSProperties
                }
              >
                <span
                  className={gradient ? "solx-letter-real solx-gradient-text" : "solx-letter-real"}
                  // each letter shows its own slice, so the gradient reads as one sweep
                  style={
                    gradient
                      ? { backgroundSize: `${total * 100}% 100%`, backgroundPosition: `${u * 100}% 0` }
                      : undefined
                  }
                >
                  {letter}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
