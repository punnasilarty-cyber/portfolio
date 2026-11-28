// ไฟล์สำรองคือ ZIP ที่มี works.json, site.json (ถ้าเคยบันทึก) และไฟล์ทั้งหมดที่การ์ดใช้ ไม่มีรหัสหรือ token
import type { Work } from "./content.ts";
import { filesOf } from "./items.ts";
import { readSite, type Site } from "./site.ts";
import { crc32 } from "./zip.ts";

export type Entry = { name: string; data: Uint8Array<ArrayBuffer> };

/** reads the archives this site makes: entries stored without compression */
export function unzip(bytes: Uint8Array): Entry[] {
  const damaged = () => new Error("ไฟล์สำรองเสียหายหรือไม่ใช่ไฟล์สำรองของเว็บนี้");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // the closing record is 22 bytes, followed at most by a short comment
  let end = bytes.length - 22;
  while (end >= 0 && end > bytes.length - 22 - 65536 && view.getUint32(end, true) !== 0x06054b50) end--;
  if (end < 0 || view.getUint32(end, true) !== 0x06054b50) throw damaged();
  const entries: Entry[] = [];
  try {
    let at = view.getUint32(end + 16, true);
    for (let i = view.getUint16(end + 10, true); i > 0; i--) {
      if (view.getUint32(at, true) !== 0x02014b50) throw damaged();
      // an archive packed again by another program is compressed, which this does not undo
      if (view.getUint16(at + 10, true) !== 0) throw new Error("ใช้ไฟล์ ZIP ที่ดาวน์โหลดจากเว็บโดยตรง ไม่ใช่ไฟล์ที่แตกแล้วบีบใหม่");
      const size = view.getUint32(at + 20, true);
      const nameLength = view.getUint16(at + 28, true);
      const local = view.getUint32(at + 42, true);
      const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      const data = new Uint8Array(bytes.subarray(start, start + size));
      if (data.length !== size || crc32(data) !== view.getUint32(at + 16, true)) throw damaged();
      entries.push({ name, data });
      at += 46 + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    }
  } catch (error) {
    // reading past the end of a cut-off file throws a RangeError
    throw error instanceof RangeError ? damaged() : error;
  }
  return entries;
}

// a restore writes into the public site, so only the kinds of file the editor itself puts there, inside works/
const STORED = /^works\/(?:[^/\\]+\/)?[^/\\]+\.(jpe?g|png|webp|pdf|docx?|pptx?|xlsx?)$/i;
const isWeb = (link: unknown) => link === undefined || (typeof link === "string" && /^https?:\/\//i.test(link));

function readWorks(data: unknown): Work[] {
  const fine = (item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const work = item as Work;
    const strings = [work.image, ...(Array.isArray(work.more) ? work.more : [])];
    return (
      typeof work.title === "string" &&
      isWeb(work.link) &&
      (work.more === undefined || Array.isArray(work.more)) &&
      strings.every((path) => path === undefined || typeof path === "string") &&
      (work.files === undefined || (Array.isArray(work.files) && work.files.every((file) => typeof file?.name === "string" && typeof file.link === "string" && isWeb(file.link))))
    );
  };
  if (!Array.isArray(data) || !data.every(fine)) throw new Error("รายการผลงานในไฟล์สำรองไม่ถูกต้อง");
  return data;
}

/** what a backup would put back; throws before anything is written when it is not sound */
export function readBackup(entries: Entry[]): { works: Work[]; site: Site | null; files: Entry[]; missing: string[] } {
  const json = (entry: Entry) => {
    try {
      return JSON.parse(new TextDecoder().decode(entry.data)) as unknown;
    } catch {
      throw new Error(`อ่าน ${entry.name} ในไฟล์สำรองไม่ได้`);
    }
  };
  const find = (name: string) => entries.find((entry) => entry.name === name);
  const list = find("works.json");
  if (!list) throw new Error("ไม่พบรายการผลงานในไฟล์สำรอง");
  const works = readWorks(json(list));
  const words = find("site.json");
  const others = entries.filter((entry) => entry !== list && entry !== words);
  const odd = others.find((entry) => !STORED.test(entry.name) || entry.name.split("/").some((part) => part === ".." || part === "."));
  if (odd) throw new Error(`ไฟล์สำรองมีไฟล์ที่ไม่อนุญาต: ${odd.name}`);
  const packed = new Set(others.map((entry) => entry.name));
  return { works, site: words ? readSite(json(words)) : null, files: others, missing: [...new Set(works.flatMap(filesOf))].filter((path) => !packed.has(path)) };
}
