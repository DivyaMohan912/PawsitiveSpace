"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import StatusBadge from "@/components/admin/StatusBadge";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import EarTipBadge from "@/components/admin/EarTipBadge";

interface Animal {
  id: string;
  name: string | null;
  species: string;
  breed: string | null;
  age_estimate: string | null;
  gender: string | null;
  sterilized: boolean;
  ear_tipped: boolean;
  status: string;
  health_notes: string | null;
  temperament_notes: string | null;
  location_description: string | null;
  microchip_id: string | null;
  photos: string[];
  created_at: string;
}

const EMPTY: Partial<Animal> = {
  name: "", species: "dog", breed: "", age_estimate: "", gender: "unknown",
  sterilized: false, ear_tipped: false, status: "stray", health_notes: "",
  temperament_notes: "", location_description: "", microchip_id: "",
};

export default function AnimalsPage() {
  const supabase = createBrowserClient();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Animal>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    let q = supabase.from("animals").select("*").order("created_at", { ascending: false });
    if (speciesFilter !== "all") q = q.eq("species", speciesFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    let rows = (data ?? []) as Animal[];
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (a) => a.name?.toLowerCase().includes(s) || a.microchip_id?.toLowerCase().includes(s)
      );
    }
    setAnimals(rows);
  }, [speciesFilter, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(a: Animal) { setEditing({ ...a }); setModal(true); }

  async function save() {
    setSaving(true);
    const { id, created_at, ...rest } = editing as any;
    if (id) {
      await supabase.from("animals").update(rest).eq("id", id);
    } else {
      await supabase.from("animals").insert(rest);
    }
    setSaving(false);
    setModal(false);
    load();
  }

  function copyChip(chip: string) {
    navigator.clipboard.writeText(chip);
    setCopied(chip);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Animals</h1>
        <button onClick={openAdd} className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + Add Animal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">All Species</option>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
          <option value="other">Other</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">All Status</option>
          {["stray", "rescued", "fostered", "adopted", "deceased"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="text" placeholder="Search name or microchip…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <div className="flex border rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`px-3 py-2 text-sm ${view === "grid" ? "bg-brand-orange text-white" : ""}`}>Grid</button>
          <button onClick={() => setView("list")} className={`px-3 py-2 text-sm ${view === "list" ? "bg-brand-orange text-white" : ""}`}>List</button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {animals.map((a) => (
            <div key={a.id} onClick={() => openEdit(a)} className="bg-white rounded-2xl p-5 hover:shadow-lg transition cursor-pointer">
              <div className="flex justify-center py-3">
                <AnimalAvatar species={a.species} earTipped={a.ear_tipped} size={88} />
              </div>
              <h3 className="font-bold">{a.name || "Unnamed"}</h3>
              <p className="text-xs text-gray-500">{a.breed ?? a.species} · {a.age_estimate ?? "?"} · {a.gender ?? "?"}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={a.status} />
                {a.sterilized && <span className="text-xs text-green-600 font-semibold">✂️ Sterilized</span>}
                {a.species === "cat" && a.ear_tipped && <EarTipBadge />}
              </div>
              {a.microchip_id && (
                <button onClick={(e) => { e.stopPropagation(); copyChip(a.microchip_id!); }}
                  className="text-xs text-gray-400 mt-2 hover:text-brand-orange font-mono">
                  🏷 {a.microchip_id} {copied === a.microchip_id ? "✓" : "📋"}
                </button>
              )}
            </div>
          ))}
          {animals.length === 0 && <p className="col-span-full text-center text-gray-400 py-12">No animals found</p>}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase text-left">
              <tr>
                <th className="px-4 py-3">Animal</th>
                <th className="px-4 py-3">Species</th>
                <th className="px-4 py-3 hidden sm:table-cell">Breed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Microchip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {animals.map((a) => (
                <tr key={a.id} onClick={() => openEdit(a)} className="hover:bg-orange-50/50 cursor-pointer">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <AnimalAvatar species={a.species} earTipped={a.ear_tipped} size={48} />
                    <span className="font-semibold">{a.name || "Unnamed"}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{a.species}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{a.breed ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /> {a.species === "cat" && a.ear_tipped && <EarTipBadge />}</td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-gray-400">{a.microchip_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading font-bold text-lg mb-4">{editing.id ? "Edit Animal" : "Add Animal"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Name</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Species</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.species} onChange={(e) => setEditing({ ...editing, species: e.target.value })}>
                  <option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Breed</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.breed ?? ""} onChange={(e) => setEditing({ ...editing, breed: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Age Estimate</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.age_estimate ?? ""} onChange={(e) => setEditing({ ...editing, age_estimate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Gender</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.gender ?? "unknown"} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {["stray", "rescued", "fostered", "adopted", "deceased"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Microchip ID</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.microchip_id ?? ""} onChange={(e) => setEditing({ ...editing, microchip_id: e.target.value })} />
              </div>
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.sterilized ?? false} onChange={(e) => setEditing({ ...editing, sterilized: e.target.checked })} className="rounded" />
                  Sterilized
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.ear_tipped ?? false} onChange={(e) => setEditing({ ...editing, ear_tipped: e.target.checked })} className="rounded" />
                  Ear-tipped (TNR)
                </label>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Location</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={editing.location_description ?? ""} onChange={(e) => setEditing({ ...editing, location_description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Health Notes</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1" rows={2} value={editing.health_notes ?? ""} onChange={(e) => setEditing({ ...editing, health_notes: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Temperament Notes</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1" rows={2} value={editing.temperament_notes ?? ""} onChange={(e) => setEditing({ ...editing, temperament_notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border rounded-lg py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:brightness-110 disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
