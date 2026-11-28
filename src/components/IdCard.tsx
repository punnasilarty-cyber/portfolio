"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { profile, siteUrl } from "@/content";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { useSite } from "@/site-store";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MAX_TILT = 16;

const picture = (src: string) =>
  new Promise<HTMLImageElement | null>((done) => {
    const image = new Image();
    image.onload = () => done(image);
    image.onerror = () => done(null);
    image.src = src;
  });

// hidden at the owner's request: nothing mounts or opens it
/** a student card that tilts under the pointer like a collector's card, and can be saved as a picture */
export function IdCard() {
  const { english, t } = useLang();
  const { education, contacts } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [problem, setProblem] = useState("");
  const now = education.find((stage) => stage.current) ?? education[education.length - 1];
  const mail = contacts.find((contact) => contact.href?.startsWith("mailto:"))?.value;
  const facts = [t(now.level), now.program ? t(now.program) : "", t(now.school)].filter(Boolean);
  const heading = english ? "Digital ID card" : "บัตรประจำตัวดิจิทัล";

  useEffect(() => onFeature("card", () => !dialog.current!.open && dialog.current!.showModal()), []);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (document.querySelector("#calm:checked")) return;
    const box = event.currentTarget.getBoundingClientRect();
    const [x, y] = [(event.clientX - box.x) / box.width, (event.clientY - box.y) / box.height];
    const style = card.current!.style;
    style.setProperty("--tilt-x", `${((0.5 - y) * MAX_TILT).toFixed(1)}deg`);
    style.setProperty("--tilt-y", `${((x - 0.5) * MAX_TILT).toFixed(1)}deg`);
    style.setProperty("--shine", `${Math.round(x * 100)}%`);
  }

  function rest() {
    card.current!.removeAttribute("style");
  }

  /** draws the card again on a canvas, at a size good for printing, and hands it over */
  async function save() {
    setProblem("");
    try {
      const [W, H] = [1012, 638];
      const sheet = document.createElement("canvas");
      sheet.width = W;
      sheet.height = H;
      const pen = sheet.getContext("2d")!;
      const theme = getComputedStyle(document.documentElement);
      const [a1, a2] = [theme.getPropertyValue("--a1").trim(), theme.getPropertyValue("--a2").trim()];
      const family = getComputedStyle(document.body).fontFamily;
      await document.fonts.ready;
      const [crest, code] = await Promise.all([now.logo ? picture(base + now.logo) : null, picture(`${base}/qr.svg`)]);
      pen.beginPath();
      pen.roundRect(0, 0, W, H, 44);
      pen.clip();
      pen.fillStyle = "#0d0e12";
      pen.fillRect(0, 0, W, H);
      const wash = pen.createLinearGradient(0, 0, W, H);
      wash.addColorStop(0, `${a1}88`);
      wash.addColorStop(0.55, `${a1}00`);
      wash.addColorStop(1, `${a2}55`);
      pen.fillStyle = wash;
      pen.fillRect(0, 0, W, H);
      pen.fillStyle = a2;
      pen.font = `700 30px ${family}`;
      pen.fillText("PORTFOLIO  ·  STUDENT", 56, 82);
      pen.fillStyle = "#ffffff";
      pen.font = `800 70px ${family}`;
      pen.fillText(profile.name, 56, 215, 640);
      pen.fillStyle = "#d4d4d8";
      pen.font = `400 32px ${family}`;
      facts.forEach((fact, i) => pen.fillText(fact, 56, 296 + i * 52, 640));
      if (mail) {
        pen.fillStyle = a2;
        pen.fillText(mail, 56, H - 56, 640);
      }
      if (crest) {
        pen.fillStyle = "#ffffff";
        pen.beginPath();
        pen.arc(W - 150, 150, 96, 0, Math.PI * 2);
        pen.fill();
        // a crest on a white square must not show its corners outside the circle
        pen.save();
        pen.clip();
        const k = 160 / Math.max(crest.width, crest.height);
        pen.drawImage(crest, W - 150 - (crest.width * k) / 2, 150 - (crest.height * k) / 2, crest.width * k, crest.height * k);
        pen.restore();
      }
      if (code) {
        pen.fillStyle = "#ffffff";
        pen.beginPath();
        pen.roundRect(W - 268, H - 268, 212, 212, 18);
        pen.fill();
        pen.drawImage(code, W - 256, H - 256, 188, 188);
      }
      const blob = await new Promise<Blob | null>((done) => sheet.toBlob(done, "image/png"));
      if (!blob) throw new Error("no picture");
      const address = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = address;
      link.download = "Punnasin-card.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(address), 60000);
    } catch {
      setProblem(english ? "Could not save the picture. Please try again" : "บันทึกรูปไม่ได้ ลองใหม่อีกครั้ง");
    }
  }

  return (
    <dialog ref={dialog} aria-label={heading} className="sheet sheet--card" onClose={rest}>
      <header>
        <h3>{heading}</h3>
        <button type="button" onClick={() => dialog.current!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          {english ? "Close" : "ปิด"}
        </button>
      </header>
      <div className="idcard-stage" onPointerMove={tilt} onPointerLeave={rest}>
        <div ref={card} className="idcard">
          <p className="idcard-top">PORTFOLIO · STUDENT</p>
          {now.logo && (
            // eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are
            <img src={base + now.logo} alt="" className="idcard-crest" />
          )}
          <p className="idcard-name">{profile.name}</p>
          <ul>
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          {mail && <p className="idcard-mail">{mail}</p>}
          {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
          <img src={`${base}/qr.svg`} alt={`QR Code ${siteUrl}`} className="idcard-code" />
        </div>
      </div>
      <p className="idcard-note">{english ? "Move the pointer over the card" : "เลื่อนเมาส์หรือนิ้วบนบัตรเพื่อเอียงดู"}</p>
      <button type="button" onClick={save} className="solx-btn-ghost px-5 py-2 text-sm">
        {english ? "Save as a picture" : "บันทึกเป็นรูป"}
      </button>
      {problem && <p role="alert">{problem}</p>}
    </dialog>
  );
}
