import assert from "node:assert/strict";
import { test } from "node:test";
import { ball, layered, noise, paint, shade, type Kind, type Skin } from "../src/heaven-planet.ts";

const finish = (kind: Kind, w = 64, h = 32): Skin => {
  const work = paint(kind, w, h);
  let step = work.next();
  while (!step.done) step = work.next();
  return step.value;
};

test("the noise stays between 0 and 1, and is smooth and repeatable", () => {
  for (let i = 0; i < 400; i++) {
    const [x, y, z] = [i * 0.37 - 20, i * 0.11, -i * 0.23];
    for (const v of [noise(x, y, z), layered(x, y, z, 5)]) assert.ok(v >= 0 && v <= 1);
    assert.ok(Math.abs(noise(x, y, z) - noise(x + 0.001, y, z)) < 0.01);
  }
  assert.equal(noise(1.5, 2.5, 3.5), noise(1.5, 2.5, 3.5));
});

test("the earth has seas, land, clouds and town lights", () => {
  const earth = finish("earth", 128, 64);
  const share = (list: ArrayLike<number>, over: number) => Array.from(list).filter((v) => v > over).length / list.length;
  assert.ok(share(earth.water!, 0) > 0.35 && share(earth.water!, 0) < 0.85);
  assert.ok(share(earth.cloud!, 60) > 0.08 && share(earth.night!, 60) > 0.003);
});

test("a lit ball is bright toward the sun, dark away from it, and clear outside", () => {
  const size = 40;
  const out = new Uint8ClampedArray(size * size * 4);
  shade(out, ball(size, 0.3), finish("rock"), 0.2, 0, [-1, 0, 0.2]);
  const brightness = (x: number) => [0, 1, 2].reduce((sum, c) => sum + out[(20 * size + x) * 4 + c], 0);
  assert.ok(brightness(5) > brightness(34) * 4);
  assert.equal(out[3], 0);
  assert.equal(out[(20 * size + 20) * 4 + 3], 255);
  // a star shines of itself, whatever the light
  shade(out, ball(size, 0), finish("sun"), 0, 0, [0, 0, -1], true);
  assert.ok(brightness(20) > 200);
});
