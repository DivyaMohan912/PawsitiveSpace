"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rescues", href: "/rescues" },
  { label: "Adopt", href: "/adopt" },
  { label: "TNR", href: "/tnr" },
  { label: "Foster", href: "/foster/manage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admin", href: "/admin/login" },
];

function linkClass(link: { label: string; href: string }, current?: string) {
  return link.href === current
    ? "text-brand-orange underline underline-offset-4"
    : link.label === "Admin"
      ? "text-gray-400 hover:text-gray-600"
      : "text-brand-orange hover:underline";
}

export default function PublicNav({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-5">
      <nav className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand-orange" fill="currentColor">
            <path d="M12 18c-2.2 0-4-1.3-4-3s1.8-3 4-3 4 1.3 4 3-1.8 3-4 3zm-5.5-5.5a2 2 0 100-4 2 2 0 000 4zm3-3.5a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zm3 3.5a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span className="font-heading font-bold text-xl text-gray-900">PawsitiveSpace</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex flex-wrap gap-2 sm:gap-3 lg:gap-5 text-sm font-semibold">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link, current)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile burger button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex items-center justify-center p-2 -mr-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {open ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile stacked menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-1 pb-4 text-sm font-semibold">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`${linkClass(link, current)} py-2 px-3 rounded-lg hover:bg-gray-50`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
