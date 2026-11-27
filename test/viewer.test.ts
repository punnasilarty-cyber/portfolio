import assert from "node:assert/strict";
import { test } from "node:test";
import { frameOf } from "../src/viewer.ts";

test("only files the page can show are framed", () => {
  assert.equal(frameOf("https://a.test/r.pdf", true), "https://a.test/r.pdf");
  assert.equal(frameOf("https://a.test/r.pdf", false), null);
  assert.equal(frameOf("https://a.test/r.DOCX?v=2", false), "https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fa.test%2Fr.DOCX%3Fv%3D2");
  assert.equal(frameOf("https://a.test/watch?file=r.pdf", true), null);
  assert.equal(frameOf("http://a.test/r.pdf", true), null);
});
