"use client";

import { useEffect, useRef } from "react";

/** The marker in the menu, sliding to whichever section is being read (motion.ts marks its link). */
export function NavSlide() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const slide = mark.current!;
    const nav = slide.parentElement!;
    let on: HTMLElement | null = null;
    function place() {
      // at the very top no section is marked: that is the home link's place
      const next = nav.querySelector<HTMLElement>("a.fx-active") ?? (scrollY < innerHeight * 0.5 ? nav.querySelector("a") : null);
      slide.style.opacity = next ? "1" : "0";
      if (!next) return;
      slide.style.width = `${next.offsetWidth}px`;
      slide.style.transform = `translateX(${next.offsetLeft}px)`;
      // on narrow screens the menu scrolls sideways to keep the marker in view
      if (next !== on) nav.scrollTo({ left: next.offsetLeft - (nav.clientWidth - next.offsetWidth) / 2, behavior: "smooth" });
      on = next;
    }
    place();
    const marked = new MutationObserver(place);
    marked.observe(nav, { subtree: true, attributes: true, attributeFilter: ["class"] });
    // a new language or font changes the widths of the links
    const sized = new ResizeObserver(place);
    nav.querySelectorAll("a").forEach((link) => sized.observe(link));
    sized.observe(nav);
    addEventListener("scroll", place, { passive: true });
    return () => {
      marked.disconnect();
      sized.disconnect();
      removeEventListener("scroll", place);
    };
  }, []);
  return <span ref={mark} aria-hidden="true" className="nav-slide" />;
}
