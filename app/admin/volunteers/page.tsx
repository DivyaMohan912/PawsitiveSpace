"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";

interface Volunteer {
  id: string;
  name: string;
  whatsapp_number: string;
  email: string | null;
  role: string;
  is_active: boolean;
  area_coverage: string | null;
  availability: string | null;
  motivation: string | null;
  interests: string[] | null;
  can_rescue_animals: string[] | null;
  created_at: string;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  weekdays: "Weekdays only",
  weekends: "Weekends only",
  both: "Weekdays & Weekends",
  flexible: "Flexible / On-call",
};

const ROLES = ["rescuer", "foster", "transporter", "admin"];
const ROLE_COLORS: Record<string, string> = {
  rescuer: "bg-red-100 text-red-700",
  foster: "bg-teal-100 text-teal-700",
  transporter: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
};

const ANIMAL_OPTIONS = [
  { value: "dogs", label: "🐕 Dogs" },
  { value: "cats", label: "🐱 Cats" },
  { value: "birds", label: "🐦 Birds" },
  { value: "snakes", label: "🐍 Snakes & Reptiles" },
  { value: "cattle", label: "🐄 Cattle" },
  { value: "monkeys", label: "🐒 Monkeys" },
  { value: "small_mammals", label: "🐇 Small mammals" },
];
const ANIMAL_LABELS: Record<string, string> = Object.fromEntries(
  ANIMAL_OPTIONS.map((o) => [o.value, o.label])
);
const STANDARD_ANIMALS = ANIMAL_OPTIONS.map((o) => o.value);

const EMPTY = { name: "", whatsapp_number: "", email: "", role: "rescuer", is_active: true, area_coverage: "", availability: "", can_rescue_animals: [] as string[], animals_other: "" };

export default function VolunteersPage() {
  const supabase = createBrowserClient();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [rescueStats, setRescueStats] = useState<Record<string, { picked: number; resolved: number }>>({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<typeof EMPTY & { id?: string }>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [volRes, caseRes] = await Promise.all([
      supabase.from("volunteers").select("*").order("created_at", { ascending: false }),
      supabase.from("rescue_cases").select("assigned_to, status").not("assigned_to", "is", null),
    ]);
    setVolunteers((volRes.data ?? []) as Volunteer[]);

    const stats: Record<string, { picked: number; resolved: number }> = {};
    for (const c of (caseRes.data ?? []) as { assigned_to: string; status: string }[]) {
      const s = stats[c.assigned_to] ?? { picked: 0, resolved: 0 };
      s.picked += 1;
      if (c.status === "resolved" || c.status === "closed") s.resolved += 1;
      stats[c.assigned_to] = s;
    }
    setRescueStats(stats);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(v: Volunteer) {
    const existing = v.can_rescue_animals ?? [];
    const standard = existing.filter((a) => STANDARD_ANIMALS.includes(a));
    const other = existing.filter((a) => !STANDARD_ANIMALS.includes(a));
    setForm({ id: v.id, name: v.name, whatsapp_number: v.whatsapp_number, email: v.email ?? "", role: v.role, is_active: v.is_active, area_coverage: v.area_coverage ?? "", availability: v.availability ?? "", can_rescue_animals: standard, animals_other: other.join(", ") });
    setModal(true);
  }

  function toggleAnimal(value: string) {
    setForm((f) => ({
      ...f,
      can_rescue_animals: f.can_rescue_animals.includes(value)
        ? f.can_rescue_animals.filter((a) => a !== value)
        : [...f.can_rescue_animals, value],
    }));
  }

  async function toggleActive(v: Volunteer) {
    await supabase.from("volunteers").update({ is_active: !v.is_active }).eq("id", v.id);
    load();
  }

  async function save() {
    setSaving(true);
    const animals = Array.from(new Set([
      ...form.can_rescue_animals,
      ...form.animals_other.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean),
    ]));
    const payload = {
      name: form.name,
      whatsapp_number: form.whatsapp_number,
      email: form.email || null,
      role: form.role,
      is_active: form.is_active,
      area_coverage: form.area_coverage || null,
      availability: form.availability || null,
      can_rescue_animals: animals.length > 0 ? animals : null,
    };

    if (form.id) {
      await supabase.from("volunteers").update(payload).eq("id", form.id);
    } else {
      await supabase.from("volunteers").insert(payload);

      // If admin role, create auth account via server route
      if (form.role === "admin" && form.email) {
        await fetch("/api/admin/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
      }
    }
    setSaving(false);
    setModal(false);
    setForm(EMPTY);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Volunteers</h1>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm">
          + Add Volunteer
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Animals</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Rescues Picked</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Resolved</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {volunteers.map((v) => (
                <tr key={v.id} className="hover:bg-orange-50/50">
                  <td className="px-4 py-3 font-semibold align-top">
                    {v.name}
                    {v.motivation && (
                      <span className="hidden lg:block font-normal text-xs text-gray-400 lg:max-w-[220px] lg:truncate" title={v.motivation}>
                        “{v.motivation}”
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{v.whatsapp_number}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(v.interests && v.interests.length > 0 ? v.interests : [v.role]).map((r) => (
                        <span key={r} className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[r] ?? "bg-gray-100"}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {v.can_rescue_animals && v.can_rescue_animals.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {v.can_rescue_animals.map((a) => (
                          <span key={a} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
                            {ANIMAL_LABELS[a] ?? a.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700 hidden lg:table-cell">{rescueStats[v.id]?.picked ?? 0}</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="font-bold text-green-600">{rescueStats[v.id]?.resolved ?? 0}</span>
                    {(rescueStats[v.id]?.picked ?? 0) > 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({Math.round(((rescueStats[v.id]?.resolved ?? 0) / (rescueStats[v.id]?.picked ?? 1)) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{v.area_coverage ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{v.availability ? (AVAILABILITY_LABELS[v.availability] ?? v.availability) : "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(v)}
                      className={`w-10 h-5 rounded-full transition relative ${v.is_active ? "bg-green-400" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${v.is_active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(v)} className="text-brand-orange text-xs font-bold hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && <tr><td colSpan={10} className="text-center py-12 text-gray-400">No volunteers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="font-heading font-bold text-lg mb-4">{form.id ? "Edit Volunteer" : "Add Volunteer"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500">Name</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">WhatsApp Number</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+919876543210" /></div>
              <div><label className="text-xs font-bold text-gray-500">Email</label><input type="email" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500">Role</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Area Coverage</label><input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.area_coverage} onChange={(e) => setForm({ ...form, area_coverage: e.target.value })} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500">Animals rescued</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {ANIMAL_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.can_rescue_animals.includes(opt.value)} onChange={() => toggleAnimal(opt.value)} className="w-4 h-4 accent-brand-orange" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-2" value={form.animals_other} onChange={(e) => setForm({ ...form, animals_other: e.target.value })} placeholder="Other (comma separated)" />
              </div>
              <div><label className="text-xs font-bold text-gray-500">Availability</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                  <option value="">— Not set —</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="weekends">Weekends only</option>
                  <option value="both">Weekdays &amp; Weekends</option>
                  <option value="flexible">Flexible / On-call</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border rounded-lg py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-brand-orange text-white font-bold py-2.5 rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
