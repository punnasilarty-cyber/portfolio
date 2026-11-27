// กติกาของรายการที่แก้จากหน้าเว็บ: ชื่อไฟล์ที่อัปโหลด ไฟล์ที่ไม่มีใครใช้แล้ว และการเลื่อนลำดับ
import { sectionOf, siteUrl, type Work } from "./content.ts";

export const MAX_PICTURES = 20;
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const DOCUMENT_TYPES = /\.(pdf|docx?|pptx?|xlsx?)$/i;

/** a name that is safe in a path and in an address, keeping Thai text and the extension */
export function safeName(name: string): string {
  const clean = name
    .normalize("NFC")
    .replace(/[\u0000-\u001f\\/:*?"<>|#%]+/g, "-")
    .trim()
    .replace(/^\.+/, "");
  const dot = clean.lastIndexOf(".");
  const extension = dot > 0 ? clean.slice(dot) : "";
  const letters = Array.from(dot > 0 ? clean.slice(0, dot) : clean);
  // file names are limited in bytes, and a Thai letter takes three
  const size = new TextEncoder();
  while (letters.length && size.encode(letters.join("") + extension).length > 200) letters.pop();
  return (letters.join("").trim() || "file") + extension;
}

/** the address visitors use for a stored file such as "works/123/report.pdf" */
export const addressOf = (path: string) => siteUrl + path.split("/").map(encodeURIComponent).join("/");

/** the pictures of an item, cover first */
export const picturesOf = (work: Work): string[] => (work.image ? [work.image, ...(work.more ?? [])] : (work.more ?? []));

/** the files an item keeps in the works/ folder of the site */
export function filesOf(work: Work): string[] {
  const files = picturesOf(work)
    .filter((picture) => picture.startsWith("/works/"))
    .map((picture) => picture.slice(1));
  const link = work.link?.split(/[?#]/)[0];
  if (link?.startsWith(`${siteUrl}works/`)) files.push(decodeURIComponent(link.slice(siteUrl.length)));
  return files;
}

/** files of a replaced or removed item that nothing in the new list points at */
export function unusedFiles(old: Work, next: Work[]): string[] {
  const used = new Set(next.flatMap(filesOf));
  return [...new Set(filesOf(old))].filter((file) => !used.has(file));
}

/** the list with one item swapped past its neighbour under the same heading, or null at the edge */
export function moved(works: Work[], index: number, step: 1 | -1): Work[] | null {
  const place = (work: Work) => `${sectionOf(work)}\n${work.group ?? ""}`;
  for (let other = index + step; other >= 0 && other < works.length; other += step) {
    if (place(works[other]) !== place(works[index])) continue;
    const next = [...works];
    [next[index], next[other]] = [next[other], next[index]];
    return next;
  }
  return null;
}
