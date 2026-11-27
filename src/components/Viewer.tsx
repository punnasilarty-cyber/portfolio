import { useState } from "react";

export type Shown = { src: string; title: string; image?: boolean; /** where the file itself lives */ href: string };

/** a full-screen window over the page for one picture or file */
export function Viewer({ shown, onClose }: { shown: Shown; onClose: () => void }) {
  // a picture fits the window until pressed, then shows at its own size and scrolls
  const [full, setFull] = useState(false);
  return (
    <dialog
      // a native modal: traps focus and closes on Escape
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-label={shown.title}
      className="viewer"
    >
      <header>
        <p>{shown.title}</p>
        <a href={shown.href} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-3 py-1.5 text-xs">
          เปิดแท็บใหม่
        </a>
        <button autoFocus onClick={(event) => event.currentTarget.closest("dialog")!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          ปิด
        </button>
      </header>
      {shown.image ? (
        <div className="viewer-body">
          <button type="button" aria-pressed={full} onClick={() => setFull(!full)} className={full ? "viewer-picture is-full" : "viewer-picture"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
            <img src={shown.src} alt={shown.title} />
            <span className="sr-only">{full ? "ย่อให้พอดีจอ" : "ขยายเท่าขนาดจริง"}</span>
          </button>
        </div>
      ) : (
        <iframe src={shown.src} title={shown.title} className="viewer-body" />
      )}
    </dialog>
  );
}
