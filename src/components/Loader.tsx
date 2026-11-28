"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/content";
import { settleWithin } from "@/loading";

const LIMIT_MS = 10000;
const FADE_MS = 350;
const FLY_MS = 750;

/**
 * Sends the loader's two lines onto the headline, so the one becomes the other. False when that cannot be seen to
 * work: animation stopped, or the page opened somewhere below its top.
 */
function flyToTitle(cover: HTMLElement) {
  const title = document.querySelector<HTMLElement>(".solx-title");
  if (!title || window.scrollY > 40 || document.documentElement.dataset.motion !== "on" || document.querySelector("#calm:checked")) return false;
  const lines = cover.querySelectorAll<HTMLElement>("p > *");
  const targets = title.querySelectorAll<HTMLElement>(":scope > span");
  if (lines.length !== 2 || targets.length !== 2) return false;
  lines.forEach((line, i) => {
    const from = line.getBoundingClientRect();
    const to = targets[i].getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(targets[i]).fontSize) / parseFloat(getComputedStyle(line).fontSize);
    const x = to.x + to.width / 2 - from.x - from.width / 2;
    const y = to.y + to.height / 2 - from.y - from.height / 2;
    line.animate([{ transform: "none" }, { transform: `translate(${x}px, ${y}px) scale(${scale})`, color: "#ffffff" }], { duration: FLY_MS, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "forwards" });
  });
  // the headline waits out of sight, then shows already written (see StaggerText)
  title.dataset.arriving = "";
  return true;
}

/** covers the page until the cards, fonts and pictures are ready; it leaves as soon as they are */
export function Loader() {
  const [percent, setPercent] = useState(0);
  const [state, setState] = useState<"loading" | "leaving" | "flying" | "gone">("loading");

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
      const cover = document.getElementById("loader");
      const flies = !!cover && flyToTitle(cover);
      setState(flies ? "flying" : "leaving");
      // by the clock, so a tab left in the background cannot hold the cover up
      fade = setTimeout(() => setState("gone"), flies ? FLY_MS : FADE_MS);
    })();

    return () => {
      closed = true;
      clearTimeout(fade);
      delete html.dataset.loading;
      html.style.overflow = "";
    };
  }, []);

  // entrance animations that waited for the cover start now, before the first frame without it is drawn
  useLayoutEffect(() => {
    if (state !== "gone") return;
    const title = document.querySelector<HTMLElement>(".solx-title[data-arriving]");
    if (title) {
      delete title.dataset.arriving;
      title.dataset.arrived = "";
    }
    window.dispatchEvent(new Event("site-ready"));
  }, [state]);

  if (state === "gone") return null;
  return (
    <div id="loader" className={state === "loading" ? "" : `is-${state}`}>
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
        <span>{profile.name}</span>
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
