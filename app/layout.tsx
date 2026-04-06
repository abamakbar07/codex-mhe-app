import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MHE Task Dashboard",
  description: "Starter dashboard with Supabase wiring"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
