// token ถูกเข้ารหัสด้วยรหัสผ่านของเจ้าของ แล้ววางเป็นไฟล์สาธารณะ เพื่อให้เข้าแก้ได้จากทุกเครื่อง
// anyone can download it and guess offline, so the password has to be long to be safe
// shortcut: any length is accepted by the owner's choice; a short one can be cracked, giving write access to the site
import { fromBase64, toBase64 } from "./github.ts";

async function key(password: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 600_000 },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function seal(token: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(password, salt), new TextEncoder().encode(token));
  return [salt, iv, new Uint8Array(data)].map(toBase64).join(".");
}

export async function unseal(sealed: string, password: string) {
  try {
    const [salt, iv, data] = sealed.split(".").map(fromBase64);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await key(password, salt), data);
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error("รหัสไม่ถูกต้อง");
  }
}
