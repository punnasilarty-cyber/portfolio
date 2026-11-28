// หลัง build: เขียนรายชื่อไฟล์ของเว็บลงใน out/sw.js เพื่อให้เก็บไว้เปิดตอนไม่มีเน็ต
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

// the worker itself, error pages, and what the editor writes (works are read from works.json instead)
const left = /^(sw\.js|404\.html|_not-found|works\/|works\.json|site\.json|vault\.txt)/;

/** the files of a built folder, as addresses from its root, and a mark that changes when any of them does */
export function filesToKeep(root) {
  const names = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)).replaceAll("\\", "/"))
    .filter((name) => !left.test(name))
    .sort();
  const mark = createHash("sha1");
  for (const name of names) mark.update(name).update(readFileSync(join(root, name)));
  // "" is the front page by its plain address
  return { build: mark.digest("hex").slice(0, 12), files: ["", ...names.map((name) => name.split("/").map(encodeURIComponent).join("/"))] };
}

export function fill(worker, { build, files }) {
  const filled = worker.replace('const BUILD = "dev";', `const BUILD = "${build}";`).replace("const FILES = [];", () => `const FILES = ${JSON.stringify(files)};`);
  if (filled === worker || filled.includes("const FILES = [];") || filled.includes('const BUILD = "dev";')) throw new Error("sw.js: the lines to fill in were not found");
  return filled;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const list = filesToKeep("out");
  writeFileSync("out/sw.js", fill(readFileSync("out/sw.js", "utf8"), list));
  console.log(`offline: ${list.files.length} files, build ${list.build}`);
}
