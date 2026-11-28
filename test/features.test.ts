import assert from "node:assert/strict";
import { test } from "node:test";
import { readFound, search, SECRETS, slideAfter, spiral, wordTyped } from "../src/features.ts";
import { fill, filesToKeep } from "../scripts/precache.mjs";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { answer } from "../src/terminal.ts";

test("secret words are noticed at the end of what was typed", () => {
  assert.equal(wordTyped("xxtimestop"), "timestop");
  assert.equal(wordTyped("matrix"), "matrix");
  assert.equal(wordTyped("matri"), undefined);
});

test("the found list survives damage and never counts twice", () => {
  assert.deepEqual(readFound('["matrix","matrix","nothing","terminal"]'), ["terminal", "matrix"]);
  for (const bad of [null, "", "{", '{"a":1}', "5"]) assert.deepEqual(readFound(bad), []);
  assert.equal(SECRETS.length, 5);
});

test("search needs every word, in any order and case", () => {
  const items = [{ words: "Infographic pond IS2" }, { words: "รายงาน IS2 PDF" }];
  assert.deepEqual(search(items, "is2 POND"), [items[0]]);
  assert.deepEqual(search(items, "รายงาน pdf"), [items[1]]);
  assert.equal(search(items, "  ").length, 2);
  assert.equal(search(items, "none").length, 0);
});

test("slides stop at both ends", () => {
  assert.deepEqual([slideAfter(0, -1, 5), slideAfter(4, 1, 5), slideAfter(2, 1, 5)], [0, 4, 3]);
});

test("the terminal opens features, and keeps the secret ones out of help", () => {
  const facts = { english: true, about: [], education: [], projects: [], contacts: [] };
  for (const name of ["present", "matrix", "timestop", "blackhole", "psychic"]) assert.equal(answer(name, facts).open, name);
  const help = answer("help", facts).lines.join(" ");
  assert.ok(help.includes("present") && !help.includes("matrix") && !help.includes("timestop"));
  // the ID card is hidden for now
  assert.equal(answer("card", facts).open, undefined);
});

test("a pulled piece starts at home and ends in the hole", () => {
  const near = (a: number[], b: number[]) => a.every((value, i) => Math.abs(value - b[i]) < 1e-9);
  assert.ok(near(spiral(0, 300, -120), [0, 0]));
  assert.ok(near(spiral(1, 300, -120), [300, -120]));
});

test("the offline list holds the built files, not the editor's, and changes with them", () => {
  const root = mkdtempSync(join(tmpdir(), "built-"));
  mkdirSync(join(root, "_next"));
  mkdirSync(join(root, "works"));
  for (const name of ["index.html", "_next/ก ข.js", "sw.js", "404.html", "works.json", "vault.txt", "works/a.pdf"]) writeFileSync(join(root, name), name);
  const first = filesToKeep(root);
  assert.deepEqual(first.files, ["", "_next/%E0%B8%81%20%E0%B8%82.js", "index.html"]);
  writeFileSync(join(root, "index.html"), "changed");
  assert.notEqual(filesToKeep(root).build, first.build);
  const worker = fill('const BUILD = "dev";\r\nconst FILES = [];\r\n', first);
  assert.ok(worker.includes(first.build) && worker.includes('"index.html"'));
  assert.throws(() => fill("nothing here", first));
});
