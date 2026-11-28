"use client";

import { useMemo } from "react";
import { useSection } from "@/components/useSection";
import { useLang } from "@/i18n";

/** a column of dots at the side of wide screens: where the reader is, and a way to jump */
export function SectionDots({ places }: { places: { id: string; title: string }[] }) {
  const { t } = useLang();
  const ids = useMemo(() => places.map((place) => place.id), [places]);
  const at = useSection(ids);

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
