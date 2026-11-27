"use client";

import { useRef, type HTMLAttributes } from "react";

const MAX_TILT_DEG = 6;

export function SpotlightCard({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // spotlight glow position
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // subtle 3D tilt toward the cursor
    const px = x / rect.width - 0.5; // -0.5..0.5
    const py = y / rect.height - 0.5;
    const rotateY = px * MAX_TILT_DEG * 2;
    const rotateX = py * -MAX_TILT_DEG * 2;
    el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale(1.012)`;
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`solx-card solx-spotlight solx-tilt ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
