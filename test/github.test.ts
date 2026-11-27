import assert from "node:assert/strict";
import { test } from "node:test";
import { fromBase64, toBase64 } from "../src/github.ts";

test("Thai text and large files survive the base64 round trip", () => {
  const text = "ผลงานตัดต่อ ".repeat(10000);
  const encoded = toBase64(new TextEncoder().encode(text));
  assert.equal(encoded, Buffer.from(text).toString("base64"));
  // GitHub wraps the content it returns
  assert.equal(new TextDecoder().decode(fromBase64(encoded.replace(/.{60}/g, "$&\n"))), text);
});
