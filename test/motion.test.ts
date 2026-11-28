import assert from "node:assert/strict";
import { test } from "node:test";
import { contained } from "../src/grow.ts";
import { words } from "../src/words.ts";

test("splitting into words loses nothing, in Thai and English", () => {
  for (const text of ["ผมเป็นนักเรียนชั้นมัธยมศึกษาปีที่ 4 ชอบเขียนโปรแกรม", "I build things (and break them), then fix them.", "  ", ""]) {
    assert.equal(words(text).join(""), text);
  }
  assert.ok(words("ผมชอบเขียนโปรแกรม").length > 2);
});

test("a picture shown whole stays inside its box, centred, in its own shape", () => {
  assert.deepEqual(contained({ x: 10, y: 20, width: 400, height: 400 }, 200, 100), { x: 10, y: 120, width: 400, height: 200 });
});
