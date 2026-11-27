"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { SpotlightCard } from "@/components/SpotlightCard";
import { works as defaults, type Work } from "@/content";
import { checkToken, deleteFile, fromBase64, readFile, writeFile } from "@/github";
import { seal, unseal } from "@/vault";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const field = "mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-[var(--foreground)]";
const DATA = "works.json";
const VAULT = "vault.txt"; // the encrypted token, public on the site

/** shrinks to 1600px JPEG, which also drops the photo's location data */
async function toJpeg(file: File) {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("เปิดรูปนี้ไม่ได้ ใช้ไฟล์ JPG, PNG หรือ WebP");
  });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#08090a"; // JPEG has no transparency
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}

/** the works grid; the owner unlocks editing in place with a password */
export function Works() {
  const [works, setWorks] = useState<Work[] | null>(null);
  // the plain token stays in memory only
  const [token, setToken] = useState("");
  // null: the panel is closed; saved is empty when a new password is being set up
  const [panel, setPanel] = useState<{ saved: string } | null>(null);
  const [sha, setSha] = useState<string>();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  // fresh uploads are not on the host for a minute or two
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  // the floating editor window; closed shows the page exactly as visitors see it
  const [open, setOpen] = useState(true);
  const [opacity, setOpacity] = useState(90);

  useEffect(() => {
    // the query string skips the host's cache, so a fresh save shows up
    fetch(`${base}/works.json?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : defaults))
      .then((data) => setWorks(Array.isArray(data) ? data : defaults))
      .catch(() => setWorks(defaults));
  }, []);

  // the whole page changes look while editing; see html[data-ghost] in globals.css
  useEffect(() => {
    if (!token || !open) return;
    document.documentElement.dataset.ghost = "on";
    return () => {
      delete document.documentElement.dataset.ghost;
    };
  }, [token, open]);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await task();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const saved = panel!.saved;
    run(async () => {
      if (!saved && password !== data.get("confirm")) throw new Error("รหัสสองช่องไม่ตรงกัน");
      const value = saved ? await unseal(saved, password) : String(data.get("token")).trim();
      await checkToken(value);
      const file = await readFile(value, DATA);
      setWorks(file ? JSON.parse(new TextDecoder().decode(fromBase64(file.content))) : defaults);
      setSha(file?.sha);
      if (!saved) {
        const bytes = new TextEncoder().encode(await seal(value, password));
        await writeFile(value, VAULT, bytes, (await readFile(value, VAULT))?.sha);
      }
      setToken(value);
      setOpen(true);
      setPanel(null);
      if (!saved) setMessage("ตั้งรหัสแล้ว เครื่องอื่นจะใช้ได้ในราว 1–2 นาที");
    });
  }

  function openPanel() {
    run(async () => {
      const response = await fetch(`${base}/${VAULT}?t=${Date.now()}`);
      // only a missing file means "not set up"; other failures must not offer to replace the password
      if (!response.ok && response.status !== 404) throw new Error("โหลดข้อมูลรหัสไม่ได้ ลองใหม่อีกครั้ง");
      setPanel({ saved: response.ok ? (await response.text()).trim() : "" });
    });
  }

  function logout() {
    setToken("");
    setEditing(null);
    setMessage("");
  }

  async function publish(next: Work[]) {
    const bytes = new TextEncoder().encode(JSON.stringify(next, null, 2));
    setSha(await writeFile(token, DATA, bytes, sha));
    setWorks(next);
  }

  // an image goes away only once no work points at it
  async function dropImage(image: string | undefined, next: Work[]) {
    if (image?.startsWith("/works/") && !next.some((work) => work.image === image)) await deleteFile(token, image.slice(1));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    run(async () => {
      const old = typeof editing === "number" ? works![editing] : undefined;
      const link = text("link");
      if (!text("title")) throw new Error("ใส่ชื่อผลงาน");
      if (link && !/^https?:\/\//i.test(link)) throw new Error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");
      let image = data.get("removeImage") ? undefined : old?.image;
      const file = data.get("image") as File;
      if (file.size) {
        const name = `works/${Date.now()}.jpg`;
        const jpeg = await toJpeg(file);
        await writeFile(token, name, new Uint8Array(await jpeg.arrayBuffer()));
        image = `/${name}`;
        setPreviews((map) => ({ ...map, [`/${name}`]: URL.createObjectURL(jpeg) }));
      }
      const work: Work = { title: text("title"), kind: text("kind"), summary: text("summary"), image, link: link || undefined };
      const next = old ? works!.map((item, i) => (i === editing ? work : item)) : [work, ...works!];
      await publish(next);
      setEditing(null);
      await dropImage(old?.image, next);
      setMessage("บันทึกแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  function remove(index: number) {
    if (!window.confirm(`ลบ "${works![index].title}" ออกจากเว็บ?`)) return;
    run(async () => {
      const next = works!.filter((_, i) => i !== index);
      await publish(next);
      setEditing(null);
      await dropImage(works![index].image, next);
      setMessage("ลบแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  const current = typeof editing === "number" ? works?.[editing] : undefined;
  const status = (
    <p role="status" className="min-h-5 text-center text-sm text-[var(--accent-soft)]">
      {busy ? "กำลังทำงาน…" : message}
    </p>
  );

  return (
    <div className="space-y-5">
      <ul className="grid min-h-64 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={!works}>
        {works?.map((work, index) => (
          <li key={`${index}-${work.title}`}>
            <WorkCard work={work} preview={work.image ? previews[work.image] : undefined} />
          </li>
        ))}
      </ul>

      {/* on document.body: an animated ancestor would otherwise pin "fixed" to this section */}
      {token &&
        createPortal(
          <>
          {!open && (
            <button onClick={() => setOpen(true)} className="ghost-btn fixed right-4 bottom-4 z-40">
              <Ghost />
              เปิดหน้าต่างแก้ไข
            </button>
          )}

          {/* kept mounted while hidden, so a half-filled form survives */}
          <section aria-label="หน้าต่างแก้ไขผลงาน" hidden={!open} className="ghost-window" style={{ opacity: opacity / 100 }}>
            <header className="flex items-center gap-2 border-b px-4 py-3">
              <Ghost />
              <h3 className="ghost-title text-sm font-bold">โหมดผี</h3>
              <button onClick={() => setOpen(false)} className="solx-btn-ghost ml-auto px-3 py-1.5 text-xs">
                ซ่อน ดูผลลัพธ์
              </button>
              <button disabled={busy} onClick={logout} className="solx-btn-ghost px-3 py-1.5 text-xs">
                ออก
              </button>
            </header>
            <label className="flex items-center gap-3 border-b px-4 py-2 text-xs text-[var(--muted)]">
              ความทึบ
              <input type="range" min={30} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="flex-1 accent-teal-300" />
              {opacity}%
            </label>
            <div className="space-y-3 overflow-y-auto p-4">
              {status}
              {editing !== null ? (
                <form
                  key={editing}
                  onSubmit={save}
                  className="space-y-3"
                >
                  <h3 className="font-bold">{current ? `แก้ไข: ${current.title}` : "เพิ่มผลงาน"}</h3>
                  <label className="block text-sm">
                    ชื่อผลงาน
                    <input name="title" required autoFocus defaultValue={current?.title} className={field} />
                  </label>
                  <label className="block text-sm">
                    ประเภท
                    <input name="kind" placeholder="เช่น ตัดต่อวิดีโอ" defaultValue={current?.kind} className={field} />
                  </label>
                  <label className="block text-sm">
                    คำอธิบาย
                    <textarea name="summary" rows={3} defaultValue={current?.summary} className={field} />
                  </label>
                  <label className="block text-sm">
                    ลิงก์ผลงาน (ไม่บังคับ)
                    <input name="link" type="url" placeholder="https://" defaultValue={current?.link} className={field} />
                  </label>
                  <label className="block text-sm">
                    รูป (ไม่บังคับ)
                    <input name="image" type="file" accept="image/*" className={field} />
                  </label>
                  {current?.image && (
                    <label className="flex items-center gap-2 text-sm">
                      <input name="removeImage" type="checkbox" /> เอารูปเดิมออก
                    </label>
                  )}
                  <div className="flex gap-3">
                    <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
                      บันทึก
                    </button>
                    <button type="button" disabled={busy} onClick={() => setEditing(null)} className="solx-btn-ghost px-5 py-2 text-sm">
                      ยกเลิก
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button disabled={busy} onClick={() => setEditing("new")} className="solx-btn-primary w-full px-5 py-2 text-sm">
                    + เพิ่มผลงาน
                  </button>
                  <ul aria-label="ผลงานทั้งหมด" className="space-y-2">
                    {works?.map((work, index) => (
                      <li key={`${index}-${work.title}`} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm">{work.title}</span>
                        <button disabled={busy} onClick={() => setEditing(index)} className="solx-btn-ghost px-3 py-1 text-xs">
                          แก้ไข
                        </button>
                        <button disabled={busy} onClick={() => remove(index)} className="solx-btn-ghost px-3 py-1 text-xs">
                          ลบ
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
          </>,
          document.body,
        )}

      {!token &&
        (panel ? (
          <form key={panel.saved} onSubmit={login} className="solx-panel mx-auto max-w-md space-y-4 p-6">
            {/* lets the browser's password manager save the password */}
            <input name="username" autoComplete="username" defaultValue="portfolio-admin" hidden readOnly />
            {!panel.saved && (
              <>
                <p className="text-xs text-[var(--muted)]">ตั้งรหัสสำหรับใช้ทุกเครื่อง ทำครั้งเดียว</p>
                <label className="block text-sm">
                  GitHub token
                  <input name="token" type="password" autoComplete="off" required autoFocus className={field} />
                </label>
              </>
            )}
            <label className="block text-sm">
              {panel.saved ? "รหัส" : "ตั้งรหัส"}
              <input
                name="password"
                type="password"
                autoComplete={panel.saved ? "current-password" : "new-password"}
                required
                autoFocus={!!panel.saved}
                className={field}
              />
            </label>
            {!panel.saved && (
              <label className="block text-sm">
                พิมพ์รหัสอีกครั้ง
                <input name="confirm" type="password" autoComplete="new-password" required className={field} />
              </label>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
                เข้าแก้ไข
              </button>
              <button type="button" disabled={busy} onClick={() => {
                  setPanel(null);
                  setMessage("");
                }} className="solx-btn-ghost px-5 py-2 text-sm">
                ยกเลิก
              </button>
              {panel.saved && (
                <button type="button" disabled={busy} onClick={() => setPanel({ saved: "" })} className="ml-auto text-xs text-[var(--muted)] underline">
                  ตั้งรหัสใหม่
                </button>
              )}
            </div>
            {status}
          </form>
        ) : (
          <p className="text-center">
            <button disabled={!works || busy} onClick={openPanel} className="ghost-btn">
              <Ghost />
              โหมดผี · แก้ไขผลงาน
            </button>
            <span role="alert" className="mt-2 block text-sm text-[var(--accent-soft)]">
              {message}
            </span>
          </p>
        ))}
    </div>
  );
}

function Ghost({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M12 2a8 8 0 0 0-8 8v12l2.7-2 2.6 2 2.7-2 2.7 2 2.6-2 2.7 2V10a8 8 0 0 0-8-8ZM9 8.5a1.5 2 0 1 0 0 4 1.5 2 0 0 0 0-4Zm6 0a1.5 2 0 1 0 0 4 1.5 2 0 0 0 0-4Z"
      />
    </svg>
  );
}

function WorkCard({ work, preview }: { work: Work; preview?: string }) {
  return (
    <SpotlightCard className="flex h-full flex-col">
      <div className="work-media flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#7f1d1d,#3b1113)]">
        {work.image && (
          // eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are
          <img src={preview ?? `${base}${work.image}`} alt={work.title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs text-[var(--accent-soft)]">{work.kind}</p>
        <h3 className="font-bold">{work.title}</h3>
        <p className="text-sm text-[var(--muted)]">{work.summary}</p>
        {work.link && (
          <a href={work.link} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost mt-auto self-start px-4 py-2 text-sm">
            ดูผลงาน
          </a>
        )}
      </div>
    </SpotlightCard>
  );
}
