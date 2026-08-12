"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";
import { generateAdoptionTile, downloadBlob } from "@/lib/adoption-tile";
import { uniqueNumbers, copyToClipboard, downloadCsv } from "@/lib/contacts";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  async function copyFosterNumbers() {
    const nums = uniqueNumbers(listings.map((l) => l.foster_mobile));
    if (nums.length === 0) { setContactMsg("No foster numbers found."); setTimeout(() => setContactMsg(""), 3000); return; }
    const ok = await copyToClipboard(nums.join(", "));
    setContactMsg(ok ? `Copied ${nums.length} number${nums.length === 1 ? "" : "s"} to clipboard.` : "Copy failed — use Download CSV instead.");
    setTimeout(() => setContactMsg(""), 4000);
  }

  function downloadFosterCsv() {
    const rows: string[][] = [["Foster", "Mobile", "Email"]];
    const seen = new Set<string>();
    for (const l of listings) {
      const num = (l.foster_mobile ?? "").trim();
      if (!num || seen.has(num)) continue;
      seen.add(num);
      rows.push([l.foster_name ?? "", num, l.foster_email ?? ""]);
    }
    downloadCsv(`pawsitivespace-fosters-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

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

  const allSelected = listings.length > 0 && listings.every((l) => selected.has(l.id));
  function toggleSelectAll() {
    setSelected((prev) => {
      if (listings.length > 0 && listings.every((l) => prev.has(l.id))) return new Set();
      return new Set(listings.map((l) => l.id));
    });
  }

  async function exportSelected() {
    const chosen = listings.filter((l) => selected.has(l.id));
    if (chosen.length === 0) return;
    setExporting(true);
    let done = 0;
    for (const l of chosen) {
      setExportMsg(`Generating ${done + 1} of ${chosen.length}…`);
      const blob = await generateAdoptionTile(l);
      if (blob) {
        const sp = l.species === "other" ? (l.species_other || "animal") : l.species;
        downloadBlob(blob, `pawsitivespace-adopt-${sp}-${l.id.slice(0, 6)}.png`);
        // Small gap so browsers don't block the batch of downloads.
        await new Promise((r) => setTimeout(r, 400));
      }
      done++;
    }
    setExporting(false);
    setExportMsg(`Downloaded ${done} tile${done === 1 ? "" : "s"}.`);
    setTimeout(() => setExportMsg(""), 4000);
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

      {/* Foster outreach: extract mobile numbers for WhatsApp */}
      {listings.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-gray-600">📱 Foster contacts</span>
          <button onClick={copyFosterNumbers} className="bg-brand-orange text-white font-bold px-3 py-1.5 rounded-lg text-sm hover:brightness-110">
            Copy numbers
          </button>
          <button onClick={downloadFosterCsv} className="border border-gray-300 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
            ⬇ Download CSV
          </button>
          <span className="text-xs text-gray-500">Paste into WhatsApp to share adoption drives.</span>
          {contactMsg && <span className="text-xs text-green-600 font-semibold w-full sm:w-auto">{contactMsg}</span>}
        </div>
      )}

      {/* Export toolbar */}
      {listings.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-xl px-4 py-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded accent-[#FF8C42]" />
            Select all
          </label>
          <span className="text-sm text-gray-400">{selected.size} selected</span>
          <button
            onClick={exportSelected}
            disabled={selected.size === 0 || exporting}
            className="ml-auto bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 disabled:opacity-40"
          >
            {exporting ? "Generating…" : `⬇ Export ${selected.size || ""} as PNG`}
          </button>
          {exportMsg && <span className="text-xs text-gray-500 w-full sm:w-auto">{exportMsg}</span>}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No adoption listings found.</div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className={`bg-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${selected.has(l.id) ? "ring-2 ring-brand-orange" : ""}`}>
              {/* Select for export */}
              <input
                type="checkbox"
                checked={selected.has(l.id)}
                onChange={() => toggleSelect(l.id)}
                className="self-start sm:self-center w-5 h-5 rounded accent-[#FF8C42] flex-shrink-0"
                aria-label="Select for export"
              />
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

