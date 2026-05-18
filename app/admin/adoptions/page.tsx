"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";
import CaseDrawer from "@/components/admin/CaseDrawer";

interface Adoption {
  id: string;
  status: string;
  adopter_name: string;
  adopter_whatsapp: string;
  adopter_email: string | null;
  notes: string | null;
  created_at: string;
  animals: { id: string; name: string | null; species: string; status: string } | null;
}

const COLUMNS = ["enquiry", "application", "approved", "completed", "rejected"] as const;
const COL_COLORS: Record<string, string> = {
  enquiry: "border-amber-300 bg-amber-50",
  application: "border-blue-300 bg-blue-50",
  approved: "border-green-300 bg-green-50",
  completed: "border-emerald-300 bg-emerald-50",
  rejected: "border-red-300 bg-red-50",
};

function AdoptionCard({ adoption, onClick }: { adoption: Adoption; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: adoption.id,
    data: { status: adoption.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 mb-2">
        <AnimalAvatar species={adoption.animals?.species ?? "other"} size={28} />
        <span className="font-semibold text-sm truncate">{adoption.animals?.name ?? "Unknown"}</span>
      </div>
      <p className="text-xs text-gray-600 truncate">{adoption.adopter_name}</p>
      <MaskedPhone number={adoption.adopter_whatsapp} />
      <p className="text-[10px] text-gray-400 mt-1">{new Date(adoption.created_at).toLocaleDateString()}</p>
    </div>
  );
}

export default function AdoptionsPage() {
  const supabase = createBrowserClient();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [selected, setSelected] = useState<Adoption | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("adoptions")
      .select("*, animals(id, name, species, status)")
      .order("created_at", { ascending: false });
    setAdoptions((data ?? []) as unknown as Adoption[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const overCol = over.id as string;
    // over.id is the column droppable id (the status string)
    if (!COLUMNS.includes(overCol as any)) return;

    const adoptionId = active.id as string;
    const adoption = adoptions.find((a) => a.id === adoptionId);
    if (!adoption || adoption.status === overCol) return;

    // Optimistic update
    setAdoptions((prev) => prev.map((a) => a.id === adoptionId ? { ...a, status: overCol } : a));

    await supabase.from("adoptions").update({ status: overCol }).eq("id", adoptionId);

    // If approved/completed, update animal to adopted
    if ((overCol === "approved" || overCol === "completed") && adoption.animals?.id) {
      await supabase.from("animals").update({ status: "adopted" }).eq("id", adoption.animals.id);
    }
  }

  function openDrawer(a: Adoption) {
    setSelected(a);
    setNotes(a.notes ?? "");
  }

  async function updateAdoption(status: string) {
    if (!selected) return;
    setSaving(true);
    await supabase.from("adoptions").update({ status, notes }).eq("id", selected.id);
    if ((status === "approved" || status === "completed") && selected.animals?.id) {
      await supabase.from("animals").update({ status: "adopted" }).eq("id", selected.animals.id);
    }
    setSaving(false);
    setSelected(null);
    load();
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("adoptions").update({ notes }).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Adoption Pipeline</h1>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const items = adoptions.filter((a) => a.status === col);
            return (
              <KanbanColumn key={col} id={col} color={COL_COLORS[col]}>
                <h3 className="font-bold text-sm capitalize mb-3 px-1">
                  {col.replace(/_/g, " ")} <span className="text-gray-400 font-normal">({items.length})</span>
                </h3>
                <div className="space-y-2 min-h-[100px]">
                  {items.map((a) => (
                    <AdoptionCard key={a.id} adoption={a} onClick={() => openDrawer(a)} />
                  ))}
                </div>
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      <CaseDrawer open={!!selected} onClose={() => setSelected(null)} title="Adoption Details">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <AnimalAvatar species={selected.animals?.species ?? "other"} size={48} />
              <div>
                <p className="font-bold">{selected.animals?.name ?? "Unknown"}</p>
                <p className="text-sm text-gray-500 capitalize">{selected.animals?.species}</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Adopter</h4>
              <p className="text-sm font-semibold">{selected.adopter_name}</p>
              <MaskedPhone number={selected.adopter_whatsapp} />
              {selected.adopter_email && <p className="text-sm text-gray-500">{selected.adopter_email}</p>}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</h4>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={saveNotes} disabled={saving} className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">
              Save Notes
            </button>
            <div className="flex gap-2">
              {selected.status !== "approved" && selected.status !== "completed" && (
                <button onClick={() => updateAdoption("approved")} className="flex-1 bg-green-100 text-green-700 font-bold py-2 rounded-lg text-sm">Approve</button>
              )}
              {selected.status !== "rejected" && (
                <button onClick={() => updateAdoption("rejected")} className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg text-sm">Reject</button>
              )}
            </div>
          </div>
        )}
      </CaseDrawer>
    </div>
  );
}

function KanbanColumn({ id, color, children }: { id: string; color: string; children: React.ReactNode }) {
  const { setNodeRef } = useSortable({ id, data: { type: "column" } });
  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-64 rounded-2xl border-2 p-3 ${color}`}>
      {children}
    </div>
  );
}
