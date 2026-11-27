import type { Rect } from "./school-layouts.ts";

/**
 * Back-to-front order for non-overlapping footprints seen from the south-east. One thing is behind another when it
 * lies wholly north of it while sharing some east-west span, or wholly west of it while sharing some north-south span.
 */
export function paintOrder<T extends { at: Rect }>(items: T[]): T[] {
  const behind = ({ at: [ax, ay, aw, ad] }: T, { at: [bx, by, bw, bd] }: T) => {
    const shareX = ax < bx + bw && bx < ax + aw;
    const shareY = ay < by + bd && by < ay + ad;
    if (shareX && !shareY) return ay < by;
    if (shareY && !shareX) return ax < bx;
    return ax + aw / 2 + ay + ad / 2 < bx + bw / 2 + by + bd / 2;
  };
  const waiting = [...items];
  const placed: T[] = [];
  while (waiting.length) {
    // the first one with nothing left behind it; a cycle (rare) falls back to the first in line
    const next = waiting.findIndex((item) => waiting.every((other) => other === item || !behind(other, item)));
    placed.push(...waiting.splice(Math.max(next, 0), 1));
  }
  return placed;
}
