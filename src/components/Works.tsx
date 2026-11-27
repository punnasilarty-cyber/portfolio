"use client";

import { useEffect, useState } from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { works as defaults, type Work } from "@/content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function Works() {
  const [works, setWorks] = useState<Work[] | null>(null);

  useEffect(() => {
    // the query string skips the host's cache, so a fresh save shows up
    fetch(`${base}/works.json?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : defaults))
      .then((data) => setWorks(Array.isArray(data) ? data : defaults))
      .catch(() => setWorks(defaults));
  }, []);

  return (
    <ul className="grid min-h-64 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={!works}>
      {works?.map((work, index) => (
        <li key={`${index}-${work.title}`}>
          <WorkCard work={work} />
        </li>
      ))}
    </ul>
  );
}

function WorkCard({ work }: { work: Work }) {
  return (
    <SpotlightCard className="flex h-full flex-col">
      <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#7f1d1d,#3b1113)]">
        {work.image && (
          // eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are
          <img src={`${base}${work.image}`} alt={work.title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs text-[var(--accent-soft)]">{work.kind}</p>
        <h3 className="font-bold">{work.title}</h3>
        <p className="text-sm text-[var(--muted)]">{work.summary}</p>
        {work.link && (
          <a href={work.link} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost mt-auto self-start px-4 py-2 text-sm">
            ดูผลงาน
          </a>
        )}
      </div>
    </SpotlightCard>
  );
}
