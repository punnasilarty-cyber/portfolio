import assert from "node:assert/strict";
import { test } from "node:test";
import { contacts, education, profile, sections } from "../src/content.ts";
import { englishGrade, englishPeriod, toEnglish } from "../src/translations.ts";

test("everything written in content.ts has English", () => {
  const texts = [
    profile.intro,
    ...profile.about,
    ...sections.map((section) => section.title),
    ...contacts.map((contact) => contact.name),
    // the mottos themselves stay as the schools wrote them
    ...education.flatMap((stage) => [stage.level, stage.school, stage.program ?? "", ...stage.mottos.map((motto) => motto.label ?? "")]),
  ];
  for (const text of texts) assert.ok(!/[\u0E00-\u0E7F]{4}/.test(toEnglish(text)), `no English for ${text}`);
});

test("years and grades read the English way, unknown text stays", () => {
  assert.equal(englishPeriod("2569 – 2571 (คาดว่าจบ)"), "2026 – 2028 (expected)");
  assert.deepEqual([englishGrade("ป.1"), englishGrade("ม.4")], ["Prathom 1", "Mattayom 4"]);
  assert.equal(toEnglish("การ์ดใหม่"), "การ์ดใหม่");
});
