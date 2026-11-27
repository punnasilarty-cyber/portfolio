import { useState } from "react";
import { PdfPages } from "@/components/PdfPages";
import type { View } from "@/viewer";

export type Shown = View & { title: string; /** where the file itself lives */ href: string; /** all the pictures to step through */ gallery?: string[] };

/** a full-screen window over the page for one picture or file */
export function Viewer({ shown, onClose }: { shown: Shown; onClose: () => void }) {
  // a picture fits the window until pressed, then shows at its own size and scrolls
  const [full, setFull] = useState(false);
  const [at, setAt] = useState(0);
  const gallery = shown.gallery && shown.gallery.length > 1 ? shown.gallery : null;
  const picture = gallery ? gallery[at] : shown.src;

  function step(by: number) {
    setAt((now) => (now + by + gallery!.length) % gallery!.length);
    setFull(false);
  }
  return (
    <dialog
      // a native modal: traps focus and closes on Escape
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      onKeyDown={(event) => {
        if (gallery && event.key === "ArrowLeft") step(-1);
        if (gallery && event.key === "ArrowRight") step(1);
      }}
      aria-label={shown.title}
      className="viewer"
    >
      <header>
        <p>{shown.title}</p>
        <a href={gallery ? picture : shown.href} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-3 py-1.5 text-xs">
          เปิดแท็บใหม่
        </a>
        <button autoFocus onClick={(event) => event.currentTarget.closest("dialog")!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          ปิด
        </button>
      </header>
      {shown.kind === "image" ? (
        <div className="viewer-body">
          <button type="button" aria-pressed={full} onClick={() => setFull(!full)} className={full ? "viewer-picture is-full" : "viewer-picture"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
            <img src={picture} alt={gallery ? `${shown.title} รูปที่ ${at + 1}` : shown.title} />
            <span className="sr-only">{full ? "ย่อให้พอดีจอ" : "ขยายเท่าขนาดจริง"}</span>
          </button>
        </div>
      ) : shown.kind === "pages" ? (
        <PdfPages src={shown.src} title={shown.title} />
      ) : (
        <iframe src={shown.src} title={shown.title} className="viewer-body" />
      )}
      {gallery && (
        <footer>
          <button type="button" onClick={() => step(-1)} className="solx-btn-ghost px-4 py-1.5 text-xs">
            ← ก่อนหน้า
          </button>
          <span aria-live="polite">
            {at + 1} / {gallery.length}
          </span>
          <button type="button" onClick={() => step(1)} className="solx-btn-ghost px-4 py-1.5 text-xs">
            ถัดไป →
          </button>
        </footer>
      )}
    </dialog>
  );
}
