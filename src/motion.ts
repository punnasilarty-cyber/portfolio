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
      const listen = <K extends keyof WindowEventMap>(target: EventTarget, type: K, handler: (event: WindowEventMap[K]) => void) => {
        target.addEventListener(type, handler as EventListener);
        undo.push(() => target.removeEventListener(type, handler as EventListener));
      };
      const finePointer = matchMedia("(pointer: fine)").matches;

      const context = gsap.context(() => {
        gsap.fromTo(".fx-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

        // the opening block falls away while the code wall behind it comes closer
        const hero = { trigger: "#top > section:first-child", start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(".hero-content", { y: 180, scale: 0.78, opacity: 0, rotationX: 35, transformPerspective: 800, ease: "none", scrollTrigger: hero });
        gsap.to("#top > section:first-child canvas", { scale: 1.35, transformOrigin: "50% 40%", ease: "none", scrollTrigger: hero });

        // the band of section names never stops, and scrolling pushes it faster
        const band = gsap.to(".fx-track", { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          onUpdate: (self) => {
            const push = gsap.utils.clamp(-8, 8, self.getVelocity() / 250);
            gsap.fromTo(band, { timeScale: 1 + Math.abs(push) }, { timeScale: 1, duration: 1, overwrite: true });
          },
        });
        gsap.fromTo(".fx-band", { rotation: -4 }, { rotation: 2, ease: "none", scrollTrigger: { trigger: ".fx-band", scrub: true } });

        gsap.utils.toArray<HTMLElement>("main section[id]").forEach((section) => {
          const heading = section.querySelector("h2");
          const number = section.querySelector(".fx-number");
          gsap.from(heading, {
            y: 90,
            scale: 0.55,
            skewY: 8,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: heading, start: "top bottom", end: "top 65%", scrub: 0.5 },
          });
          gsap.fromTo(number, { yPercent: 60, xPercent: -12 }, { yPercent: -60, xPercent: 12, ease: "none", scrollTrigger: { trigger: section, scrub: 1 } });
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

        // schooling timeline: the spine fills, a light rides it, and each building rises floor by floor
        const edu = document.querySelector(".edu");
        if (edu) {
          const along = { trigger: edu, start: "top 70%", end: "bottom 60%", scrub: 0.5 };
          gsap.fromTo(".edu-spine-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: along });
          gsap.fromTo(".edu-dot", { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: along });
          gsap.utils.toArray<HTMLElement>(".edu-stop").forEach((stop, i) => {
            const when = { trigger: stop, start: "top 75%", toggleActions: "play none none reverse" };
            const tl = gsap.timeline({ scrollTrigger: when });
            // no opacity on the 3D parts: anything below 1 flattens them
            tl.from(stop.querySelector(".edu-spin"), { rotationZ: -135, scale: 0, duration: 1, ease: "power3.out" })
              .from(stop.querySelectorAll(".edu-floor"), { scaleZ: 0, scale: 0.6, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, "-=0.5")
              .from(stop.querySelector(".edu-card"), { x: i % 2 ? -80 : 80, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.2)
              .from(stop.querySelectorAll(".edu-fact"), { x: 30, opacity: 0, duration: 0.4, stagger: 0.1 }, 0.6);
            const count = stop.querySelector<HTMLElement>(".edu-count");
            if (count) {
              const target = Number(count.dataset.to);
              const shown = { value: 0 };
              // reverting the animation does not restore text, so put the real number back
              undo.push(() => (count.textContent = target.toLocaleString("th-TH")));
              tl.to(shown, {
                value: target,
                duration: 1.4,
                ease: "power2.out",
                onUpdate: () => {
                  count.textContent = Math.round(shown.value).toLocaleString("th-TH");
                },
              }, 0.4);
            }
            // the models keep turning slowly, like on a display stand
            gsap.to(stop.querySelector(".edu-model"), { "--turn": "360deg", duration: 40, ease: "none", repeat: -1, delay: 1.2 });
          });
        }

        if (!finePointer) return;
        // a soft light that trails the pointer
        const glow = document.body.appendChild(document.createElement("div"));
        glow.className = "fx-glow";
        glow.setAttribute("aria-hidden", "true");
        undo.push(() => glow.remove());
        const glowX = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" });
        const glowY = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" });
        listen(window, "pointermove", (event) => {
          glowX(event.clientX);
          glowY(event.clientY);
          gsap.to(glow, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
        });

        // the main button leans toward the pointer and springs back
        const magnet = document.querySelector<HTMLElement>(".hero-content .solx-btn-primary");
        if (magnet) {
          gsap.set(magnet, { transition: "none" });
          listen(magnet, "pointermove", (event) => {
            const box = magnet.getBoundingClientRect();
            gsap.to(magnet, { x: (event.clientX - box.x - box.width / 2) * 0.4, y: (event.clientY - box.y - box.height / 2) * 0.6, duration: 0.3 });
          });
          listen(magnet, "pointerleave", () => gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" }));
        }
      });

      // pictures change the page height after the triggers are measured
      const remeasure = () => ScrollTrigger.refresh();
      document.addEventListener("load", remeasure, true);
      undo.push(() => document.removeEventListener("load", remeasure, true));

      return () => {
        undo.forEach((fn) => fn());
        context.revert();
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
