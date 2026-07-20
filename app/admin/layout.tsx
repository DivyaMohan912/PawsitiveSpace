"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Volunteers", href: "/admin/volunteers", icon: "👥" },
  { label: "Cases", href: "/admin/cases", icon: "🚨" },
  { label: "Reach Out", href: "/admin/reach-out", icon: "📞" },
  { label: "Message Logs", href: "/admin/reports", icon: "💬" },
  { label: "Adoptions", href: "/admin/adoptions", icon: "🏠" },
  { label: "Wishlist", href: "/admin/wishes", icon: "🙋" },
  { label: "Animals", href: "/admin/animals", icon: "🐾" },
  { label: "TNR", href: "/admin/tnr", icon: "✂️" },
];

const MOBILE_ITEMS = NAV_ITEMS; // all items in the scrollable bottom bar

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  rescuer: "bg-red-100 text-red-700",
  foster: "bg-teal-100 text-teal-700",
  transporter: "bg-amber-100 text-amber-700",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [volunteer, setVolunteer] = useState<{ name: string; role: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const supabase = createBrowserClient();

  // Allow login page to render without auth
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: vol } = await supabase
        .from("volunteers")
        .select("name, role")
        .eq("email", session.user.email)
        .single();

      if (vol) setVolunteer(vol);
      setChecked(true);
    });
  }, [isLoginPage]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse text-brand-orange font-heading text-xl">Loading…</div>
      </div>
    );
  }

  // Login page renders without sidebar
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-50">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand-orange" fill="currentColor">
              <path d="M12 18c-2.2 0-4-1.3-4-3s1.8-3 4-3 4 1.3 4 3-1.8 3-4 3zm-5.5-5.5a2 2 0 100-4 2 2 0 000 4zm3-3.5a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zm3 3.5a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="font-heading font-bold text-lg">PawsitiveSpace</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition
                  ${active ? "bg-brand-orange/10 text-brand-orange" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer - volunteer info */}
        {volunteer && (
          <div className="border-t border-gray-100 px-4 py-4">
            <p className="text-sm font-bold text-gray-800 truncate">{volunteer.name}</p>
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 capitalize ${roleBadge[volunteer.role] ?? "bg-gray-100 text-gray-600"}`}>
              {volunteer.role}
            </span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/admin/login");
              }}
              className="block text-xs text-gray-400 hover:text-red-500 mt-2"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ---- Main content ---- */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 z-20 flex items-center justify-between">
          <span className="font-heading font-bold text-lg">PawsitiveSpace</span>
          {volunteer && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleBadge[volunteer.role] ?? "bg-gray-100"}`}>
              {volunteer.role}
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      {/* ---- Mobile Bottom Nav ---- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex overflow-x-auto z-30">
        {MOBILE_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 min-w-[64px] flex flex-col items-center py-2 text-[10px] font-semibold
                ${active ? "text-brand-orange" : "text-gray-400"}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
