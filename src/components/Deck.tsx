"use client";

import { useEffect } from "react";

/**
 * The cards of a `.deck` list stick one over another while scrolling (globals.css); this makes a covered card sink back
 * and dim. Measured on every scroll rather than once, since a stuck card is not where it was first laid out.
 */
export function Deck() {
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const calm = !!document.querySelector("#calm:checked");
      document.querySelectorAll(".deck").forEach((deck) => {
        const cards = Array.from(deck.children) as HTMLElement[];
        cards.forEach((card, i) => {
          const next = cards[i + 1]?.getBoundingClientRect();
          const box = card.getBoundingClientRect();
          // how much of this card the next one has come over, 0 to 1
          const covered = calm || !next ? 0 : Math.min(1, Math.max(0, (box.bottom - next.top) / box.height));
          card.style.scale = covered ? String(1 - covered * 0.07) : "";
          card.style.filter = covered ? `brightness(${1 - covered * 0.55})` : "";
        });
      });
    };
    const moved = () => {
      frame ||= requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", moved, { passive: true });
    window.addEventListener("resize", moved);
    document.addEventListener("change", moved);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", moved);
      window.removeEventListener("resize", moved);
      document.removeEventListener("change", moved);
    };
  }, []);

  return null;
}
