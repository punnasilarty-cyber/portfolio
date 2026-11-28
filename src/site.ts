// เนื้อหาที่แก้จากหน้าเว็บได้นอกจากการ์ด: หน้าแรก เกี่ยวกับฉัน ติดต่อ และประวัติการศึกษา
// เก็บใน site.json บนสาขา gh-pages ช่องไหนไม่มีหรือเสียจะใช้ค่าใน content.ts
import { contacts, education, profile, type Contact, type Schooling } from "./content.ts";
import { yearsOf } from "./journey.ts";

export type Site = {
  intro: string;
  about: string[];
  contacts: Contact[];
  education: Schooling[];
  /** คำแปลภาษาอังกฤษที่เจ้าของเว็บใส่เอง จับคู่ด้วยข้อความไทย */
  en: Record<string, string>;
};

export const defaultSite: Site = { intro: profile.intro, about: profile.about, contacts, education, en: {} };

/** only addresses that open a page, a mail or a call; anything else, scripts included, is dropped */
export const safeLink = (value: unknown) => (typeof value === "string" && /^(https?:\/\/|mailto:|tel:)/i.test(value.trim()) ? value.trim() : undefined);

type Loose = Record<string, unknown>;
const isObject = (value: unknown): value is Loose => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) => (Array.isArray(value) ? value.filter(isObject) : []);
export const texts = (value: unknown): Record<string, string> => (isObject(value) ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {});

/** why the schooling cannot be shown, or null when it can: the journey reads grades and years out of the text */
export function stagesProblem(stages: Schooling[]): string | null {
  if (!stages.length) return "ต้องมีประวัติการศึกษาอย่างน้อย 1 ช่วง";
  for (const [i, stage] of stages.entries()) {
    const where = `ช่วงที่ ${i + 1}`;
    if (!stage.school.trim()) return `${where}: ใส่ชื่อโรงเรียน`;
    const grades = stage.level.match(/(\d)–(\d)/);
    if (!grades || Number(grades[1]) > Number(grades[2])) return `${where}: ระดับชั้นต้องลงท้ายด้วยช่วงชั้น เช่น มัธยมศึกษาปีที่ 4–6`;
    const years = stage.period.match(/(\d{4})\D+(\d{4})/);
    if (!years || Number(years[1]) > Number(years[2]) || Number(years[2]) - Number(years[1]) > 12) return `${where}: ปีการศึกษาต้องเป็นช่วง เช่น 2569 – 2571`;
  }
  try {
    yearsOf(stages);
  } catch {
    return "อ่านประวัติการศึกษาไม่ได้ ตรวจระดับชั้นและปีการศึกษา";
  }
  return null;
}

/** the saved file as the page can use it, however it was written */
export function readSite(data: unknown): Site {
  if (!isObject(data)) return defaultSite;
  const about = Array.isArray(data.about) ? data.about.map(text).filter((paragraph) => paragraph.trim()) : null;
  const channels = Array.isArray(data.contacts)
    ? list(data.contacts)
        .map((item): Contact => ({ name: text(item.name), value: text(item.value), href: safeLink(item.href) }))
        .filter((item) => item.name.trim() && item.value.trim())
    : null;
  const stages = list(data.education).map(
    (item): Schooling => ({
      level: text(item.level),
      school: text(item.school),
      period: text(item.period),
      program: text(item.program) || undefined,
      current: item.current === true,
      website: safeLink(item.website) ?? "",
      logo: text(item.logo).startsWith("/") ? text(item.logo) : "",
      mottos: list(item.mottos)
        .map((motto) => ({ label: text(motto.label) || undefined, text: text(motto.text) }))
        .filter((motto) => motto.text.trim()),
      schoolColors: list(item.schoolColors)
        .map((color) => ({ name: text(color.name), hex: text(color.hex) }))
        .filter((color) => /^#[0-9a-f]{6}$/i.test(color.hex)),
    }),
  );
  return {
    intro: text(data.intro).trim() ? text(data.intro) : defaultSite.intro,
    about: about?.length ? about : defaultSite.about,
    // an emptied list is the owner's choice
    contacts: channels ?? defaultSite.contacts,
    education: stagesProblem(stages) ? defaultSite.education : stages,
    en: texts(data.en),
  };
}

/** a text with its English, as the editor holds it */
export type Pair = { th: string; en: string };

export type Draft = {
  intro: Pair;
  about: Pair[];
  contacts: { name: Pair; value: string; href: string }[];
  stages: { level: Pair; school: Pair; period: string; program: Pair; current: boolean; website: string; mottos: { label: Pair; text: Pair }[]; logo: string; schoolColors: Schooling["schoolColors"] }[];
};

/** `english` gives what the page shows in English now, or the text itself when there is none */
export function toDraft(site: Site, english: (text: string) => string): Draft {
  const pair = (th = ""): Pair => ({ th, en: th && english(th) !== th ? english(th) : "" });
  return {
    intro: pair(site.intro),
    about: site.about.map(pair),
    contacts: site.contacts.map((item) => ({ name: pair(item.name), value: item.value, href: item.href ?? "" })),
    stages: site.education.map((stage) => ({
      level: pair(stage.level),
      school: pair(stage.school),
      period: stage.period,
      program: pair(stage.program),
      current: !!stage.current,
      website: stage.website,
      mottos: stage.mottos.map((motto) => ({ label: pair(motto.label), text: pair(motto.text) })),
      logo: stage.logo,
      schoolColors: stage.schoolColors,
    })),
  };
}

/** the draft as a site to save; throws with the reason when something cannot be saved */
export function fromDraft(draft: Draft): Site {
  const en: Record<string, string> = {};
  const keep = (pair: Pair) => {
    const th = pair.th.trim();
    if (th && pair.en.trim()) en[th] = pair.en.trim();
    return th;
  };
  const intro = keep(draft.intro);
  const about = draft.about.map(keep).filter(Boolean);
  if (!intro) throw new Error("ใส่ข้อความแนะนำตัวในหน้าแรก");
  if (!about.length) throw new Error("ใส่ข้อความเกี่ยวกับฉันอย่างน้อย 1 ย่อหน้า");
  const channels = draft.contacts.map((item, i): Contact => {
    const name = keep(item.name);
    const value = item.value.trim();
    if (!name || !value) throw new Error(`ช่องทางติดต่อที่ ${i + 1}: ใส่ทั้งชื่อช่องทางและข้อความ`);
    const href = item.href.trim();
    if (href && !safeLink(href)) throw new Error(`ช่องทางติดต่อที่ ${i + 1}: ลิงก์ต้องขึ้นต้นด้วย https:// mailto: หรือ tel:`);
    return { name, value, href: href || undefined };
  });
  const stages = draft.stages.map((stage, i): Schooling => {
    const website = stage.website.trim();
    if (website && !/^https?:\/\//i.test(website)) throw new Error(`ช่วงที่ ${i + 1}: เว็บไซต์ต้องขึ้นต้นด้วย https://`);
    return {
      // a plain hyphen between two grades is meant as the dash the journey looks for
      level: keep({ ...stage.level, th: stage.level.th.replace(/(\d)\s*-\s*(\d)/, "$1–$2") }),
      school: keep(stage.school),
      period: stage.period.trim(),
      program: keep(stage.program) || undefined,
      current: stage.current,
      website,
      logo: stage.logo,
      mottos: stage.mottos.map((motto) => ({ label: keep(motto.label) || undefined, text: keep(motto.text) })).filter((motto) => motto.text),
      schoolColors: stage.schoolColors,
    };
  });
  const problem = stagesProblem(stages);
  if (problem) throw new Error(problem);
  return { intro, about, contacts: channels, education: stages, en };
}
