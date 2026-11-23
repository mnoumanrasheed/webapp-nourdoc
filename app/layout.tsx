import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NourDoc | Clinical Intelligence Workspace",
  description: "NourDoc role-based clinical operations UI concept. Demo data only; no patient records or live integrations.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
