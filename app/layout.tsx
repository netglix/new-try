import type { Metadata } from "next";
import { Toaster } from "sonner";
import Navbar from "@/app/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EScope – AI Entry Sheet Reviewer",
  description:
    "EScope helps consulting job applicants improve their entry sheets with AI-powered scoring and feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 font-sans antialiased">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
        {/* Global toast notification provider */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
