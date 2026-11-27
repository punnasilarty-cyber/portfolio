import assert from "node:assert/strict";
import { test } from "node:test";
import { education } from "../src/content.ts";
import { yearAt, yearsOf } from "../src/journey.ts";

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
