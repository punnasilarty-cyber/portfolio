import assert from "node:assert/strict";
import { test } from "node:test";
import { crc32, uniqueNames, zip } from "../src/zip.ts";

const bytes = (text: string) => new TextEncoder().encode(text);

test("the checksum matches the published check value", () => {
  assert.equal(crc32(bytes("123456789")), 0xcbf43926);
});

test("the archive lists every file where its header says", () => {
  const out = zip([{ name: "ก.txt", data: bytes("one") }, { name: "b.txt", data: bytes("two") }]);
  const view = new DataView(out.buffer);
  const end = out.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  assert.equal(view.getUint16(end + 10, true), 2);
  const directory = view.getUint32(end + 16, true);
  assert.equal(view.getUint32(directory, true), 0x02014b50);
  assert.equal(view.getUint32(view.getUint32(directory + 42, true), true), 0x04034b50);
  assert.equal(directory + view.getUint32(end + 12, true), end);
});

test("a repeated name is numbered before its extension", () => {
  assert.deepEqual(uniqueNames(["a.pdf", "A.pdf", "a.pdf", "b"]), ["a.pdf", "A (2).pdf", "a (3).pdf", "b"]);
});
