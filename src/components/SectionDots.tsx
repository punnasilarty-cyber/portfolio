"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

/** a column of dots at the side of wide screens: where the reader is, and a way to jump */
export function SectionDots({ places }: { places: { id: string; title: string }[] }) {
  const { t } = useLang();
  const [at, setAt] = useState(places[0].id);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      // the last section whose top has passed the upper middle; at the very bottom, the last one
      const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const passed = places.filter(({ id }) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= window.innerHeight * 0.45);
      setAt((end ? places[places.length - 1] : (passed[passed.length - 1] ?? places[0])).id);
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
  }, [places]);

  return (
    <nav aria-label={t("ตำแหน่งในหน้า")} className="dots">
      {places.map(({ id, title }) => (
        <a key={id} href={`#${id}`} aria-current={at === id ? "location" : undefined}>
          <span>{t(title)}</span>
        </a>
      ))}
    </nav>
  );
}
