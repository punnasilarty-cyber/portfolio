// build แล้วส่งขึ้นสาขา gh-pages โดยไม่ลบผลงานที่แก้ผ่านหน้าเว็บ
import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO = "https://github.com/punnasilarty-cyber/portfolio.git";
const KEEP = new Set([".git", "works.json", "works", "vault.txt"]); // written by the in-page editor
const IDENTITY = "-c user.name=punnasilarty-cyber -c user.email=356074325+punnasilarty-cyber@users.noreply.github.com";

const run = (command, options = {}) => execSync(command, { stdio: "inherit", ...options });

run("npm run build", { env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/portfolio" } });

const dir = mkdtempSync(join(tmpdir(), "portfolio-pages-"));
run(`git -c core.autocrlf=false clone -q --depth 1 --branch gh-pages ${REPO} "${dir}"`);
for (const name of readdirSync(dir)) if (!KEEP.has(name)) rmSync(join(dir, name), { recursive: true, force: true });
for (const name of readdirSync("out")) if (!KEEP.has(name)) cpSync(join("out", name), join(dir, name), { recursive: true });
writeFileSync(join(dir, ".nojekyll"), "");

run("git -c core.autocrlf=false add -A", { cwd: dir });
// a plain push: if the editor saved in the meantime it is rejected, so run the script again
run(`git ${IDENTITY} commit -q --allow-empty -m deploy`, { cwd: dir });
run("git push -q origin gh-pages", { cwd: dir });
rmSync(dir, { recursive: true, force: true });
