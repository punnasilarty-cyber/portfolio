"use client";

import { useEffect, useRef } from "react";

/** Holds its children's entrance animations until it scrolls into view. */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    // hidden only once JS is running, so content still shows without it
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("solx-wait");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove("solx-wait");
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={`solx-reveal ${className}`}>
      {children}
    </section>
  );
}
