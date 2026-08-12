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
  animals: { id: string; name: string | null; species: string; breed: string | null; age_estimate: string | null; gender: string | null; sterilized: boolean | null; location_description: string | null; health_notes: string | null; temperament_notes: string | null; photos: string[] } | null;
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

  // Convert-to-adoption state
  const [convertCase, setConvertCase] = useState<CaseRow | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [convertForm, setConvertForm] = useState({
    species: "dog", species_other: "", breed: "", age: "", gender: "unknown",
    spayed_neutered: false, location: "", description: "", foster_name: "", foster_mobile: "",
  });

  const load = useCallback(async () => {
    let q = supabase
      .from("rescue_cases")
      .select("id, status, case_notes, assigned_to, created_at, animals(id, name, species, breed, age_estimate, gender, sterilized, location_description, health_notes, temperament_notes, photos), reporters(whatsapp_number), volunteers(id, name)")
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

  // Best-effort read of gender / neuter status from free-text notes when the
  // structured animal fields are empty. Checks "female" before "male" because
  // "female" contains the substring "male".
  function parseNotes(text: string) {
    const t = (text || "").toLowerCase();
    let gender = "";
    if (/female|\bshe\b|\bbitch\b/.test(t)) gender = "female";
    else if (/\bmale\b/.test(t)) gender = "male";
    let neutered: boolean | null = null;
    if (/neuter|spay|steril/.test(t)) {
      neutered = /(not|un|non)[-\s]?(neuter|spay|steril)/.test(t) ? false : true;
    }
    return { gender, neutered };
  }

  function openConvert(c: CaseRow) {
    const a = c.animals;
    const parsed = parseNotes([a?.health_notes, a?.temperament_notes, c.case_notes].filter(Boolean).join(" "));
    const species = a?.species === "cat" || a?.species === "dog" ? a.species : "other";
    setConvertForm({
      species,
      species_other: "",
      breed: a?.breed ?? "",
      age: a?.age_estimate ?? "",
      gender: (a?.gender && a.gender !== "unknown" ? a.gender : parsed.gender) || "unknown",
      spayed_neutered: !!a?.sterilized || parsed.neutered === true,
      location: a?.location_description ?? "",
      description: [a?.health_notes, a?.temperament_notes].filter(Boolean).join("\n"),
      foster_name: c.volunteers?.name ?? "",
      foster_mobile: c.reporters?.whatsapp_number ?? "",
    });
    setConvertError("");
    setConvertCase(c);
  }

  async function submitConvert() {
    if (!convertCase) return;
    setConvertError("");
    if (!convertForm.foster_name.trim() || !convertForm.foster_mobile.trim()) {
      setConvertError("Foster/caretaker name and mobile are required."); return;
    }
    if (convertForm.species === "other" && !convertForm.species_other.trim()) {
      setConvertError("Please specify the species."); return;
    }
    setConverting(true);
    const photos = convertCase.animals?.photos ?? [];
    const { error } = await supabase.from("adoption_listings").insert({
      species: convertForm.species,
      species_other: convertForm.species === "other" ? convertForm.species_other.trim() : null,
      breed: convertForm.breed.trim() || null,
      age: convertForm.age.trim() || null,
      gender: convertForm.gender,
      spayed_neutered: convertForm.spayed_neutered,
      location: convertForm.location.trim() || null,
      description: convertForm.description.trim() || null,
      photos: photos.length > 0 ? photos : [],
      foster_name: convertForm.foster_name.trim(),
      foster_mobile: convertForm.foster_mobile.trim(),
      status: "open",
    });
    if (error) { setConverting(false); setConvertError(error.message); return; }
    await supabase.from("rescue_cases").update({ status: "resolved" }).eq("id", convertCase.id);
    setConverting(false);
    setConvertCase(null);
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
                      {c.animals?.photos && c.animals.photos.length > 0 ? (
                        <img src={c.animals.photos[0]} alt={c.animals?.name ?? c.animals?.species ?? "animal"} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <AnimalAvatar species={c.animals?.species ?? "other"} size={48} />
                      )}
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
              {selected.animals?.photos && selected.animals.photos.length > 0 ? (
                <img src={selected.animals.photos[0]} alt={selected.animals?.name ?? selected.animals?.species ?? "animal"} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <AnimalAvatar species={selected.animals?.species ?? "other"} size={96} />
              )}
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

            {/* Convert this rescue into an adoption listing */}
            <button onClick={() => openConvert(selected)} className="w-full flex items-center justify-center gap-2 bg-brand-orange/10 text-brand-orange font-bold py-2.5 rounded-lg text-sm hover:bg-brand-orange/20 transition">
              🏠 Convert to Adoption Listing
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

      {/* Convert to Adoption modal */}
      {convertCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConvertCase(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Convert to Adoption</h2>
              <button onClick={() => setConvertCase(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-amber-50 rounded-lg p-3">
                We pre-filled what we could from the rescue record. Review and edit anything before creating the listing — especially the foster/caretaker name and mobile, which are required.
              </p>

              {convertError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{convertError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Animal *</label>
                  <select value={convertForm.species} onChange={(e) => setConvertForm({ ...convertForm, species: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐱 Cat</option>
                    <option value="other">🐾 Other</option>
                  </select>
                </div>
                {convertForm.species === "other" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Specify *</label>
                    <input value={convertForm.species_other} onChange={(e) => setConvertForm({ ...convertForm, species_other: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Rabbit" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Breed</label>
                  <input value={convertForm.breed} onChange={(e) => setConvertForm({ ...convertForm, breed: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Indie" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Age</label>
                  <input value={convertForm.age} onChange={(e) => setConvertForm({ ...convertForm, age: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 2 years" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Gender</label>
                  <select value={convertForm.gender} onChange={(e) => setConvertForm({ ...convertForm, gender: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={convertForm.spayed_neutered} onChange={(e) => setConvertForm({ ...convertForm, spayed_neutered: e.target.checked })} className="rounded accent-[#FF8C42]" />
                    Spayed/Neutered
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                <input value={convertForm.location} onChange={(e) => setConvertForm({ ...convertForm, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Banjara Hills, Hyderabad" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                <textarea value={convertForm.description} onChange={(e) => setConvertForm({ ...convertForm, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Personality, health, story…" />
              </div>

              {convertCase.animals?.photos && convertCase.animals.photos.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Photos (carried over from the rescue)</label>
                  <div className="flex gap-2 flex-wrap">
                    {convertCase.animals.photos.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              )}

              <hr />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Foster / caretaker name *</label>
                  <input value={convertForm.foster_name} onChange={(e) => setConvertForm({ ...convertForm, foster_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Foster mobile *</label>
                  <input value={convertForm.foster_mobile} onChange={(e) => setConvertForm({ ...convertForm, foster_mobile: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>

              <button onClick={submitConvert} disabled={converting} className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:brightness-110 transition disabled:opacity-50">
                {converting ? "Creating listing…" : "Create Adoption Listing & Resolve Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
