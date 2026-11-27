import { useEffect, useRef, useState } from "react";

/** draws a PDF sheet by sheet with pdf.js, for browsers that cannot show one in a frame */
export function PdfPages({ src, title }: { src: string; title: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("กำลังเปิดไฟล์…");

  useEffect(() => {
    const box = holder.current!;
    let closed = false;
    let stop = () => {};
    (async () => {
      // fetched only when someone opens a PDF this way; the legacy build also runs on older phones
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      if (closed) return;
      const task = pdfjs.getDocument({ url: src });
      stop = () => void task.destroy();
      const file = await task.promise;
      for (let number = 1; number <= file.numPages && !closed; number++) {
        const page = await file.getPage(number);
        // sharp when pinched in, without making huge canvases
        const scale = (box.clientWidth / page.getViewport({ scale: 1 }).width) * Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `${title} หน้า ${number} จาก ${file.numPages}`);
        await page.render({ canvas, viewport }).promise;
        if (closed) return;
        box.append(canvas);
        setStatus(number < file.numPages ? `กำลังเปิดหน้า ${number + 1} จาก ${file.numPages}…` : "");
      }
    })().catch(() => {
      if (!closed) setStatus("เปิดไฟล์ในหน้านี้ไม่ได้ ลองกด “เปิดแท็บใหม่”");
    });
    return () => {
      closed = true;
      stop();
      box.replaceChildren();
    };
  }, [src, title]);

  return (
    <div className="viewer-body viewer-pages">
      <div ref={holder} />
      <p role="status">{status}</p>
    </div>
  );
}
