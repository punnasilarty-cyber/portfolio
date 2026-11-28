import assert from "node:assert/strict";
import { test } from "node:test";
import { cracks, inside, shards, type Point } from "../src/glass.ts";
import { opens, STAGES } from "../src/hack.ts";
import { isTheme, nextTheme, THEMES } from "../src/theme.ts";
import { advance, orbitSpeed, sample, type Planet } from "../src/universe.ts";

/** the same numbers every run */
const dice = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("the broken pieces cover the whole screen, wherever it was struck", () => {
  for (const [x, y] of [[600, 400], [3, 5], [1198, 790]]) {
    const pieces = shards(x, y, 1200, 800, dice(x + y));
    for (let px = 1; px < 1200; px += 61) {
      for (let py = 1; py < 800; py += 47) assert.ok(pieces.some((piece) => inside([px, py], piece)), `uncovered ${px},${py} from ${x},${y}`);
    }
  }
});

test("cracks run out from where the blow landed", () => {
  const lines = cracks(100, 200, dice());
  assert.ok(lines.length >= 9);
  assert.deepEqual(lines[0][0], [100, 200] as Point);
});

test("each gate opens for its answer only, whatever the spacing and capitals", () => {
  assert.equal(String.fromCharCode(...STAGES[0].code.split(" ").map((bits) => parseInt(bits, 2))).toLowerCase(), STAGES[0].answer);
  assert.equal([...STAGES[1].code].map((c) => String.fromCharCode(c.charCodeAt(0) - 3)).join("").toLowerCase(), STAGES[1].answer);
  assert.equal(Number(STAGES[2].answer), 6 * 7);
  assert.ok(opens(STAGES[0], " Co De ") && !opens(STAGES[0], "cod") && !opens(STAGES[1], ""));
});

test("the neon theme is real but outside the round of the colour button", () => {
  assert.ok(isTheme("neon") && !(THEMES as readonly string[]).includes("neon"));
  assert.equal(nextTheme("neon"), THEMES[0]);
  assert.ok(!isTheme("toString") && !isTheme(null));
});

test("a planet at orbit speed keeps its distance", () => {
  const star = { x: 400, y: 400, mass: 1 };
  let planets: Planet[] = [{ x: 560, y: 400, vx: 0, vy: orbitSpeed(1, 160), hue: 0, trail: [] }];
  for (let i = 0; i < 600; i++) {
    planets = advance([star], planets, 1 / 60, 800, 800);
    assert.ok(Math.abs(Math.hypot(planets[0].x - 400, planets[0].y - 400) - 160) < 4);
  }
});

test("planets that fall into a star or fly far away are gone, and the sample stays", () => {
  const falling: Planet = { x: 430, y: 400, vx: 0, vy: 0, hue: 0, trail: [] };
  assert.equal(advance([{ x: 400, y: 400, mass: 1 }], [falling], 1, 800, 800).length, 0);
  assert.equal(advance([], [{ ...falling, vx: 1e6 }], 1, 800, 800).length, 0);
  const system = sample(900, 700);
  let planets = system.planets;
  for (let i = 0; i < 900; i++) planets = advance(system.stars, planets, 1 / 60, 900, 700);
  assert.equal(planets.length, 4);
});
