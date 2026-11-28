"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/content";
import { settleWithin } from "@/loading";

const LIMIT_MS = 10000;
const FADE_MS = 350;

/** covers the page until the cards, fonts and pictures are ready; it leaves as soon as they are */
export function Loader() {
  const [percent, setPercent] = useState(0);
  const [state, setState] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    let closed = false;
    let fade: ReturnType<typeof setTimeout>;
    const html = document.documentElement;
    html.dataset.loading = "";
    html.style.overflow = "hidden";
    const began = Date.now();

    (async () => {
      // the cards arrive after the page does; their pictures are known only once they are drawn
      while (!closed && document.querySelector('main [aria-busy="true"]') && Date.now() - began < LIMIT_MS) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      const tasks = [document.fonts.ready, ...Array.from(document.images, (picture) => picture.decode())];
      await settleWithin(tasks, Math.max(0, LIMIT_MS - (Date.now() - began)), (done) => !closed && setPercent(Math.round((done / tasks.length) * 100)));
      if (closed) return;
      setPercent(100);
      delete html.dataset.loading;
      html.style.overflow = "";
      // measured again now that everything has its final size, then back to the linked section
      ScrollTrigger.refresh();
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
      setState("leaving");
      fade = setTimeout(() => setState("gone"), FADE_MS);
    })();

    return () => {
      closed = true;
      clearTimeout(fade);
      delete html.dataset.loading;
      html.style.overflow = "";
    };
  }, []);

  // entrance animations that waited for the cover start now
  useEffect(() => {
    if (state === "gone") window.dispatchEvent(new Event("site-ready"));
  }, [state]);

  if (state === "gone") return null;
  return (
    <div id="loader" className={state === "leaving" ? "is-leaving" : ""}>
      <div aria-hidden="true" className="loader-mark">
        <i />
        <i />
        <svg viewBox="0 0 64 64">
          <path pathLength={1} d="M22 20 10 32l12 12" />
          <path pathLength={1} d="M36 16 28 48" />
          <path pathLength={1} d="M42 20l12 12-12 12" />
        </svg>
      </div>
      <p>
        <small>Portfolio</small>
        {profile.name}
      </p>
      <div role="progressbar" aria-label="กำลังโหลดเว็บ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="loader-bar">
        <i style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <b>{percent}%</b>
      {/* without scripts there is nothing to wait for */}
      <noscript>
        <style>{"#loader{display:none}"}</style>
      </noscript>
    </div>
  );
}
