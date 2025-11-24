import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VSource Education Admin",
  description: "Student registration & invoicing system for VSource Education"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
