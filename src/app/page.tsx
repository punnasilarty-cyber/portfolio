"use client";

import { ButtonLean } from "@/components/ButtonLean";
import { ContactIcon } from "@/components/ContactIcon";
import { CopyButton } from "@/components/CopyButton";
import { Deck } from "@/components/Deck";
import { Robot } from "@/components/Robot";
import { HeroMotion } from "@/components/HeroMotion";
import { LangToggle } from "@/components/LangToggle";
import { Loader } from "@/components/Loader";
import { SectionDots } from "@/components/SectionDots";
import { StaggerText } from "@/components/StaggerText";
import { Terminal } from "@/components/Terminal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ToTop } from "@/components/ToTop";
import { Works } from "@/components/Works";
import { aboutWhole, profile, sections, siteUrl } from "@/content";
import { useLang } from "@/i18n";
import { useSite } from "@/site-store";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const menu = [{ id: "top", title: "หน้าแรก" }, ...sections, { id: "contact", title: "ติดต่อ" }];

export default function HomePage() {
  const { english, t } = useLang();
  const { intro, about, contacts } = useSite();
  return (
    <>
      <Loader />
      {/* fades out downward, so what scrolls under does not show around the bar */}
      <header className="sticky top-0 z-40 bg-linear-to-b from-[#08090a] from-60% to-transparent px-2 pt-2">
        <div aria-hidden="true" className="fx-progress" />
        {/* two rows on narrow screens: the menu is too long to share one with the name */}
        <div className="relative mx-auto flex max-w-6xl flex-col items-center rounded-lg bg-[#171717] px-3 pt-2 lg:h-14 lg:flex-row lg:justify-between lg:gap-3 lg:pt-0">
          <a href="#top" aria-label={`${profile.name} ${t("กลับขึ้นบนสุด")}`}>
            <span className="text-sm leading-none font-bold whitespace-nowrap sm:text-lg">{profile.name}</span>
          </a>
          <nav aria-label={t("เมนูหลัก")} className="solx-scrollbar flex max-w-full overflow-x-auto text-sm whitespace-nowrap">
            {menu.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:text-[var(--foreground)]">
                {t(item.title)}
              </a>
            ))}
          </nav>
          {/* the two corners of the bar on narrow screens, a pair at its end on wide ones */}
          <div className="contents lg:flex lg:gap-2">
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>
      </header>

      <main id="top" className="flex-1 pb-8">
        {/* pulled up by the header height, so the code backdrop reaches the top of the page */}
        <section className="relative -mt-24 overflow-hidden pt-24 lg:-mt-16 lg:pt-16">
          <HeroMotion />
          <div className="hero-content mx-auto max-w-5xl px-5 py-32 text-center">
            <h1
              aria-label={`Portfolio ${english ? "of" : "ของ"} ${profile.name}`}
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
              {t(intro)}
            </p>
            <div className="solx-animate-in solx-after-text mt-8 flex justify-center">
              <a href={`#${sections[0].id}`} className="solx-btn-primary px-6 py-3 text-sm sm:text-base">
                {t("ดูประวัติ")} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* part of the front page, so it has no id of its own and no menu entry */}
        <section className="about">
          <h2>{t("เกี่ยวกับฉัน")}</h2>
          <div>
            {about.map((paragraph) => (
              <p key={paragraph}>
                {/* split keeps the matched phrases at the odd positions */}
                {t(paragraph)
                  .split(aboutWhole).map((part, i) =>
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
                    {t(section.title)}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <Works />

        <section id="contact" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 lg:scroll-mt-24">
          <h2 className="mb-10 text-center text-2xl font-semibold sm:text-4xl">{t("ติดต่อ")}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contacts.map((contact) => (
              <li key={`${contact.name} ${contact.value}`}>
                {contact.href ? (
                  // a mail link opens the mail app, so only web addresses get a new tab
                  <a href={contact.href} {...(contact.href.startsWith("https:") && { target: "_blank", rel: "noopener noreferrer" })} className="solx-card contact-card">
                    <ContactIcon name={contact.name} />
                    <span>{t(contact.name)}</span>
                    <b>{contact.value}</b>
                  </a>
                ) : (
                  <div className="solx-card contact-card">
                    <ContactIcon name={contact.name} />
                    <span>{t(contact.name)}</span>
                    <b className="select-all">{contact.value}</b>
                    <CopyButton value={contact.value} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <figure className="site-qr">
            {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
            <img src={`${base}/qr.svg`} alt={`QR Code ${english ? "for" : "ไปที่"} ${siteUrl}`} width="180" height="180" />
            <figcaption>{t("สแกนเพื่อเปิดเว็บนี้")}</figcaption>
            <a href={`${base}/qr.svg`} download="punnasin-portfolio-qr.svg" className="solx-btn-ghost px-4 py-1.5 text-xs">
              {t("ดาวน์โหลด QR")}
            </a>
          </figure>
        </section>
      </main>

      <SectionDots places={menu} />
      <ToTop />
      <ButtonLean />
      <Deck />
      <Robot />

      {/* the extra bottom room keeps the corner button off the text */}
      <footer className="bg-[#18181b] px-5 pt-6 pb-20 text-center text-xs text-[var(--muted)]">
        © 2026 {profile.name} {t("สงวนลิขสิทธิ์")}
        {/* globals.css stops every animation while this is ticked */}
        <label className="mt-3 flex items-center justify-center gap-2">
          <input id="calm" type="checkbox" /> {t("หยุดแอนิเมชัน")}
        </label>
        <Terminal />
      </footer>
    </>
  );
}
