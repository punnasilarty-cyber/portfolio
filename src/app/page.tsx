import { HeroMotion } from "@/components/HeroMotion";
import { StaggerText } from "@/components/StaggerText";
import { Works } from "@/components/Works";
import { aboutWhole, profile, sections } from "@/content";

const menu = [{ id: "top", title: "หน้าแรก" }, ...sections];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 px-2 pt-2">
        <div aria-hidden="true" className="fx-progress" />
        {/* two rows on narrow screens: the menu is too long to share one with the name */}
        <div className="mx-auto flex max-w-6xl flex-col items-center rounded-lg bg-[#171717]/90 px-3 pt-2 lg:h-14 lg:flex-row lg:justify-between lg:gap-3 lg:pt-0">
          <a href="#top" aria-label={`${profile.name} กลับขึ้นบนสุด`}>
            <span className="text-sm leading-none font-bold whitespace-nowrap sm:text-lg">{profile.name}</span>
          </a>
          <nav aria-label="เมนูหลัก" className="solx-scrollbar flex max-w-full overflow-x-auto text-sm whitespace-nowrap">
            {menu.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:text-[var(--foreground)]">
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top" className="flex-1 pb-8">
        {/* pulled up by the header height, so the code backdrop reaches the top of the page */}
        <section className="relative -mt-24 overflow-hidden pt-24 lg:-mt-16 lg:pt-16">
          <HeroMotion />
          <div className="hero-content mx-auto max-w-5xl px-5 py-32 text-center">
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
              <a href={`#${sections[0].id}`} className="solx-btn-primary px-6 py-3 text-sm sm:text-base">
                ดูประวัติ <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* part of the front page, so it has no id of its own and no menu entry */}
        <section className="about">
          <h2>เกี่ยวกับฉัน</h2>
          <div>
            {profile.about.map((paragraph) => (
              <p key={paragraph}>
                {/* split keeps the matched phrases at the odd positions */}
                {paragraph.split(aboutWhole).map((part, i) =>
                  i % 2 ? (
                    <span key={i} className="whitespace-nowrap">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            ))}
          </div>
        </section>

        {/* decoration only: the same names are in the menu */}
        <div aria-hidden="true" className="fx-band">
          <div className="fx-track">
            {[0, 1].map((half) => (
              <span key={half}>
                {sections.map((section) => (
                  <span key={section.id} className="fx-item">
                    {section.title}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <Works />
      </main>

      {/* the extra bottom room keeps the corner button off the text */}
      <footer className="bg-[#18181b] px-5 pt-6 pb-20 text-center text-xs text-[var(--muted)]">
        © 2026 {profile.name} สงวนลิขสิทธิ์
        {/* globals.css stops every animation while this is ticked */}
        <label className="mt-3 flex items-center justify-center gap-2">
          <input id="calm" type="checkbox" /> หยุดแอนิเมชัน
        </label>
      </footer>
    </>
  );
}
