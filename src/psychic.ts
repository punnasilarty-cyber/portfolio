// ฟิสิกส์ของฟีเจอร์ “พลังจิต”: ของลอยไร้น้ำหนัก ชนกันและเด้งขอบจอ

export type Body = {
  /** the middle of the piece now, and where it came from */
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  /** touched or hit at least once; a sleeping piece stays where the page put it */
  awake: boolean;
  held: boolean;
};

const BOUNCE = 0.8;

export const bodyAt = (x: number, y: number, w: number, h: number): Body => ({ x, y, homeX: x, homeY: y, w, h, vx: 0, vy: 0, angle: 0, spin: 0, awake: false, held: false });

const overlap = (a: Body, b: Body) => [(a.w + b.w) / 2 - Math.abs(b.x - a.x), (a.h + b.h) / 2 - Math.abs(b.y - a.y)] as const;

/** pairs already touching as the page laid them out, which must not push each other apart */
export function restingPairs(bodies: Body[]) {
  const pairs = new Set<string>();
  bodies.forEach((a, i) =>
    bodies.forEach((b, j) => {
      if (j > i && overlap(a, b).every((depth) => depth > 0)) pairs.add(`${i},${j}`);
    }),
  );
  return pairs;
}

/** moves everything on by dt seconds inside a width by height screen */
export function step(bodies: Body[], dt: number, width: number, height: number, resting: Set<string>) {
  for (const body of bodies) {
    if (!body.awake || body.held) continue;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.angle += body.spin * dt;
    const slow = Math.exp(-0.7 * dt);
    body.vx *= slow;
    body.vy *= slow;
    body.spin *= slow;
    // turned back only when heading out, so a piece already over an edge does not jump
    if ((body.x - body.w / 2 < 0 && body.vx < 0) || (body.x + body.w / 2 > width && body.vx > 0)) body.vx *= -BOUNCE;
    if ((body.y - body.h / 2 < 0 && body.vy < 0) || (body.y + body.h / 2 > height && body.vy > 0)) body.vy *= -BOUNCE;
    body.x = Math.min(width, Math.max(0, body.x));
    body.y = Math.min(height, Math.max(0, body.y));
  }
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const [a, b] = [bodies[i], bodies[j]];
      if ((!a.awake && !b.awake) || resting.has(`${i},${j}`)) continue;
      const [ox, oy] = overlap(a, b);
      if (ox <= 0 || oy <= 0) continue;
      // they part along the shallower side; a held piece cannot be pushed
      const axis = ox < oy ? "x" : "y";
      const speed = axis === "x" ? "vx" : "vy";
      const way = b[axis] >= a[axis] ? 1 : -1;
      const give = (body: Body) => (body.held ? 0 : 1 / (body.w * body.h));
      const [ga, gb] = [give(a), give(b)];
      if (ga + gb === 0) continue;
      const depth = Math.min(ox, oy);
      a[axis] -= way * depth * (ga / (ga + gb));
      b[axis] += way * depth * (gb / (ga + gb));
      const closing = (a[speed] - b[speed]) * way;
      if (closing > 0) {
        const push = ((1 + BOUNCE) * closing) / (ga + gb);
        a[speed] -= way * push * ga;
        b[speed] += way * push * gb;
        for (const body of [a, b]) {
          if (body.held) continue;
          body.awake = true;
          body.spin += (Math.sign(a.x - b.x) || 1) * Math.min(35, closing * 0.04) * (body === a ? 1 : -1);
        }
      }
    }
  }
}

/** the topmost piece under a point; later pieces are drawn over earlier ones */
export function pieceAt(bodies: Body[], x: number, y: number) {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const body = bodies[i];
    if (Math.abs(x - body.x) <= body.w / 2 && Math.abs(y - body.y) <= body.h / 2) return i;
  }
  return -1;
}
