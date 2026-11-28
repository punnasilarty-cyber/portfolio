import assert from "node:assert/strict";
import { test } from "node:test";
import { command, placeOf, READINGS, TOUR } from "../src/assist.ts";

test("the tour lasts about a minute and says each stop in both languages", () => {
  const total = TOUR.reduce((sum, stop) => sum + stop.seconds, 0);
  assert.ok(total >= 55 && total <= 65, String(total));
  assert.ok(TOUR.every((stop) => stop.find && stop.th && stop.en));
  assert.ok(READINGS.every((each) => each.find));
});

test("spoken words become the right command, in Thai and English", () => {
  const heard = (words: string) => JSON.stringify(command(words));
  const is = (words: string, action: object) => assert.equal(heard(words), JSON.stringify(action), words);
  is("ไปประวัติการศึกษาหน่อย", { go: "education" });
  is("ดูโครงงาน", { go: "is2" });
  is("เกียรติบัตร", { go: "certificates" });
  is("Contact please", { go: "contact" });
  is("เลื่อนลง", { scroll: 1 });
  is("เลื่อนขึ้น", { scroll: -1 });
  is("พาชมหน่อย", { open: "tour" });
  is("อ่านให้ฟัง", { open: "read" });
  is("โหมดอ่านง่าย", { open: "easy" });
  is("เปิดแว่น", { open: "xray" });
  is("หยุด", { stop: true });
  is("stop", { stop: true });
  is("go to top", { go: "top" });
  is("scroll up", { scroll: -1 });
  assert.equal(command("สวัสดีครับ"), null);
  // English words are heard whole only
  assert.equal(command("laptop supper"), null);
});

test("a place in the spoken text is found in the right piece", () => {
  assert.deepEqual(placeOf([0, 5, 12], 0), [0, 0]);
  assert.deepEqual(placeOf([0, 5, 12], 7), [1, 2]);
  assert.deepEqual(placeOf([0, 5, 12], 20), [2, 8]);
});
