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

        // school scenes: each builds itself, floor by floor. On wide screens one stays in view and changes with the
        // card being read; on narrow ones they are stacked and build as they scroll in
        const stage = document.querySelector(".edu-stage");
        if (stage) {
          const wide = matchMedia("(min-width: 900px)").matches;
          const scenes = gsap.utils.toArray<HTMLElement>(".edu-scene");
          const builds = scenes.map((scene) => {
            const part = (name: string) => scene.querySelectorAll(name);
            return gsap
              .timeline(wide ? { paused: true } : { scrollTrigger: { trigger: scene, start: "top 80%", toggleActions: "play none none reverse" } })
              .from(part(".sc-floor"), { y: -80, opacity: 0, duration: 0.5, stagger: { amount: 0.9 }, ease: "power3.out" })
              .from(part(".sc-roof"), { y: -60, opacity: 0, duration: 0.5, stagger: { amount: 0.3 }, ease: "power3.out" })
              .from(part(".sc-door, .sc-sign"), { opacity: 0, duration: 0.4 })
              .from(part(".sc-pop, .sc-pop-box"), { scale: 0, transformOrigin: "50% 100%", duration: 0.5, stagger: { amount: 0.6 }, ease: "back.out(2)" }, "-=0.5")
              .from(part(".sc-flagpole"), { opacity: 0, duration: 0.3 }, "-=0.6")
              .from(part(".sc-flag"), { y: 70, duration: 0.9, ease: "power2.out" });
          });
          let shown = -1;
          const show = (school: string) => {
            const next = scenes.findIndex((scene) => scene.dataset.school === school);
            if (next === shown) return;
            shown = next;
            scenes.forEach((scene, i) => scene.classList.toggle("is-on", i === next));
            builds[next].restart();
          };
          if (wide) {
            stage.classList.add("edu-live");
            undo.push(() => {
              stage.classList.remove("edu-live");
              scenes.forEach((scene) => scene.classList.remove("is-on"));
            });
            ScrollTrigger.create({ trigger: stage, start: "top 85%", once: true, onEnter: () => shown < 0 && show(scenes[0].dataset.school!) });
          }
          gsap.utils.toArray<HTMLElement>(".edu-stop").forEach((stop) => {
            const school = stop.dataset.school!;
            gsap.from(stop.querySelector(".edu-card"), {
              y: 60,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: stop, start: "top 75%", toggleActions: "play none none reverse" },
            });
            if (wide) ScrollTrigger.create({ trigger: stop, start: "top 60%", end: "bottom 60%", onEnter: () => show(school), onEnterBack: () => show(school) });
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
