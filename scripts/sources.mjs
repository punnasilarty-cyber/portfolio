// ก่อน build: ตัดเฉพาะบรรทัดที่แว่น X-ray อธิบาย (กับบรรทัดข้างเคียง) ไว้ใน public/xray-sources.json
// ไม่ใส่ทั้งไฟล์ เพื่อไม่ให้เว็บเป็นที่ดาวน์โหลดโค้ดต้นฉบับ
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { excerpt, NOTES } from "../src/xray-code.ts";
import { PARTS } from "../src/xray.ts";

const sources = Object.fromEntries(
  [...new Set(PARTS.map((part) => part.file))].map((file) => {
    const path = existsSync(file) ? file : `src/components/${file}`;
    const source = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
    return [file, { length: source.split("\n").length, blocks: excerpt(source, NOTES[file] ?? []) }];
  }),
);
writeFileSync("public/xray-sources.json", JSON.stringify(sources));
