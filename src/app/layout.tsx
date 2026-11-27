import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { profile } from "@/content";

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

export const metadata: Metadata = {
  title: `${profile.name} | Portfolio`,
  description: profile.intro,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${siteFont.variable} h-full scroll-smooth antialiased`} data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  );
}
