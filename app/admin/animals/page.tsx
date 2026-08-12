"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";

interface Listing {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age: string | null;
  gender: string | null;
  spayed_neutered: boolean | null;
  location: string | null;
  description: string | null;
  photos: string[] | null;
  foster_name: string;
  foster_mobile: string;
  foster_email: string | null;
  status: string;
  created_at: string;
}

const STATUS_FILTERS = ["all", "open", "adopted", "closed"];
const SPECIES_FILTERS = ["all", "cat", "dog", "other"];

const statusPill: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  adopted: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-500",
};

export default function AdoptionsPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    let q = supabase.from("adoption_listings").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (speciesFilter !== "all") q = q.eq("species", speciesFilter);
    const { data } = await q;
    let rows = (data ?? []) as Listing[];
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.foster_name?.toLowerCase().includes(s) ||
          l.foster_mobile?.toLowerCase().includes(s) ||
          l.foster_email?.toLowerCase().includes(s) ||
          l.location?.toLowerCase().includes(s)
      );
    }
    setListings(rows);
  }, [statusFilter, speciesFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function closeListing(id: string) {
    setBusy(id);
    await supabase.from("adoption_listings").update({ status: "closed" }).eq("id", id);
    await supabase.from("adoption_requests").update({ status: "rejected" }).eq("listing_id", id).eq("status", "pending");
    setBusy("");
    load();
  }

  async function reopenListing(id: string) {
    setBusy(id);
    await supabase.from("adoption_listings").update({ status: "open" }).eq("id", id);
    setBusy("");
    load();
  }

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  function title(l: Listing) {
    const sp = l.species === "other" ? (l.species_other || "Animal") : l.species;
    return cap(l.breed?.trim() || sp);
  }
  function details(l: Listing) {
    const parts: string[] = [];
    const sp = l.species === "other" ? (l.species_other || "Animal") : l.species;
    if (l.breed?.trim()) parts.push(cap(sp));
    if (l.age?.trim()) parts.push(l.age.trim());
    if (l.gender && l.gender !== "unknown") parts.push(cap(l.gender));
    if (l.spayed_neutered) parts.push("Spayed/Neutered");
    return parts.join(" \u00b7 ");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Adoptions</h1>
        <a href="/adopt/list" target="_blank" rel="noopener noreferrer" className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Listing
        </a>
      </div>

      <p className="text-sm text-gray-500 mb-5">All animals posted for adoption, with the foster/caretaker contact behind each one.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All Status" : cap(s)}</option>)}
        </select>
        <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {SPECIES_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All Species" : cap(s)}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search foster name, mobile, email or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px]"
        />
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No adoption listings found.</div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Photo */}
              {l.photos && l.photos.length > 0 ? (
                <img src={l.photos[0]} alt={title(l)} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="flex-shrink-0"><AnimalAvatar species={l.species === "cat" || l.species === "dog" ? l.species : "other"} size={80} /></div>
              )}

              {/* Animal + foster info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{title(l)}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusPill[l.status] ?? "bg-gray-100 text-gray-500"}`}>{l.status}</span>
                </div>
                {details(l) && <p className="text-xs text-gray-500">{details(l)}</p>}
                {l.location && <p className="text-xs text-gray-400 truncate">📍 {l.location}</p>}

                <div className="mt-2 border-t pt-2 text-xs">
                  <p className="font-semibold text-gray-700">{l.foster_name}</p>
                  <div className="flex items-center gap-3 flex-wrap text-gray-500">
                    <MaskedPhone number={l.foster_mobile} />
                    {l.foster_email ? <span className="truncate">✉️ {l.foster_email}</span> : <span className="text-gray-300">✉️ no email linked</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Listed {new Date(l.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push(`/adopt/edit/${l.id}`)}
                  className="border border-brand-orange text-brand-orange font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-brand-orange/10 transition"
                >
                  Edit
                </button>
                {l.status === "open" ? (
                  <button
                    onClick={() => closeListing(l.id)}
                    disabled={busy === l.id}
                    className="border border-red-300 text-red-600 font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    onClick={() => reopenListing(l.id)}
                    disabled={busy === l.id}
                    className="border border-green-300 text-green-600 font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-green-50 transition disabled:opacity-50"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

