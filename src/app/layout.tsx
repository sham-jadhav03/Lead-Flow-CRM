import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/figtree";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadFlow",
  description: "Track leads, log discussions, never miss a follow-up.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
