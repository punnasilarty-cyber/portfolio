// วาด public/qr.svg ที่พาไปหน้าเว็บ รันใหม่เมื่อที่อยู่เว็บเปลี่ยน: node scripts/qr.mjs
import { writeFileSync } from "node:fs";
import qrcode from "qrcode-generator";
import { siteUrl } from "../src/content.ts";

const code = qrcode(0, "M"); // 0: the smallest size that fits
code.addData(siteUrl);
code.make();

const modules = code.getModuleCount();
const margin = 4; // the quiet border scanners need
const size = modules + margin * 2;
let path = "";
for (let row = 0; row < modules; row++) {
  for (let column = 0; column < modules; column++) if (code.isDark(row, column)) path += `M${column + margin} ${row + margin}h1v1h-1z`;
}
writeFileSync(
  new URL("../public/qr.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 24}" height="${size * 24}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="#fff"/>
  <path d="${path}" fill="#000"/>
</svg>
`,
);
console.log(`public/qr.svg: ${modules}x${modules} for ${siteUrl}`);
