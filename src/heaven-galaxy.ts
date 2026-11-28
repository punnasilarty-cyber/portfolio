// กาแล็กซีสองแห่งชนกัน: ใจกลางเคลื่อนเข้าหากัน ดาวทุกดวงถูกดึงโดยใจกลางทั้งสอง หางน้ำขึ้นน้ำลงจึงเกิดเอง
// เป็นแบบจำลองอย่างง่าย (ดาวไม่ดึงกันเอง) คำนวณล้วนๆ จึงทดสอบได้

export type Core = { x: number; y: number; vx: number; vy: number; mass: number };
export type Dot = { x: number; y: number; vx: number; vy: number; home: 0 | 1 };

const SOFT = 0.08; // keeps a close pass from flinging a star at endless speed

/** the pull of a core on a point, in units where the whole meeting is about 2 across */
function pull(core: Core, x: number, y: number) {
  const [dx, dy] = [core.x - x, core.y - y];
  const k = core.mass / (dx * dx + dy * dy + SOFT * SOFT) ** 1.5;
  return [dx * k, dy * k] as const;
}

/** two spiral discs, each star on a round orbit about its own core */
export function galaxies(stars: number, random: () => number) {
  const cores: [Core, Core] = [
    { x: -1.15, y: -0.35, vx: 0.34, vy: 0.04, mass: 0.2 },
    { x: 1.15, y: 0.35, vx: -0.34, vy: -0.04, mass: 0.15 },
  ];
  const dots: Dot[] = Array.from({ length: stars }, (_, i) => {
    const home = (i < stars * 0.57 ? 0 : 1) as 0 | 1;
    const core = cores[home];
    const r = 0.07 + random() ** 0.8 * (home ? 0.42 : 0.52);
    // gathered along two arms
    const angle = (i % 2) * Math.PI + r * 8 + (random() - 0.5) * 1.1;
    const speed = Math.sqrt((core.mass * r * r) / (r * r + SOFT * SOFT) ** 1.5);
    const turn = home ? -1 : 1;
    return { home, x: core.x + Math.cos(angle) * r, y: core.y + Math.sin(angle) * r, vx: core.vx - Math.sin(angle) * speed * turn, vy: core.vy + Math.cos(angle) * speed * turn };
  });
  return { cores, dots };
}

export type Meeting = ReturnType<typeof galaxies>;

/** moves everything on by dt; the cores lose speed to one another and so merge */
export function collide({ cores, dots }: Meeting, dt: number) {
  const steps = Math.max(1, Math.ceil(dt / 0.02));
  const h = dt / steps;
  for (let n = 0; n < steps; n++) {
    const [a, b] = cores;
    const [ax, ay] = pull(b, a.x, a.y);
    const [bx, by] = pull(a, b.x, b.y);
    // friction against each other's stars, stronger the closer they are
    const near = Math.exp(-Math.hypot(a.x - b.x, a.y - b.y) * 1.6) * 1.4;
    const [mx, my] = [(a.vx * a.mass + b.vx * b.mass) / (a.mass + b.mass), (a.vy * a.mass + b.vy * b.mass) / (a.mass + b.mass)];
    for (const [core, px, py] of [[a, ax, ay], [b, bx, by]] as const) {
      core.vx += (px - (core.vx - mx) * near) * h;
      core.vy += (py - (core.vy - my) * near) * h;
    }
    for (const core of cores) {
      core.x += core.vx * h;
      core.y += core.vy * h;
    }
    for (const dot of dots) {
      const [p, q] = pull(a, dot.x, dot.y);
      const [r, s] = pull(b, dot.x, dot.y);
      dot.vx += (p + r) * h;
      dot.vy += (q + s) * h;
      dot.x += dot.vx * h;
      dot.y += dot.vy * h;
    }
  }
}
