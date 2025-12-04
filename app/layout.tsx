import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizCapsule",
  description: "Platform for managing and serving HTML experiments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
