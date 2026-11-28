import assert from "node:assert/strict";
import { test } from "node:test";
import { settleWithin } from "../src/loading.ts";

test("every task is counted, failed ones included", async () => {
  const counts: number[] = [];
  await settleWithin([Promise.resolve(), Promise.reject(new Error("broken"))], 5000, (done) => counts.push(done));
  assert.deepEqual(counts, [1, 2]);
});

test("a task that never ends does not hold the page", async () => {
  const counts: number[] = [];
  await settleWithin([Promise.resolve(), new Promise(() => {})], 20, (done) => counts.push(done));
  assert.deepEqual(counts, [1]);
});
