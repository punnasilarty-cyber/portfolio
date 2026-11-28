import assert from "node:assert/strict";
import { test } from "node:test";
import { BLAST_LASTS, power, spread, WAVE } from "../src/blast.ts";
import { rewindAt, rewindBeats, rewindLasts } from "../src/rewind.ts";
import { wordTyped } from "../src/features.ts";

const beats = rewindBeats([2560, 2566, 2569]);

test("the tape goes back stage by stage, forward again, and ends today", () => {
  assert.deepEqual(beats.map((b) => b.mode), ["hold", "back", "hold", "back", "hold", "forward", "home"]);
  assert.deepEqual(beats.filter((b) => b.mode === "hold").map((b) => b.stage), [2, 1, 0]);
  assert.deepEqual([rewindAt(beats, 0).year, rewindAt(beats, 0).stage], [2569, 2]);
  const end = rewindAt(beats, rewindLasts(beats) + 99);
  assert.deepEqual([end.mode, end.year, end.stage], ["home", 2569, 2]);
});

test("the counter only moves one way while rolling, and lands on the next school", () => {
  let before = 9999;
  for (let t = beats[0].seconds; t < beats[0].seconds + beats[1].seconds; t += 0.05) {
    const { year, stage } = rewindAt(beats, t);
    assert.ok(year <= before && year >= 2566 && stage === null);
    before = year;
  }
});

test("one stage or none makes a short show without breaking", () => {
  assert.deepEqual(rewindBeats([2569]).map((b) => b.mode), ["hold", "home"]);
  assert.deepEqual(rewindBeats([]), []);
});

test("every grain leaves from home and is back at the end", () => {
  for (const delay of [0, WAVE / 2, WAVE]) {
    assert.equal(spread(0, delay), 0);
    assert.ok(spread(1.8, delay) > 0.8);
    assert.ok(Math.abs(spread(BLAST_LASTS, delay)) < 1e-9);
  }
  assert.ok(power(0) < power(0.7) && power(0.7) < power(9) && power(9) === 1);
  assert.ok(wordTyped("xrewind") === "rewind" && wordTyped("blast") === "blast");
});
