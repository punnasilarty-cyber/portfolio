"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { works as defaults, type Work } from "@/content";
import { checkToken, deleteFile, fromBase64, readFile, writeFile } from "@/github";

const field = "mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-[var(--foreground)]";
const DATA = "works.json";

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
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
  return new Uint8Array(await blob.arrayBuffer());
}

export function Admin() {
  // the token stays in memory only: other sites on github.io share this origin's storage
  const [token, setToken] = useState("");
  const [works, setWorks] = useState<Work[] | null>(null);
  const [sha, setSha] = useState<string>();
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
    const value = String(new FormData(event.currentTarget).get("password")).trim();
    run(async () => {
      await checkToken(value);
      const file = await readFile(value, DATA);
      setWorks(file ? JSON.parse(new TextDecoder().decode(fromBase64(file.content))) : defaults);
      setSha(file?.sha);
      setToken(value);
    });
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
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    run(async () => {
      const old = editing === null ? undefined : works![editing];
      const link = text("link");
      if (!text("title")) throw new Error("ใส่ชื่อผลงาน");
      if (link && !/^https?:\/\//i.test(link)) throw new Error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");
      let image = data.get("removeImage") ? undefined : old?.image;
      const file = data.get("image") as File;
      if (file.size) {
        const name = `works/${Date.now()}.jpg`;
        await writeFile(token, name, await toJpeg(file));
        image = `/${name}`;
      }
      const work: Work = { title: text("title"), kind: text("kind"), summary: text("summary"), image, link: link || undefined };
      const next = editing === null ? [work, ...works!] : works!.map((item, i) => (i === editing ? work : item));
      await publish(next);
      form.reset();
      setEditing(null);
      await dropImage(old?.image, next);
      setMessage("บันทึกแล้ว หน้าเว็บจะอัปเดตในราว 1–2 นาที");
    });
  }

  function remove(index: number) {
    if (!window.confirm(`ลบ "${works![index].title}" ออกจากเว็บ?`)) return;
    run(async () => {
      const next = works!.filter((_, i) => i !== index);
      await publish(next);
      setEditing(null);
      await dropImage(works![index].image, next);
      setMessage("ลบแล้ว หน้าเว็บจะอัปเดตในราว 1–2 นาที");
    });
  }

  const current = editing === null ? undefined : works?.[editing];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-5 py-10">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← กลับหน้าพอร์ต
      </Link>
      <h1 className="text-2xl font-bold">แก้ไขผลงาน</h1>
      <p role="status" className="text-sm text-[var(--accent-soft)]">
        {busy ? "กำลังทำงาน…" : message}
      </p>

      {!works ? (
        <form onSubmit={login} className="solx-panel space-y-4 p-6">
          {/* lets the browser's password manager save the token */}
          <input name="username" autoComplete="username" defaultValue="portfolio-admin" hidden readOnly />
          <label className="block text-sm">
            รหัส (GitHub token)
            <input name="password" type="password" autoComplete="current-password" required className={field} />
          </label>
          <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
            เข้าแก้ไข
          </button>
        </form>
      ) : (
        <>
          <form key={editing ?? "new"} onSubmit={save} className="solx-panel space-y-4 p-6">
            <h2 className="font-bold">{current ? `แก้ไข: ${current.title}` : "เพิ่มผลงาน"}</h2>
            <label className="block text-sm">
              ชื่อผลงาน
              <input name="title" required defaultValue={current?.title} className={field} />
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
              {current && (
                <button type="button" onClick={() => setEditing(null)} className="solx-btn-ghost px-5 py-2 text-sm">
                  ยกเลิก
                </button>
              )}
            </div>
          </form>

          <ul aria-label="ผลงานทั้งหมด" className="space-y-3">
            {works.map((work, index) => (
              <li key={`${index}-${work.title}`} className="solx-card flex items-center justify-between gap-3 p-4">
                <span className="min-w-0 truncate text-sm font-bold">{work.title}</span>
                <span className="flex shrink-0 gap-2">
                  <button disabled={busy} onClick={() => setEditing(index)} className="solx-btn-ghost px-3 py-1.5 text-xs">
                    แก้ไข
                  </button>
                  <button disabled={busy} onClick={() => remove(index)} className="solx-btn-ghost px-3 py-1.5 text-xs">
                    ลบ
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
