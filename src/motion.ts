"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The page's scroll and pointer animations. Rebuilt whenever `content` changes, since cards arrive late.
 * They play even where the system asks for less motion, by the owner's choice; the #calm checkbox stops them.
 */
export function useMotion(content: unknown) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const calm = document.querySelector<HTMLInputElement>("#calm");
    let stop = () => {};

    function start() {
      const undo: (() => void)[] = [];
      const context = gsap.context(() => {
        gsap.fromTo(".fx-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

        // the opening block sinks and fades; only the text moves, the code wall behind it stays put
        const hero = { trigger: "#top > section:first-child", start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(".hero-content", { y: 120, opacity: 0, ease: "none", scrollTrigger: hero });

        // the band of section names keeps drifting
        gsap.to(".fx-track", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
        gsap.utils.toArray<HTMLElement>("main section[id]").forEach((section) => {
          const heading = section.querySelector("h2");
          gsap.from(heading, {
            y: 90,
            scale: 0.55,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: heading, start: "top bottom", end: "top 65%", scrub: 0.5 },
          });
          // the menu lights up the section on screen
          ScrollTrigger.create({
            trigger: section,
            start: "top 45%",
            end: "bottom 45%",
            toggleClass: { targets: `nav a[href="#${section.id}"]`, className: "fx-active" },
          });
          // cards flip up one after another along each row
          section.querySelectorAll(":scope > ul > li").forEach((card, i) => {
            gsap.from(card, {
              y: 140,
              rotationX: -70,
              rotationY: [25, 0, -25][i % 3],
              scale: 0.8,
              opacity: 0,
              transformPerspective: 900,
              duration: 1.1,
              delay: (i % 3) * 0.14,
              ease: "back.out(1.5)",
              scrollTrigger: { trigger: card, start: "top 94%", toggleActions: "play none none reverse" },
            });
          });
        });

        // schooling map: the route draws itself as the cards scroll past, a light rides it, and each pin pops up
        // when its school's first card arrives
        const list = document.querySelector(".edu-list");
        if (list) {
          const along = { trigger: list, start: "top 65%", end: "bottom 70%", scrub: 0.6 };
          const route = document.querySelector<SVGPathElement>(".edu-route")!;
          const traveller = document.querySelector(".edu-traveller")!;
          const length = route.getTotalLength();
          gsap.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: along });
          gsap.fromTo(
            { at: 0 },
            { at: 0 },
            {
              at: 1,
              ease: "none",
              scrollTrigger: along,
              onUpdate() {
                const point = route.getPointAtLength(this.targets()[0].at * length);
                gsap.set(traveller, { attr: { cx: point.x, cy: point.y } });
              },
            },
          );

          const popped = new Set<string>();
          gsap.utils.toArray<HTMLElement>(".edu-stop").forEach((stop) => {
            const school = stop.dataset.school!;
            const pin = document.querySelector(`.edu-pin[data-school="${school}"]`);
            const when = { trigger: stop, start: "top 75%", toggleActions: "play none none reverse" };
            const tl = gsap.timeline({ scrollTrigger: when });
            tl.from(stop.querySelector(".edu-card"), { y: 60, opacity: 0, duration: 0.8, ease: "power3.out" });
            if (pin && !popped.has(school)) {
              popped.add(school);
              tl.from(pin, { scale: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "back.out(3)" }, 0);
            }
          });
        }

      });

      // pictures change the page height after the triggers are measured
      const remeasure = () => ScrollTrigger.refresh();
      document.addEventListener("load", remeasure, true);
      undo.push(() => document.removeEventListener("load", remeasure, true));

      return () => {
        context.revert();
        undo.forEach((fn) => fn());
      };
    }

    function apply() {
      stop();
      stop = calm?.checked ? () => {} : start();
    }

    apply();
    calm?.addEventListener("change", apply);
    return () => {
      calm?.removeEventListener("change", apply);
      stop();
    };
  }, [content]);
}
