import type { Metadata } from "next";
import { Admin } from "./Admin";

export const metadata: Metadata = { title: "แก้ไขผลงาน", robots: { index: false } };

export default function AdminPage() {
  return <Admin />;
}
