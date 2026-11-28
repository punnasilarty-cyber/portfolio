import assert from "node:assert/strict";
import { test } from "node:test";
import { END, lineAt, MAX_CYCLES_PER_SECOND, momentAt, WHITE_FULL } from "../src/heaven.ts";
import { answer } from "../src/terminal.ts";

const frames = Array.from({ length: Math.ceil(END * 60) + 1 }, (_, i) => momentAt(i / 60));

test("it never flashes: one white rise and fall, and a slow enough day", () => {
  let turns = 0;
  for (let i = 2; i < frames.length; i++) {
    const [a, b, c] = [frames[i - 2].white, frames[i - 1].white, frames[i].white];
    assert.ok(Math.abs(c - b) < 0.05, "white jumps");
    if (b - a > 1e-9 && c - b < -1e-9) turns++;
  }
  assert.ok(turns <= 1);
  assert.ok(frames.every((frame) => frame.daySpeed <= Math.PI * 2 * MAX_CYCLES_PER_SECOND));
});

test("time speeds up, the page changes only in full white, and it ends clear", () => {
  assert.ok(frames.every((frame, i) => !i || frame.speed >= frames[i - 1].speed));
  assert.equal(momentAt(WHITE_FULL).white, 1);
  assert.equal(momentAt(WHITE_FULL - 0.1).renewed, false);
  assert.deepEqual([momentAt(END).white, momentAt(END).over], [0, true]);
  assert.equal(lineAt(0, true), "Time begins to quicken…");
});

test("the terminal knows the word without listing it", () => {
  const facts = { english: true, about: [], education: [], projects: [], contacts: [] };
  assert.equal(answer("heaven", facts).heaven, true);
  assert.ok(!answer("help", facts).lines.join(" ").includes("heaven"));
});
