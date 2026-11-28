// the boxes of the editor window
export const field = "editor-field mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-[var(--foreground)]";

type Box = React.InputHTMLAttributes<HTMLInputElement> & { label: string; rows?: number };

/** one labelled box; `rows` makes it a text area */
export function Field({ label, rows, ...rest }: Box) {
  return (
    <label className="block text-sm">
      {label}
      {rows ? <textarea rows={rows} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} className={field} /> : <input {...rest} className={field} />}
    </label>
  );
}

/** a Thai text with its English underneath, for forms read when they are sent */
export function TwoField({ name, label, value, english, rows, required }: { name: string; label: string; value?: string; english?: string; rows?: number; required?: boolean }) {
  return (
    <div className="editor-pair">
      <Field label={label} name={name} defaultValue={value} rows={rows} required={required} />
      <Field label={`${label} (อังกฤษ ไม่บังคับ)`} name={`en-${name}`} defaultValue={english} rows={rows} lang="en" />
    </div>
  );
}
