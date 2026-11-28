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
      // everything is measured first and changed afterwards, so the layout is worked out only once
      const changes = Array.from(document.querySelectorAll(".deck")).flatMap((deck) => {
        const cards = Array.from(deck.children) as HTMLElement[];
        const boxes = cards.map((card) => card.getBoundingClientRect());
        return cards.map((card, i) => {
          const [box, next] = [boxes[i], boxes[i + 1]];
          // how much of this card the next one has come over, 0 to 1
          return [card, calm || !next ? 0 : Math.min(1, Math.max(0, (box.bottom - next.top) / box.height))] as const;
        });
      });
      for (const [card, covered] of changes) {
        const dim = covered.toFixed(2);
        if (card.dataset.covered === dim) continue;
        card.dataset.covered = dim;
        card.style.scale = covered ? String(1 - covered * 0.07) : "";
        // a dark sheet over the card (globals.css) costs far less than recolouring the card itself
        card.style.setProperty("--dim", String(covered * 0.55));
      }
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
