import assert from "node:assert/strict";
import { test } from "node:test";
import { readBackup, unzip } from "../src/backup.ts";
import { addressOf } from "../src/items.ts";
import { zip } from "../src/zip.ts";

const bytes = (value: unknown) => new TextEncoder().encode(typeof value === "string" ? value : JSON.stringify(value));
const works = [{ title: "ก", kind: "", summary: "", image: "/works/1.jpg", link: addressOf("works/2/ข.pdf") }];
const full = [{ name: "works.json", data: bytes(works) }, { name: "works/1.jpg", data: bytes("jpg") }, { name: "works/2/ข.pdf", data: bytes("pdf") }];

test("a backup comes back as it went in", () => {
  const back = readBackup(unzip(zip(full)));
  assert.deepEqual(back.works, works);
  assert.equal(back.site, null);
  assert.deepEqual(back.files.map((file) => [file.name, new TextDecoder().decode(file.data)]), [["works/1.jpg", "jpg"], ["works/2/ข.pdf", "pdf"]]);
  assert.deepEqual(back.missing, []);
  assert.deepEqual(readBackup(full.slice(0, 2)).missing, ["works/2/ข.pdf"]);
});

test("a damaged file is refused", () => {
  const good = zip(full);
  const flipped = good.slice();
  flipped[45] ^= 1;
  for (const bad of [bytes("not a zip at all, only some text"), good.slice(0, good.length - 5), flipped, new Uint8Array()]) assert.throws(() => unzip(bad), /ไฟล์สำรอง/);
});

test("nothing outside the works folder, of another kind, or with a script link gets in", () => {
  for (const name of ["index.html", "vault.txt", "works/page.html", "works/a.svg", "works/../x.pdf", "../works/x.pdf", "works/a/b/c.pdf", "works\\x.pdf"]) {
    assert.throws(() => readBackup([full[0], { name, data: bytes("x") }]), /ไม่อนุญาต/, name);
  }
  assert.throws(() => readBackup([{ name: "works.json", data: bytes([{ title: "x", link: "javascript:alert(1)" }]) }]), /ไม่ถูกต้อง/);
  assert.throws(() => readBackup([{ name: "works.json", data: bytes({}) }]), /ไม่ถูกต้อง/);
  assert.throws(() => readBackup([]), /ไม่พบ/);
});
