/** download everything the editor has saved, or put a download back */
export function BackupPanel({ busy, onBackup, onRestore }: { busy: boolean; onBackup: () => void; onRestore: (file: File) => void }) {
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="font-bold">สำรองข้อมูล</h3>
        <p className="text-xs text-[var(--muted)]">ได้ไฟล์ ZIP ที่มีการ์ดผลงาน เนื้อหาที่แก้ไว้ และรูปกับเอกสารทั้งหมด ไม่มีรหัสของคุณอยู่ในไฟล์</p>
        <button type="button" disabled={busy} onClick={onBackup} className="solx-btn-primary px-5 py-2 text-sm">
          ดาวน์โหลดไฟล์สำรอง
        </button>
      </section>
      <section className="space-y-2 border-t pt-4">
        <h3 className="font-bold">กู้คืนข้อมูล</h3>
        <p className="text-xs text-[var(--muted)]">เนื้อหาบนเว็บจะกลับเป็นตามไฟล์ที่เลือก จะมีคำถามยืนยันก่อนเขียนทับ</p>
        <label className="block text-sm">
          เลือกไฟล์สำรอง (.zip)
          <input
            type="file"
            accept=".zip"
            disabled={busy}
            className="editor-field mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // cleared, so the same file can be chosen again
              event.target.value = "";
              if (file) onRestore(file);
            }}
          />
        </label>
      </section>
    </div>
  );
}
