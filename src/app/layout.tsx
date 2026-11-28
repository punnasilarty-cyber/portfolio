import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { profile, siteUrl } from "@/content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// LINE Seed Sans TH for the whole site; see fonts/OFL-NOTICE.txt
const siteFont = localFont({
  variable: "--font-seed",
  src: [
    { path: "./fonts/LINESeedSansTH_W_Rg.woff2", weight: "400" },
    { path: "./fonts/LINESeedSansTH_W_Bd.woff2", weight: "700" },
    { path: "./fonts/LINESeedSansTH_W_XBd.woff2", weight: "800" },
    { path: "./fonts/LINESeedSansTH_W_He.woff2", weight: "900" },
  ],
});

const title = `${profile.name} | Portfolio`;
// chat apps fetch this from outside, so it needs the full address
const card = { url: `${siteUrl}og.png`, width: 1200, height: 630, alt: title };

export const metadata: Metadata = {
  title,
  description: profile.intro,
  icons: { icon: `${base}/icon.svg`, apple: `${base}/apple-icon.png` },
  // lets phones and computers install the site like an app
  manifest: `${base}/manifest.webmanifest`,
  openGraph: { type: "website", locale: "th_TH", url: siteUrl, siteName: title, title, description: profile.intro, images: [card] },
  twitter: { card: "summary_large_image", title, description: profile.intro, images: [card] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${siteFont.variable} h-full scroll-smooth antialiased`} data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  );
}
