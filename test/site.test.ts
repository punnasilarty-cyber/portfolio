import assert from "node:assert/strict";
import { test } from "node:test";
import { documentsOf, filesOf, unusedFiles } from "../src/items.ts";
import { addressOf } from "../src/items.ts";
import { defaultSite, fromDraft, readSite, toDraft } from "../src/site.ts";
import { toEnglish } from "../src/translations.ts";

const draft = () => toDraft(defaultSite, (text) => toEnglish(text));

test("an unchanged draft saves the same content, with its English", () => {
  const saved = fromDraft(draft());
  assert.equal(saved.intro, defaultSite.intro);
  assert.deepEqual(saved.education.map((stage) => stage.level), defaultSite.education.map((stage) => stage.level));
  assert.equal(saved.en[defaultSite.intro], toEnglish(defaultSite.intro));
  assert.deepEqual(readSite(JSON.parse(JSON.stringify(saved))).contacts, saved.contacts);
});

test("what cannot be shown is refused with a reason", () => {
  const broken = (change: (value: ReturnType<typeof draft>) => void) => {
    const value = draft();
    change(value);
    return () => fromDraft(value);
  };
  assert.throws(broken((d) => (d.stages[0].level.th = "ประถม")), /ระดับชั้น/);
  assert.throws(broken((d) => (d.stages[0].period = "2560")), /ปีการศึกษา/);
  assert.throws(broken((d) => (d.contacts[0].href = "javascript:alert(1)")), /ลิงก์/);
  assert.throws(broken((d) => (d.stages = [])), /อย่างน้อย/);
  assert.throws(broken((d) => (d.intro.th = " ")), /หน้าแรก/);
});

test("a plain hyphen between grades is accepted", () => {
  const value = draft();
  value.stages[0].level.th = "ประถมศึกษาปีที่ 1-6";
  assert.equal(fromDraft(value).education[0].level, "ประถมศึกษาปีที่ 1–6");
});

test("a damaged file falls back field by field and drops unsafe links", () => {
  assert.equal(readSite("nonsense"), defaultSite);
  const site = readSite({ intro: 5, contacts: [{ name: "x", value: "y", href: "javascript:1" }], education: [{ level: "?" }], en: { a: "b", c: 1 } });
  assert.equal(site.intro, defaultSite.intro);
  assert.deepEqual(site.contacts, [{ name: "x", value: "y", href: undefined }]);
  assert.equal(site.education, defaultSite.education);
  assert.deepEqual(site.en, { a: "b" });
});

test("every document of an item counts as in use", () => {
  const [a, b] = [addressOf("works/1/a.pdf"), addressOf("works/1/ข.docx")];
  const work = { title: "t", kind: "", summary: "", link: a, files: [{ link: b, name: "ข.docx" }] };
  assert.deepEqual(documentsOf(work).map((file) => file.name), ["a.pdf", "ข.docx"]);
  assert.deepEqual(filesOf(work), ["works/1/a.pdf", "works/1/ข.docx"]);
  assert.deepEqual(unusedFiles(work, [{ ...work, files: [] }]), ["works/1/ข.docx"]);
});

test("the stories, skills and goal survive editing and saving, line for line with their English", () => {
  const value = draft();
  value.stages[0].tried = { th: "ต่อเลโก้\n\nเล่นเกม", en: "Built bricks\n\nPlayed games" };
  value.stages[1].tried = { th: "", en: "" };
  value.stages[2].why = { th: "อยากรู้", en: "Curious" };
  value.learning.goal = { th: "สร้างของใช้จริง", en: "Build useful things" };
  value.learning.skills.push({ name: { th: "ทำงานกลุ่ม", en: "Teamwork" }, proof: { th: "", en: "" }, work: " " });
  const saved = readSite(JSON.parse(JSON.stringify(fromDraft(value))));
  assert.deepEqual(saved.education[0].tried, ["ต่อเลโก้", "เล่นเกม"]);
  assert.equal(saved.en["เล่นเกม"], "Played games");
  // emptied stays empty, rather than coming back from content.ts
  assert.deepEqual(saved.education[1].tried, []);
  assert.equal(saved.education[2].why, "อยากรู้");
  assert.equal(saved.learning.goal, "สร้างของใช้จริง");
  assert.deepEqual(saved.learning.skills.at(-1), { name: "ทำงานกลุ่ม", proof: "", work: undefined });
  assert.equal(toDraft(saved, (text) => saved.en[text] ?? text).stages[0].tried.en, "Built bricks\nPlayed games");
});

test("a file saved before stories existed still shows them, and a skill needs a name", () => {
  const old = JSON.parse(JSON.stringify(defaultSite));
  delete old.learning;
  for (const stage of old.education) {
    delete stage.tried;
    delete stage.why;
  }
  const read = readSite(old);
  assert.deepEqual(read.education.map((stage) => stage.tried), defaultSite.education.map((stage) => stage.tried));
  assert.deepEqual(read.learning, defaultSite.learning);
  const value = draft();
  value.learning.skills[0].name.th = "";
  assert.throws(() => fromDraft(value), /ทักษะที่ 1/);
});
