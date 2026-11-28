"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutWhole } from "@/content";
import { words } from "@/words";

/** The words about the owner, lighting up one by one as they are scrolled through; plain while animation is stopped. */
export function AboutText({ paragraphs }: { paragraphs: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  // split only in the browser: the server's word breaking may differ from the reader's
  const split = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const text = paragraphs.join("\n");

  useEffect(() => {
    if (!split) return;
    gsap.registerPlugin(ScrollTrigger);
    const calm = document.querySelector<HTMLInputElement>("#calm");
    let context: gsap.Context | undefined;
    function apply() {
      context?.revert();
      if (calm?.checked) return;
      context = gsap.context(() => {
        gsap.fromTo(".fx-word", { opacity: 0.18 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: box.current, start: "top 88%", end: "bottom 60%", scrub: 0.4 } });
      }, box.current!);
    }
    apply();
    calm?.addEventListener("change", apply);
    return () => {
      calm?.removeEventListener("change", apply);
      context?.revert();
    };
  }, [split, text]);

  const spans = (part: string) =>
    words(part).map((word, i) => (
      <span key={i} className="fx-word">
        {word}
      </span>
    ));
  return (
    <div ref={box}>
      {paragraphs.map((paragraph) => (
        // a changed text gets new elements, so React never edits what the animation is holding
        <p key={paragraph}>
          {/* the split keeps the phrases that must not break at the odd positions */}
          {paragraph.split(aboutWhole).map((part, i) =>
            i % 2 ? (
              <span key={i} className="whitespace-nowrap">
                {split ? spans(part) : part}
              </span>
            ) : split ? (
              <span key={i}>{spans(part)}</span>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </div>
  );
}
