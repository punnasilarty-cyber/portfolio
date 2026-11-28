import assert from "node:assert/strict";
import { test } from "node:test";
import { education, learning } from "../src/content.ts";
import { reach, yearAt, yearsOf } from "../src/journey.ts";

test("the schooling stages become twelve consecutive school years", () => {
  const years = yearsOf(education);
  assert.equal(years.length, 12);
  years.forEach((entry, i) => assert.equal(entry.year, 2560 + i));
  assert.deepEqual(years.map((entry) => entry.grade).slice(5, 10), ["ป.6", "ม.1", "ม.2", "ม.3", "ม.4"]);
  assert.deepEqual(years.filter((entry) => entry.when === "now").map((entry) => entry.grade), ["ม.4"]);
  assert.equal(years.at(-1)!.when, "ahead");
});

test("scrolling down the stage cards walks through the years in order", () => {
  const years = yearsOf(education);
  const at = (scrolled: number) => yearAt([0, 300, 600].map((top) => ({ top: top + 500 - scrolled, height: 270 })), 500, years);
  assert.equal(at(-100), 0);
  assert.equal(at(0), 0);
  assert.equal(at(269), 5);
  assert.equal(at(285), 5); // in the gap, still the stage just finished
  assert.equal(at(300), 6);
  assert.equal(at(600), 9);
  assert.equal(at(5000), 11);
  let last = 0;
  for (let y = -50; y < 1000; y += 7) {
    assert.ok(at(y) >= last);
    last = at(y);
  }
});

test("the path fills year by year, each stage an equal share, never reaching the goal early", () => {
  const years = yearsOf(education);
  const along = years.map((_, i) => reach(years, i, education.length));
  assert.equal(along[0], 0);
  assert.ok(along.every((value, i) => (!i || value > along[i - 1]) && value < 1));
  assert.equal(reach(years, years.findIndex((year) => year.stage === 1), 3), 1 / 3);
});

test("every skill names its proof in both languages, and a work by the title its card carries", () => {
  assert.ok(learning.skills.every((skill) => skill.th.every(Boolean) && skill.en.every(Boolean)));
  assert.equal(learning.skills.filter((skill) => !skill.work).length, 1);
});
