"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rescues", href: "/rescues" },
  { label: "Adopt", href: "/adopt" },
  { label: "TNR", href: "/tnr" },
  { label: "Foster", href: "/foster/manage" },
  { label: "Contact", href: "/contact" },
  { label: "Admin", href: "/admin/login" },
];

export default function PublicNav({ current }: { current?: string }) {

  return (
    <div className="max-w-6xl mx-auto px-5">
      <nav className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand-orange" fill="currentColor">
            <path d="M12 18c-2.2 0-4-1.3-4-3s1.8-3 4-3 4 1.3 4 3-1.8 3-4 3zm-5.5-5.5a2 2 0 100-4 2 2 0 000 4zm3-3.5a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zm3 3.5a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span className="font-heading font-bold text-xl text-gray-900">PawsitiveSpace</span>
        </Link>

        {/* Nav links — always visible */}
        <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-5 text-sm font-semibold">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.href === current
                ? "text-brand-orange underline underline-offset-4"
                : link.label === "Admin"
                  ? "text-gray-400 hover:text-gray-600"
                  : "text-brand-orange hover:underline"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
