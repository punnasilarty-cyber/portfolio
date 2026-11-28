import assert from "node:assert/strict";
import { test } from "node:test";
import { AI_LASTS, AI_SCENES, EXAMPLES, GROUND, rightShare, sceneAt, sceneStart, scatter, shortestPath, trend, typed } from "../src/aishow.ts";
import { answer } from "../src/terminal.ts";

test("every moment belongs to one scene, in order", () => {
  assert.deepEqual(sceneAt(0), { at: 0, local: 0 });
  AI_SCENES.forEach((scene, i) => {
    assert.equal(sceneAt(sceneStart(i)).at, i);
    assert.equal(sceneAt(sceneStart(i) + scene.seconds - 0.001).at, i);
  });
  // the last scene stays when the time is up
  assert.equal(sceneAt(AI_LASTS + 100).at, AI_SCENES.length - 1);
});

test("every scene has its words in both languages", () => {
  for (const scene of AI_SCENES) for (const words of [scene.title, scene.caption]) assert.ok(words.th && words.en);
});

test("typing never splits a Thai mark from its letter", () => {
  assert.equal(typed("ดูแล", 1, 1), "ดู");
  assert.equal(typed("น้ำ", 1, 1), "น้");
  assert.equal(typed("abc", -1, 10), "");
  assert.equal(typed("abc", 99, 10), "abc");
});

test("the noise is the same each time, and between 0 and 1", () => {
  for (const seed of [0, 1, 42, 9999]) assert.ok(scatter(seed) === scatter(seed) && scatter(seed) >= 0 && scatter(seed) < 1);
});

test("the terminal opens the show and lists it", () => {
  const facts = { english: true, about: [], education: [], projects: [], contacts: [] };
  assert.equal(answer("ai", facts).open, "ai");
  assert.ok(answer("help", facts).lines.join(" ").includes("what AI can do"));
});

test("every ability is explained in both languages, with time to read it", () => {
  for (const scene of AI_SCENES.filter((each) => !["hello", "turn", "end"].includes(each.id))) {
    assert.ok(scene.more && scene.seconds >= 15, scene.id);
    for (const words of [...scene.more.how, scene.more.uses, scene.more.limit]) assert.ok(words.th && words.en);
  }
});

test("the learned line sorts every example, the first one does not", () => {
  assert.ok(EXAMPLES.every((p) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100));
  assert.equal(rightShare(1, 0), 1);
  assert.ok(rightShare(-0.5, 72) < 0.8);
});

test("the trend line follows a straight series exactly", () => {
  const line = trend([10, 8, 6, 4]);
  assert.deepEqual([line.slope, line.start, line.spread, line.at(5)], [-2, 10, 0, 0]);
});

test("the route is the shortest, step by step, around the walls", () => {
  const { path } = shortestPath(["R.#", "..#", "..G"]);
  assert.equal(path.length - 1, 4);
  const real = shortestPath(GROUND);
  const cells = GROUND.join("");
  assert.deepEqual([cells[real.path[0]], cells[real.path.at(-1)!]], ["R", "G"]);
  real.path.slice(1).forEach((cell, i) => {
    const step = Math.abs(cell - real.path[i]);
    assert.ok(cells[cell] !== "#" && (step === 1 || step === GROUND[0].length));
  });
  assert.deepEqual(shortestPath(["R#G"]).path, []);
});

test("the dark side comes after the abilities, announced as imagined, and the show ends beyond it", () => {
  const dark = AI_SCENES.map((scene) => !!scene.dark);
  const first = dark.indexOf(true);
  assert.equal(AI_SCENES[first].id, "turn");
  assert.ok(AI_SCENES[first].caption.th.includes("สมมติ"));
  assert.ok(dark.slice(first, -1).every(Boolean) && !dark.at(-1));
});
