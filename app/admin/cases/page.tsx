"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import StatusBadge from "@/components/admin/StatusBadge";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";
import CaseDrawer from "@/components/admin/CaseDrawer";

interface CaseRow {
  id: string;
  status: string;
  case_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  animals: { id: string; name: string | null; species: string; location_description: string | null; health_notes: string | null; photos: string[] } | null;
  reporters: { whatsapp_number: string } | null;
  volunteers: { id: string; name: string } | null;
}

interface Volunteer {
  id: string;
  name: string;
}

const STATUS_FILTERS = ["all", "open", "in_progress", "resolved", "closed"];
const SPECIES_FILTERS = ["all", "cat", "dog", "other"];

export default function CasesPage() {
  const supabase = createBrowserClient();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CaseRow | null>(null);
  const [notes, setNotes] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    let q = supabase
      .from("rescue_cases")
      .select("id, status, case_notes, assigned_to, created_at, animals(id, name, species, location_description, health_notes, photos), reporters(whatsapp_number), volunteers(id, name)")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") q = q.eq("status", statusFilter);

    const { data } = await q;
    let rows = (data ?? []) as unknown as CaseRow[];

    if (speciesFilter !== "all") {
      rows = rows.filter((r) => r.animals?.species === speciesFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.animals?.location_description?.toLowerCase().includes(s)
      );
    }
    setCases(rows);

    const { data: vols } = await supabase.from("volunteers").select("id, name").eq("is_active", true);
    setVolunteers((vols ?? []) as Volunteer[]);
  }, [statusFilter, speciesFilter, search]);

  useEffect(() => { load(); }, [load]);

  function openDrawer(c: CaseRow) {
    setSelected(c);
    setNotes(c.case_notes ?? "");
    setAssignTo(c.assigned_to ?? "");
  }

  async function saveCase() {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("rescue_cases")
      .update({ case_notes: notes, assigned_to: assignTo || null })
      .eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  async function updateStatus(newStatus: string) {
    if (!selected) return;
    setSaving(true);
    await supabase.from("rescue_cases").update({ status: newStatus }).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Rescue Cases</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace(/_/g, " ")}</option>)}
        </select>
        <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {SPECIES_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All Species" : s}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search location or case ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Case</th>
                <th className="px-4 py-3">Animal</th>
                <th className="px-4 py-3 hidden sm:table-cell">Location</th>
                <th className="px-4 py-3 hidden md:table-cell">Reporter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Assigned</th>
                <th className="px-4 py-3 hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cases.map((c) => (
                <tr key={c.id} onClick={() => openDrawer(c)} className="hover:bg-orange-50/50 cursor-pointer transition">
                  <td className="px-4 py-3 font-mono font-bold text-brand-orange">{c.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AnimalAvatar species={c.animals?.species ?? "other"} size={48} />
                      <span>{c.animals?.name ?? c.animals?.species ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500 truncate max-w-[200px]">{c.animals?.location_description ?? "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{c.reporters?.whatsapp_number ? <MaskedPhone number={c.reporters.whatsapp_number} /> : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{c.volunteers?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No cases found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Drawer */}
      <CaseDrawer open={!!selected} onClose={() => setSelected(null)} title={`Case ${selected?.id.slice(0, 8).toUpperCase() ?? ""}`}>
        {selected && (
          <div className="space-y-6">
            {/* Animal details */}
            <div className="flex items-center gap-4">
              <AnimalAvatar species={selected.animals?.species ?? "other"} size={96} />
              <div>
                <p className="font-bold text-lg">{selected.animals?.name ?? "Unnamed"}</p>
                <p className="text-sm text-gray-500 capitalize">{selected.animals?.species}</p>
              </div>
            </div>

            {selected.animals?.health_notes && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Health Notes</h4>
                <p className="text-sm">{selected.animals.health_notes}</p>
              </div>
            )}

            {selected.animals?.location_description && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Location</h4>
                <p className="text-sm">{selected.animals.location_description}</p>
              </div>
            )}

            {selected.reporters?.whatsapp_number && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Reporter</h4>
                <MaskedPhone number={selected.reporters.whatsapp_number} />
              </div>
            )}

            {/* Photos */}
            {selected.animals?.photos && selected.animals.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Photos</h4>
                <div className="flex gap-2 flex-wrap">
                  {selected.animals.photos.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Case Notes</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Assign volunteer */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Assign Volunteer</h4>
              <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <button onClick={saveCase} disabled={saving} className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {/* Status actions */}
            <div className="flex gap-2">
              {selected.status === "open" && (
                <button onClick={() => updateStatus("in_progress")} className="flex-1 bg-amber-100 text-amber-700 font-bold py-2 rounded-lg text-sm">
                  Mark In Progress
                </button>
              )}
              {(selected.status === "open" || selected.status === "in_progress") && (
                <button onClick={() => updateStatus("resolved")} className="flex-1 bg-green-100 text-green-700 font-bold py-2 rounded-lg text-sm">
                  Mark Resolved
                </button>
              )}
              {selected.status !== "closed" && (
                <button onClick={() => updateStatus("closed")} className="flex-1 bg-gray-100 text-gray-500 font-bold py-2 rounded-lg text-sm">
                  Close Case
                </button>
              )}
            </div>
          </div>
        )}
      </CaseDrawer>
    </div>
  );
}
