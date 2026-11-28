import assert from "node:assert/strict";
import { test } from "node:test";
import { answer } from "../src/terminal.ts";

const facts = { english: true, about: ["me"], education: ["school"], projects: [], contacts: ["mail"] };

test("commands answer from the page's facts", () => {
  assert.deepEqual(answer("  ABOUT ", facts).lines, ["me"]);
  assert.deepEqual(answer("projects", facts).lines, ["Nothing listed yet"]);
  assert.equal(answer("theme blue", facts).theme, "blue");
  assert.equal(answer("lang th", facts).english, false);
  assert.deepEqual(answer("goto contact", facts), { lines: [], goto: "contact", close: true });
});

test("what is not understood changes nothing", () => {
  for (const input of ["theme pink", "goto <script>", "rm -rf"]) assert.deepEqual(Object.keys(answer(input, facts)), ["lines"]);
  assert.deepEqual(answer("", facts), { lines: [] });
});
