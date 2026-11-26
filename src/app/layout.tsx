import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "UniManage — University Management System",
    template: "%s | UniManage",
  },
  description:
    "Modern University Management System for course registration, faculty grading, attendance, transcripts, and tuition payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} ${plusJakarta.variable} min-h-screen bg-white font-sans text-slate-900 antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
