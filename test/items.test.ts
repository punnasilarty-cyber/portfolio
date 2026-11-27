import assert from "node:assert/strict";
import { test } from "node:test";
import type { Work } from "../src/content.ts";
import { addressOf, filesOf, moved, safeName, unusedFiles } from "../src/items.ts";

const item = (title: string, more: Partial<Work> = {}): Work => ({ title, kind: "", summary: "", section: "is2", ...more });

test("uploaded file names stay readable and safe", () => {
  assert.equal(safeName("รายงานวิชา IS เรื่อง น้ำ.pdf"), "รายงานวิชา IS เรื่อง น้ำ.pdf");
  assert.equal(safeName("../a/b?c#d%.docx"), "-a-b-c-d-.docx");
  assert.equal(safeName(".pdf"), "pdf");
  const long = safeName(`${"ก".repeat(300)}.pdf`);
  assert.ok(Buffer.byteLength(long) <= 200 && long.endsWith(".pdf"));
});

test("only files nobody else points at are removed", () => {
  const link = addressOf("works/1/ราย งาน.pdf");
  const old = item("a", { image: "/works/1.jpg", more: ["/works/2.jpg", "/schools/x.png"], link: `${link}?v=2` });
  assert.deepEqual(filesOf(old), ["works/1.jpg", "works/2.jpg", "works/1/ราย งาน.pdf"]);
  assert.deepEqual(unusedFiles(old, [item("b", { image: "/works/2.jpg", link })]), ["works/1.jpg"]);
  assert.deepEqual(filesOf(item("c", { link: "https://example.test/works/r.pdf" })), []);
});

test("items move only among those under the same heading", () => {
  const works = [item("a", { group: "x" }), item("b"), item("c", { group: "x" }), item("d", { section: "activities", group: "x" })];
  assert.deepEqual(moved(works, 2, -1)!.map((work) => work.title), ["c", "b", "a", "d"]);
  assert.equal(moved(works, 2, 1), null);
  assert.equal(moved(works, 1, -1), null);
  assert.equal(works[0].title, "a");
});
