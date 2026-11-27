"use client";

import { useEffect, useState } from "react";

/** a corner button back to the top, once the reader is well down the page */
export function ToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const read = () => setShown(window.scrollY > 600);
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  // the footer checkbox that stops animations also stops the gliding
  function go() {
    const calm = document.querySelector<HTMLInputElement>("#calm")?.checked;
    window.scrollTo({ top: 0, behavior: calm ? "instant" : "smooth" });
  }

  if (!shown) return null;
  return (
    <button type="button" onClick={go} aria-label="กลับขึ้นบนสุด" className="to-top">
      <span aria-hidden="true">↑</span>
    </button>
  );
}
