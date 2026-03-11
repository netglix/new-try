"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Top navigation bar */
export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/analyze", label: "Analyze" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
          EScope
        </Link>
        <div className="flex gap-4 text-sm font-medium">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href
                  ? "text-zinc-900 underline underline-offset-4"
                  : "text-zinc-500 hover:text-zinc-900"
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
