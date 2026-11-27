// ผลงานที่แก้ผ่านหน้าเว็บเก็บในสาขา gh-pages ของ repo นี้: works.json และโฟลเดอร์ works/
const REPO = "https://api.github.com/repos/punnasilarty-cyber/portfolio";
const BRANCH = "gh-pages";

export function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export const fromBase64 = (text: string) => Uint8Array.from(atob(text.replace(/\s/g, "")), (c) => c.charCodeAt(0));

async function call(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(REPO + path, {
    ...init,
    cache: "no-store", // a cached sha would make the next save fail
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });
  if (response.ok || response.status === 404) return response;
  if (response.status === 401) throw new Error("รหัสไม่ถูกต้องหรือหมดอายุ");
  if (response.status === 403) throw new Error("รหัสนี้ไม่มีสิทธิ์แก้ไข หรือเรียก GitHub ถี่เกินไป");
  if (response.status === 409) throw new Error("ข้อมูลถูกแก้จากที่อื่น โหลดหน้าใหม่แล้วลองอีกครั้ง");
  throw new Error(`GitHub ตอบกลับผิดพลาด (${response.status})`);
}

export async function checkToken(token: string) {
  const response = await call(token, "");
  if (!response.ok || !(await response.json()).permissions?.push) throw new Error("รหัสนี้ไม่มีสิทธิ์แก้ไข");
}

/** null when the file does not exist yet */
export async function readFile(token: string, path: string): Promise<{ sha: string; content: string } | null> {
  const response = await call(token, `/contents/${path}?ref=${BRANCH}`);
  return response.ok ? response.json() : null;
}

/** returns the new sha; pass the old one when replacing a file */
export async function writeFile(token: string, path: string, bytes: Uint8Array, sha?: string): Promise<string> {
  const response = await call(token, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message: `admin: update ${path}`, content: toBase64(bytes), branch: BRANCH, sha }),
  });
  if (!response.ok) throw new Error("บันทึกไม่ได้ รหัสนี้อาจไม่มีสิทธิ์เขียน");
  return (await response.json()).content.sha;
}

export async function deleteFile(token: string, path: string) {
  const file = await readFile(token, path);
  if (!file) return;
  await call(token, `/contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message: `admin: delete ${path}`, branch: BRANCH, sha: file.sha }),
  });
}
