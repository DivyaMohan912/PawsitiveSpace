"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase";

interface Volunteer {
  id: string;
  name: string;
  whatsapp_number: string;
  email: string | null;
  role: string;
  is_active: boolean;
  area_coverage: string | null;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  rescuer: "bg-red-100 text-red-700",
  foster: "bg-teal-100 text-teal-700",
  transporter: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
};

const HELP_TEMPLATES: Record<string, { emoji: string; label: string; message: (name: string) => string }> = {
  rescue: {
    emoji: "🚨",
    label: "Rescue Help",
    message: (name) => `Hi ${name}, this is PawsitiveSpace admin. We have a rescue case in your area and need your help. Are you available? Please check the Rescues page for details.`,
  },
  foster: {
    emoji: "🏠",
    label: "Foster Help",
    message: (name) => `Hi ${name}, this is PawsitiveSpace admin. We have a rescued animal that needs a foster home in your area. Would you be able to foster? Let us know!`,
  },
  adoption: {
    emoji: "🐾",
    label: "Adoption Help",
    message: (name) => `Hi ${name}, this is PawsitiveSpace admin. We need help with an adoption case in your area — home visit, transport, or follow-up. Are you available?`,
  },
  transport: {
    emoji: "🚗",
    label: "Transport Help",
    message: (name) => `Hi ${name}, this is PawsitiveSpace admin. We need help transporting an animal in your area. Are you available today?`,
  },
};

export default function ReachOutPage() {
  const supabase = createBrowserClient();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [helpType, setHelpType] = useState<string>("rescue");
  const [contacted, setContacted] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("volunteers")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setVolunteers((data ?? []) as Volunteer[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (roleFilter !== "all" && v.role !== roleFilter) return false;
      if (locationSearch.trim()) {
        const search = locationSearch.toLowerCase();
        const area = (v.area_coverage || "").toLowerCase();
        const name = v.name.toLowerCase();
        if (!area.includes(search) && !name.includes(search)) return false;
      }
      return true;
    });
  }, [volunteers, roleFilter, locationSearch]);

  // Group by area
  const grouped = useMemo(() => {
    const map = new Map<string, Volunteer[]>();
    for (const v of filtered) {
      const area = v.area_coverage?.trim() || "No Area Assigned";
      if (!map.has(area)) map.set(area, []);
      map.get(area)!.push(v);
    }
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "No Area Assigned") return 1;
      if (b[0] === "No Area Assigned") return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [filtered]);

  function getWhatsAppLink(v: Volunteer) {
    const template = HELP_TEMPLATES[helpType] ?? HELP_TEMPLATES.rescue;
    const phone = v.whatsapp_number.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(template.message(v.name.split(" ")[0]));
    return `https://wa.me/${phone}?text=${msg}`;
  }

  function markContacted(id: string) {
    setContacted((prev) => new Set(prev).add(id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-1">Reach Out to Volunteers</h1>
        <p className="text-gray-500 text-sm">Find and contact volunteers by location for rescue, fostering, adoption, or transport help.</p>
      </div>

      {/* Help type selector */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">What do you need help with?</label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(HELP_TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setHelpType(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                helpType === key ? "bg-brand-orange text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="🔍 Search by area or volunteer name…"
            className="w-full border rounded-lg px-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "rescuer", "foster", "transporter", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                roleFilter === r ? "bg-brand-orange text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1) + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white rounded-xl p-4 mb-5 flex items-center gap-6 text-sm">
        <span className="font-bold text-gray-700">{filtered.length} volunteer{filtered.length !== 1 ? "s" : ""} found</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">{grouped.length} area{grouped.length !== 1 ? "s" : ""}</span>
        {contacted.size > 0 && (
          <>
            <span className="text-gray-400">·</span>
            <span className="text-green-600 font-semibold">✓ {contacted.size} contacted</span>
          </>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-brand-orange animate-pulse">Loading volunteers…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400 mb-2">No volunteers found for this filter.</p>
          <p className="text-gray-400 text-sm">Try broadening your search or check a different role.</p>
        </div>
      )}

      {/* Grouped volunteer list */}
      {!loading && grouped.map(([area, vols]) => (
        <div key={area} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📍</span>
            <h2 className="font-heading font-bold text-base">{area}</h2>
            <span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full">{vols.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vols.map((v) => {
              const wasContacted = contacted.has(v.id);
              return (
                <div key={v.id} className={`bg-white rounded-xl p-4 transition ${wasContacted ? "ring-2 ring-green-300" : "hover:shadow-md"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{v.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{v.whatsapp_number}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[v.role] ?? "bg-gray-100"}`}>
                      {v.role}
                    </span>
                  </div>
                  {v.email && <p className="text-xs text-gray-400 mb-2">{v.email}</p>}
                  {wasContacted && (
                    <p className="text-xs text-green-600 font-semibold mb-2">✓ Contacted</p>
                  )}
                  <a
                    href={getWhatsAppLink(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markContacted(v.id)}
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-2 rounded-lg text-sm hover:brightness-110 transition"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.7 3 1.1 4.8 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                    {HELP_TEMPLATES[helpType]?.emoji} Ask for {HELP_TEMPLATES[helpType]?.label}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
