"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import dynamic from "next/dynamic";
import EarTipBadge from "@/components/admin/EarTipBadge";

// Leaflet must be loaded client-side only
const ColonyMap = dynamic(() => import("@/components/admin/ColonyMap"), { ssr: false });

interface TNRRecord {
  id: string;
  animal_id: string;
  trap_date: string | null;
  neuter_date: string | null;
  return_date: string | null;
  ear_tipped: boolean;
  vet_name: string | null;
  vet_clinic: string | null;
  colony_location: string | null;
  notes: string | null;
  created_at: string;
  animals: { name: string | null; species: string; location_lat: number | null; location_lng: number | null } | null;
  volunteers: { name: string } | null;
}

interface Volunteer { id: string; name: string; }

const EMPTY_FORM = {
  animal_id: "", trap_date: "", neuter_date: "", return_date: "",
  ear_tipped: true, vet_name: "", vet_clinic: "", colony_location: "",
  managed_by: "", notes: "",
};

export default function TNRPage() {
  const supabase = createBrowserClient();
  const [records, setRecords] = useState<TNRRecord[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [animals, setAnimals] = useState<{ id: string; name: string | null; species: string }[]>([]);
  const [colonyFilter, setColonyFilter] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("tnr_records")
      .select("*, animals(name, species, location_lat, location_lng), volunteers(name)")
      .order("created_at", { ascending: false });
    let rows = (data ?? []) as unknown as TNRRecord[];
    if (colonyFilter.trim()) {
      const s = colonyFilter.toLowerCase();
      rows = rows.filter((r) => r.colony_location?.toLowerCase().includes(s));
    }
    setRecords(rows);

    const { data: vols } = await supabase.from("volunteers").select("id, name").eq("is_active", true);
    setVolunteers((vols ?? []) as Volunteer[]);

    const { data: cats } = await supabase.from("animals").select("id, name, species").eq("species", "cat");
    setAnimals((cats ?? []) as any[]);
  }, [colonyFilter]);

  useEffect(() => { load(); }, [load]);

  async function saveTNR() {
    setSaving(true);
    await supabase.from("tnr_records").insert({
      animal_id: form.animal_id || null,
      trap_date: form.trap_date || null,
      neuter_date: form.neuter_date || null,
      return_date: form.return_date || null,
      ear_tipped: form.ear_tipped,
      vet_name: form.vet_name || null,
      vet_clinic: form.vet_clinic || null,
      colony_location: form.colony_location || null,
      managed_by: form.managed_by || null,
      notes: form.notes || null,
    });
    // Auto-mark animal ear_tipped
    if (form.animal_id) {
      await supabase.from("animals").update({ ear_tipped: true, sterilized: true }).eq("id", form.animal_id);
    }
    setSaving(false);
    setModal(false);
    setForm(EMPTY_FORM);
    load();
  }

  const mapPoints = records
    .filter((r) => r.animals?.location_lat && r.animals?.location_lng)
    .map((r) => ({
      lat: r.animals!.location_lat!,
      lng: r.animals!.location_lng!,
      label: r.colony_location ?? r.animals?.name ?? "Colony",
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-bold">TNR Records</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowMap(!showMap)} className="border border-brand-orange text-brand-orange font-bold px-4 py-2 rounded-lg text-sm">
            {showMap ? "Table View" : "Colony Map 🗺"}
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setModal(true); }} className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm">
            + Add TNR
          </button>
        </div>
      </div>

      {/* Education banner */}
      <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <span className="text-2xl mt-0.5">🐱</span>
        <div>
          <p className="font-bold text-brand-orange">About Ear-Tipped Cats</p>
          <p className="text-sm text-gray-700 mt-1">
            Ear-tipped cats are already sterilized. The notch on the left ear is intentional —
            please <strong>do not re-trap or re-sterilize them</strong>. This is the universal
            sign of a TNR (Trap-Neuter-Return) community cat.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="text" placeholder="Filter by colony location…" value={colonyFilter}
          onChange={(e) => setColonyFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-sm"
        />
      </div>

      {showMap ? (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ height: 450 }}>
          <ColonyMap points={mapPoints} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase text-left">
                <tr>
                  <th className="px-4 py-3">Cat</th>
                  <th className="px-4 py-3">Colony</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Trap</th>
                  <th className="px-4 py-3">Neuter</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Return</th>
                  <th className="px-4 py-3 hidden md:table-cell">Vet</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Managed By</th>
                  <th className="px-4 py-3">Ear Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50/50">
                    <td className="px-4 py-3 font-semibold">{r.animals?.name ?? "Unnamed"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.colony_location ?? "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{r.trap_date ?? "—"}</td>
                    <td className="px-4 py-3">{r.neuter_date ?? "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{r.return_date ?? "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{r.vet_clinic ?? r.vet_name ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{r.volunteers?.name ?? "—"}</td>
                    <td className="px-4 py-3">{r.ear_tipped ? <EarTipBadge /> : "—"}</td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400">No TNR records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add TNR Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading font-bold text-lg mb-4">Add TNR Record</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Cat</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })}>
                  <option value="">Select a cat…</option>
                  {animals.map((a) => <option key={a.id} value={a.id}>{a.name ?? "Unnamed"} ({a.id.slice(0, 6)})</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Trap Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.trap_date} onChange={(e) => setForm({ ...form, trap_date: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Neuter Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.neuter_date} onChange={(e) => setForm({ ...form, neuter_date: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Return Date</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Vet Name</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.vet_name} onChange={(e) => setForm({ ...form, vet_name: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Vet Clinic</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.vet_clinic} onChange={(e) => setForm({ ...form, vet_clinic: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Colony Location</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.colony_location} onChange={(e) => setForm({ ...form, colony_location: e.target.value })} /></div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Managed By</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.managed_by} onChange={(e) => setForm({ ...form, managed_by: e.target.value })}>
                  <option value="">None</option>
                  {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Notes</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.ear_tipped} onChange={(e) => setForm({ ...form, ear_tipped: e.target.checked })} className="rounded" />
                Ear-tipped
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border rounded-lg py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={saveTNR} disabled={saving} className="flex-1 bg-brand-orange text-white font-bold py-2.5 rounded-lg disabled:opacity-50">
                {saving ? "Saving…" : "Save TNR Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
