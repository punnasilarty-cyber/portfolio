import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyAt, pieceAt, restingPairs, step } from "../src/psychic.ts";
import { wordTyped } from "../src/features.ts";

const fly = (body: ReturnType<typeof bodyAt>, vx: number, vy = 0) => Object.assign(body, { awake: true, vx, vy });

test("a thrown piece stays on the screen and turns back at the edge", () => {
  const body = fly(bodyAt(50, 50, 20, 20), 900, -700);
  for (let i = 0; i < 600; i++) {
    step([body], 1 / 60, 200, 150, new Set());
    assert.ok(body.x >= 0 && body.x <= 200 && body.y >= 0 && body.y <= 150);
  }
});

test("a piece left alone never moves", () => {
  const body = bodyAt(50, 50, 20, 20);
  step([body], 0.5, 200, 200, new Set());
  assert.deepEqual([body.x, body.y, body.awake], [50, 50, false]);
});

test("a hit wakes the other piece and passes the speed on", () => {
  const [a, b] = [fly(bodyAt(50, 50, 20, 20), 300), bodyAt(72, 50, 20, 20)];
  step([a, b], 0.02, 400, 100, new Set());
  assert.ok(b.awake && b.vx > a.vx && b.vx > 0);
  // equal pieces keep their total motion, but for the drag of one step
  assert.ok(Math.abs(a.vx + b.vx - 300 * Math.exp(-0.014)) < 1e-6);
  assert.ok(b.x - a.x >= 20 - 1e-9);
});

test("a held piece pushes others and is not pushed", () => {
  const [a, b] = [Object.assign(bodyAt(50, 50, 20, 20), { held: true, awake: true, vx: 200 }), bodyAt(65, 50, 20, 20)];
  step([a, b], 0.02, 400, 100, new Set());
  assert.equal(a.x, 50);
  assert.ok(b.x >= 70 && b.vx > 0);
});

test("pieces already touching as laid out do not burst apart", () => {
  const bodies = [bodyAt(50, 50, 40, 40), bodyAt(60, 50, 40, 40)];
  const resting = restingPairs(bodies);
  assert.deepEqual([...resting], ["0,1"]);
  fly(bodies[0], 0);
  step(bodies, 0.02, 400, 200, resting);
  assert.deepEqual([bodies[0].x, bodies[1].x], [50, 60]);
});

test("the topmost piece under the hand is picked", () => {
  const bodies = [bodyAt(50, 50, 40, 40), bodyAt(60, 50, 40, 40)];
  assert.deepEqual([pieceAt(bodies, 55, 50), pieceAt(bodies, 32, 50), pieceAt(bodies, 300, 300)], [1, 0, -1]);
  assert.equal(wordTyped("xxpsychic"), "psychic");
});
