import assert from "node:assert/strict";
import { test } from "node:test";
import { paintOrder } from "../src/components/iso.ts";
import { LAYOUTS, type Rect } from "../src/components/school-layouts.ts";

test("farther footprints are painted first", () => {
  const north = { at: [0, -40, 60, 10] as Rect };
  const south = { at: [0, 0, 10, 10] as Rect };
  const east = { at: [30, 0, 10, 10] as Rect };
  assert.deepEqual(paintOrder([east, south, north]), [north, south, east]);
});

test("buildings of a school never overlap and stay on their ground", () => {
  for (const [school, { buildings, ground }] of Object.entries(LAYOUTS)) {
    buildings.forEach(({ at: [x, y, w, d] }, i) => {
      assert.ok(x >= ground[0] && y >= ground[1] && x + w <= ground[0] + ground[2] && y + d <= ground[1] + ground[3], `${school} #${i} is off the ground`);
      buildings.slice(i + 1).forEach(({ at: [u, v, s, t] }, j) => {
        assert.ok(!(x < u + s && u < x + w && y < v + t && v < y + d), `${school} #${i} overlaps #${i + 1 + j}`);
      });
    });
  }
});

// paintOrder only sorts footprints that do not overlap
test("nothing standing in the Sura model overlaps", () => {
  const { buildings, salas = [], trees, palms = [], silverPalms = [], sign, flag } = LAYOUTS["โรงเรียนสุรวิทยาคาร"];
  const spot = ([x, y]: [number, number], r = 1): Rect => [x - r, y - r, r * 2, r * 2];
  const all = [...buildings.map((b) => b.at), ...salas.map((s) => s.at), ...[...trees, ...palms, ...silverPalms].map((p) => spot(p)), sign, spot(flag, 3)];
  all.forEach(([x, y, w, d], i) => {
    for (const [u, v, s, t] of all.slice(i + 1)) assert.ok(!(x < u + s && u < x + w && y < v + t && v < y + d), `${[x, y, w, d]} overlaps ${[u, v, s, t]}`);
  });
});
