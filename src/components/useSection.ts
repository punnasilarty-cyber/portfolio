"use client";

import { useEffect, useState } from "react";

/**
 * Which of these sections the reader is at; `ids` must stay the same array between renders. Watched by the browser
 * rather than measured on every scroll, which would make it work out the layout again each time.
 */
export function useSection(ids: string[]) {
  const [at, setAt] = useState(ids[0]);

  useEffect(() => {
    const crossing = new Set<string>();
    let end = false;
    // the last section crossing the line a little above the middle; at the very bottom, the last one
    const choose = () => setAt(end ? ids[ids.length - 1] : (ids.filter((id) => crossing.has(id)).pop() ?? ids[0]));
    const line = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        choose();
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const section = document.getElementById(id);
      if (section) line.observe(section);
    });
    const bottom = new IntersectionObserver(
      ([entry]) => {
        end = entry.intersectionRatio > 0.9;
        choose();
      },
      { threshold: [0, 0.9, 0.95, 1] },
    );
    const footer = document.querySelector("footer");
    if (footer) bottom.observe(footer);
    return () => {
      line.disconnect();
      bottom.disconnect();
    };
  }, [ids]);

  return at;
}
