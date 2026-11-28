// line icons drawn for the contact cards; the name beside each one says which it is
const ICONS: Record<string, React.ReactNode> = {
  อีเมล: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6.5L20.5 7" />
    </>
  ),
  Facebook: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12.5 21.4V11q0-3 3.3-3M9.5 13.5h5.5" />
    </>
  ),
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M17.3 6.7h.01" strokeWidth="2.6" />
    </>
  ),
  Discord: (
    <>
      <path d="M8.5 5.5 9.4 7.2q2.6-.5 5.2 0l.9-1.7q2 .3 3.6 1.4 2.6 4.6 2.2 9.6-2 1.6-4.5 2.200l-1.1-1.900q-3.7 1.1-7.4 0l-1.1 1.900q-2.5-.6-4.5-2.2-.4-5 2.2-9.6 1.6-1.1 3.6-1.400Z" />
      <path d="M9 12.600v.01M15 12.600v.01" strokeWidth="3.2" />
    </>
  ),
};

export function ContactIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="contact-icon">
      {/* a channel added in the editor gets a link sign */}
      {ICONS[name] ?? <path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />}
    </svg>
  );
}
