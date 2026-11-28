import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOMS, END, lineAt, MAX_CYCLES_PER_SECOND, momentAt, ticks, WHITE_FULL, yearLabel, yearsAt } from "../src/heaven.ts";
import { collide, galaxies } from "../src/heaven-galaxy.ts";
import { answer } from "../src/terminal.ts";

const frames = Array.from({ length: Math.ceil(END * 60) + 1 }, (_, i) => momentAt(i / 60));

/** how often a value turns from rising to falling or back */
const turns = (values: number[]) => {
  let count = 0;
  let way = 0;
  for (let i = 1; i < values.length; i++) {
    const step = values[i] - values[i - 1];
    if (Math.abs(step) < 1e-9) continue;
    if (way && Math.sign(step) !== way) count++;
    way = Math.sign(step);
  }
  return count;
};

test("it never flashes: whole-screen changes come and go once, gently, and the day is slow enough", () => {
  // the morning appears behind full white, so what can be seen of it is what counts
  const seen = { white: (f: (typeof frames)[number]) => f.white, manga: (f: (typeof frames)[number]) => f.manga, dawn: (f: (typeof frames)[number]) => f.dawn * (1 - f.white), birth: (f: (typeof frames)[number]) => f.birth * (1 - f.white) };
  for (const [key, of] of Object.entries(seen)) {
    const values = frames.map(of);
    assert.ok(turns(values) <= 1, key);
    assert.ok(values.every((value, i) => !i || Math.abs(value - values[i - 1]) < 0.05), key + " jumps");
  }
  assert.ok(frames.every((frame) => frame.daySpeed <= Math.PI * 2 * MAX_CYCLES_PER_SECOND));
});

test("time speeds up, the page changes only in full white, and it ends clear", () => {
  assert.ok(frames.every((frame, i) => !i || frame.speed >= frames[i - 1].speed));
  assert.equal(momentAt(WHITE_FULL).white, 1);
  assert.equal(momentAt(WHITE_FULL - 0.1).renewed, false);
  assert.deepEqual([momentAt(END).white, momentAt(END).dawn, momentAt(END).birth, momentAt(END).over], [0, 0, 0, true]);
  // the newborn universe is already there, under the white, when the white begins to clear
  assert.equal(momentAt(WHITE_FULL + 0.7).birth, 1);
  assert.equal(lineAt(0, true), "[ An ordinary morning at our school… ]");
  assert.equal(lineAt(21, false), "[ Made in Heaven ]");
});

test("the clock ticks ever closer together, and stops before the white", () => {
  const at = ticks();
  const gaps = at.slice(1).map((t, i) => t - at[i]);
  assert.ok(gaps.every((gap, i) => !i || gap <= gaps[i - 1] + 1e-9));
  assert.ok(gaps[0] > 0.7 && gaps.at(-1)! < 0.06 && at.at(-1)! < WHITE_FULL);
});

test("the terminal knows the word without listing it", () => {
  const facts = { english: true, about: [], education: [], projects: [], contacts: [] };
  assert.equal(answer("heaven", facts).heaven, true);
  assert.ok(!answer("help", facts).lines.join(" ").includes("heaven"));
});

test("the show lasts a minute and every part of it comes in turn", () => {
  assert.equal(END, 60);
  const order = ["seasons", "future", "ruin", "cosmic", "manga", "world", "solar", "galaxy", "giant", "binary", "collapse"] as const;
  const first = order.map((key) => frames.findIndex((frame) => frame[key] > 0.5));
  assert.ok(first.every((at, i) => at >= 0 && (!i || at > first[i - 1])), first.join());
});

test("the years never stop rising, from this year to beyond counting", () => {
  assert.equal(yearsAt(0), 0);
  for (let i = 1; i <= (END + 5) * 30; i++) assert.ok(yearsAt(i / 30) > yearsAt((i - 1) / 30), "stopped at " + i / 30);
  assert.equal(yearLabel(0, false), "พ.ศ. 2,569");
  assert.equal(yearLabel(0, true), "Year 2,026");
  assert.ok(yearLabel(28, false).includes("ล้าน") && yearLabel(40, false).includes("พันล้าน") && yearLabel(48.5, false).includes("ล้านล้าน") && yearLabel(END, true).includes("× 10²¹"));
});

test("two galaxies draw together and throw out tails, with every star still somewhere", () => {
  let seed = 3;
  const meeting = galaxies(300, () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646);
  const apart = () => Math.hypot(meeting.cores[0].x - meeting.cores[1].x, meeting.cores[0].y - meeting.cores[1].y);
  const wide = () => meeting.dots.filter((dot) => Math.hypot(dot.x, dot.y) > 1.2).length;
  const [start, before] = [apart(), wide()];
  for (let i = 0; i < 360; i++) collide(meeting, 1 / 60);
  assert.ok(apart() < start * 0.4, "cores " + apart());
  assert.ok(meeting.dots.every((dot) => Number.isFinite(dot.x + dot.y)) && wide() !== before);
});

test("the blasts come in order, growing to the mightiest at the big bang", () => {
  assert.ok(BOOMS.every((boom, i) => !i || boom.at - BOOMS[i - 1].at > 1.5));
  assert.equal(BOOMS.at(-1)!.at, WHITE_FULL);
  assert.ok(BOOMS.every((boom) => boom.power <= BOOMS.at(-1)!.power));
});
