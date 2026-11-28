"use client";

import { useEffect, useState } from "react";

/** which of these sections the reader is at; `ids` must stay the same array between renders */
export function useSection(ids: string[]) {
  const [at, setAt] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      // the last section whose top has passed the upper middle; at the very bottom, the last one
      const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const passed = ids.filter((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight * 0.45);
      setAt(end ? ids[ids.length - 1] : (passed[passed.length - 1] ?? ids[0]));
    };
    const moved = () => {
      frame ||= requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", moved, { passive: true });
    return () => {
      window.removeEventListener("scroll", moved);
      cancelAnimationFrame(frame);
    };
  }, [ids]);

  return at;
}
