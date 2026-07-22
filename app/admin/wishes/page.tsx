"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import { buildWaLink } from "@/lib/click-to-chat";

interface Wish {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age_preference: string | null;
  location: string | null;
  notes: string | null;
  requester_name: string;
  requester_mobile: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  fulfilled: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-500",
};

const FILTERS = ["all", "open", "fulfilled", "closed"] as const;

export default function AdminWishesPage() {
  const supabase = createBrowserClient();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("open");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("adoption_wishes")
      .select("*")
      .order("created_at", { ascending: false });
    setWishes((data ?? []) as Wish[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    await supabase.from("adoption_wishes").update({ status }).eq("id", id);
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this wish permanently? This cannot be undone.")) return;
    setBusy(id);
    await supabase.from("adoption_wishes").delete().eq("id", id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
    setBusy(null);
  }

  const filtered = useMemo(
    () => wishes.filter((w) => filter === "all" || w.status === filter),
    [wishes, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: wishes.length, open: 0, fulfilled: 0, closed: 0 };
    for (const w of wishes) c[w.status] = (c[w.status] ?? 0) + 1;
    return c;
  }, [wishes]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Adoption Wishlist</h1>
      <p className="text-gray-500 text-sm mb-6">
        Requests for specific animals not yet listed. Moderate spam, mark fulfilled, or close stale requests.
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition ${
              filter === f ? "bg-brand-orange text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f} <span className="opacity-70">({counts[f] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No {filter === "all" ? "" : filter} wishes.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => {
            const label = w.species === "other" ? w.species_other || "Other" : w.species;
            const avatarSpecies = w.species === "cat" || w.species === "dog" ? w.species : "other";
            const wa = buildWaLink(
              w.requester_mobile,
              `Hi ${w.requester_name}, this is PawsitiveSpace regarding your adoption request for a ${w.breed ? w.breed + " " : ""}${label}.`
            );
            return (
              <div key={w.id} className="bg-white rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <AnimalAvatar species={avatarSpecies} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm capitalize truncate">
                      {w.breed ? `${w.breed} ` : ""}
                      {label}
                    </p>
                    {w.age_preference && <p className="text-xs text-gray-500">{w.age_preference}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[w.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {w.status}
                  </span>
                </div>

                {w.location && <p className="text-xs text-gray-500 mb-1">📍 {w.location}</p>}
                {w.notes && <p className="text-sm text-gray-600 mb-2">{w.notes}</p>}

                <div className="mt-auto pt-3 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-700">{w.requester_name}</p>
                  <div className="flex items-center justify-between">
                    <a href={`tel:${w.requester_mobile}`} className="font-mono text-sm text-brand-orange font-semibold hover:underline">
                      {w.requester_mobile}
                    </a>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="text-green-600 text-xs font-bold hover:underline">
                        Message
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(w.created_at).toLocaleDateString()}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {w.status !== "fulfilled" && (
                      <button onClick={() => setStatus(w.id, "fulfilled")} disabled={busy === w.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                        Fulfilled
                      </button>
                    )}
                    {w.status !== "closed" && (
                      <button onClick={() => setStatus(w.id, "closed")} disabled={busy === w.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50">
                        Close
                      </button>
                    )}
                    {w.status !== "open" && (
                      <button onClick={() => setStatus(w.id, "open")} disabled={busy === w.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">
                        Reopen
                      </button>
                    )}
                    <button onClick={() => remove(w.id)} disabled={busy === w.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
