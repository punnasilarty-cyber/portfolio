import assert from "node:assert/strict";
import { test } from "node:test";
import { viewOf } from "../src/viewer.ts";

test("each kind of file gets the way the page can show it", () => {
  assert.deepEqual(viewOf("https://a.test/r.pdf", true), { kind: "frame", src: "https://a.test/r.pdf" });
  assert.deepEqual(viewOf("https://a.test/r.pdf?v=3", false), { kind: "pages", src: "https://a.test/r.pdf?v=3" });
  assert.deepEqual(viewOf("https://a.test/r.DOCX?v=2", false), {
    kind: "frame",
    src: "https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Fa.test%2Fr.DOCX%3Fv%3D2",
  });
  assert.equal(viewOf("https://a.test/watch?file=r.pdf", true), null);
  assert.equal(viewOf("http://a.test/r.pdf", true), null);
});
