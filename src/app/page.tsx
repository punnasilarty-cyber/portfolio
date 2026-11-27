import { HeroMotion } from "@/components/HeroMotion";
import { Reveal } from "@/components/Reveal";
import { StaggerText } from "@/components/StaggerText";
import { Works } from "@/components/Works";
import { contacts, profile, skills } from "@/content";

const menu = [
  { href: "#works", label: "ผลงาน" },
  { href: "#about", label: "เกี่ยวกับ" },
  { href: "#contact", label: "ติดต่อ" },
];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 px-2 pt-2">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-lg bg-[#171717]/90 px-3">
          <a href="#top" aria-label={`${profile.name} กลับขึ้นบนสุด`}>
            <span className="text-sm leading-none font-bold whitespace-nowrap sm:text-lg">{profile.name}</span>
          </a>
          <nav aria-label="เมนูหลัก" className="flex gap-1 text-sm">
            {menu.map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-2 py-2 text-[var(--muted)] hover:text-[var(--foreground)] sm:px-4">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* pulled up by the header height, so the code backdrop reaches the top of the page */}
        <section className="relative -mt-16 overflow-hidden pt-16">
          <HeroMotion />
          <div className="mx-auto max-w-5xl px-5 py-32 text-center">
            <h1
              aria-label={`Portfolio ของ ${profile.name}`}
              lang="en"
              className="solx-title bg-[radial-gradient(closest-side,rgba(8,9,10,0.45)_40%,transparent)] py-2 font-bold tracking-tight"
            >
              <span className="block text-3xl leading-tight sm:text-5xl">
                <StaggerText text="Portfolio" />
              </span>
              <span className="solx-title-brand block text-4xl leading-[1.2] font-bold sm:text-[4.25rem]">
                <StaggerText text={profile.name} start={9} gradient />
              </span>
            </h1>
            <p className="solx-animate-in solx-after-title mx-auto mt-3 max-w-2xl py-2 text-base text-[#e4e4e7] [text-shadow:0_0_3px_#08090a,0_0_8px_#08090a,0_0_16px_#08090a] sm:text-lg">
              {profile.intro}
            </p>
            <div className="solx-animate-in solx-after-text mt-8 flex justify-center">
              <a href="#works" className="solx-btn-primary px-6 py-3 text-sm sm:text-base">
                ดูผลงาน <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <Reveal className="mx-auto max-w-6xl px-5 py-16">
          <Heading id="works" title="ผลงาน" />
          <Works />
        </Reveal>

        <Reveal className="mx-auto max-w-3xl px-5 py-16">
          <Heading id="about" title="เกี่ยวกับ" />
          <div className="solx-panel space-y-4 p-6 text-sm leading-7 text-[var(--muted)] sm:p-8 sm:text-base">
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul aria-label="ทักษะ" className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <li key={skill} className="solx-card px-3 py-1.5 text-xs text-[var(--foreground)]">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mx-auto max-w-3xl px-5 pt-16 pb-24">
          <Heading id="contact" title="ติดต่อ" />
          <ul className="grid gap-4 sm:grid-cols-2">
            {contacts.map((contact) => (
              <li key={contact.label} className="solx-card p-5 text-center">
                <p className="text-xs text-[var(--muted)]">{contact.label}</p>
                {contact.href ? (
                  <a href={contact.href} className="solx-gradient-text mt-1 block font-bold break-all">
                    {contact.value}
                  </a>
                ) : (
                  <p className="mt-1 font-bold break-all">{contact.value}</p>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </main>

      <footer className="bg-[#18181b] px-5 py-6 text-center text-xs text-[var(--muted)]">
        © 2026 {profile.name} สงวนลิขสิทธิ์
      </footer>
    </>
  );
}

function Heading({ id, title }: { id: string; title: string }) {
  return (
    // the offset keeps the heading clear of the sticky header after a menu jump
    <h2 id={id} aria-label={title} className="mb-10 scroll-mt-24 text-center text-3xl font-semibold sm:text-4xl">
      <StaggerText text={title} />
    </h2>
  );
}
