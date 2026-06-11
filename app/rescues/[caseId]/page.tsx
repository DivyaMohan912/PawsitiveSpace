"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import ShareToInstagram from "@/components/ShareToInstagram";
import { buildRescueCaption } from "@/lib/instagram";
import { createBrowserClient } from "@/lib/supabase";
import { loadCaseDetail, pickUpCase, updateCaseStatus } from "./actions";

interface CaseDetail {
  id: string;
  status: string;
  case_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  animal: {
    id: string;
    name: string | null;
    species: string;
    breed: string | null;
    age_estimate: string | null;
    gender: string | null;
    sterilized: boolean;
    ear_tipped: boolean;
    health_notes: string | null;
    temperament_notes: string | null;
    location_description: string | null;
    location_lat: number | null;
    location_lng: number | null;
    photos: string[];
    status: string;
  };
  reporter: {
    id: string;
    name: string | null;
    whatsapp_number: string;
  };
  volunteer: {
    id: string;
    name: string;
    whatsapp_number: string;
    area_coverage: string | null;
  } | null;
}

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  open: { bg: "bg-red-100 text-red-700", label: "🔴 Open — Needs Volunteer" },
  in_progress: { bg: "bg-yellow-100 text-yellow-700", label: "🟡 In Progress" },
  resolved: { bg: "bg-green-100 text-green-700", label: "🟢 Resolved" },
  closed: { bg: "bg-gray-100 text-gray-500", label: "⚪ Closed" },
};

const SLA_DAYS: Record<string, number> = { high: 2, medium: 7, low: 30 };
const URGENCY_LABELS: Record<string, string> = { high: "🔴 High — Resolve in 2 days", medium: "🟡 Medium — Resolve in 1 week", low: "🟢 Low — Resolve in 1 month" };

function getUrgency(caseNotes: string | null): "high" | "medium" | "low" {
  if (!caseNotes) return "medium";
  const lower = caseNotes.toLowerCase();
  if (lower.includes("urgency: high")) return "high";
  if (lower.includes("urgency: low")) return "low";
  return "medium";
}

function isOverdue(createdAt: string, caseNotes: string | null, status: string): boolean {
  if (status === "resolved" || status === "closed") return false;
  const urgency = getUrgency(caseNotes);
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > SLA_DAYS[urgency];
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [userRole, setUserRole] = useState<"admin" | "foster" | "reporter" | null>(null);

  // Pick up form
  const [showPickUp, setShowPickUp] = useState(false);
  const [volName, setVolName] = useState("");
  const [volMobile, setVolMobile] = useState("");
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState("");

  // Status update
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCaseDetail(caseId).then((data) => {
      setCaseData(data as unknown as CaseDetail | null);
      setLoading(false);
    });

    // Check user role
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        supabase.from("volunteers").select("role").eq("email", session.user.email).single()
          .then(({ data }) => {
            if (data?.role === "admin") setUserRole("admin");
            else if (data?.role === "foster") setUserRole("foster");
            else setUserRole("reporter");
          });
      }
    });
  }, [caseId]);

  async function handlePickUp() {
    if (!volName.trim() || !volMobile.trim()) {
      setPickError("Name and mobile number are required");
      return;
    }
    setPicking(true);
    setPickError("");
    const res = await pickUpCase(caseId, volName.trim(), volMobile.trim());
    if (res.success) {
      // Reload
      const data = await loadCaseDetail(caseId);
      setCaseData(data as unknown as CaseDetail | null);
      setShowPickUp(false);
    } else {
      setPickError(res.error || "Failed to assign");
    }
    setPicking(false);
  }

  async function handleStatusUpdate() {
    if (!newStatus) return;
    setUpdating(true);
    const res = await updateCaseStatus(caseId, newStatus, statusNotes.trim() || undefined);
    if (res.success) {
      const data = await loadCaseDetail(caseId);
      setCaseData(data as unknown as CaseDetail | null);
      setShowStatusUpdate(false);
      setStatusNotes("");
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-brand-orange animate-pulse text-lg">Loading case…</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <PublicNav current="/rescues" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">🐾</p>
          <h1 className="font-heading text-2xl font-bold mb-2">Case Not Found</h1>
          <p className="text-gray-500 mb-6">This rescue case doesn&apos;t exist or may have been removed.</p>
          <Link href="/rescues" className="text-brand-orange font-bold hover:underline">← Back to Rescue Cases</Link>
        </div>
      </div>
    );
  }

  const animal = caseData.animal;
  const reporter = caseData.reporter;
  const volunteer = caseData.volunteer;
  const style = STATUS_STYLES[caseData.status] ?? STATUS_STYLES.open;
  const hasPhotos = animal?.photos && animal.photos.length > 0;
  const mapsUrl = animal?.location_lat && animal?.location_lng
    ? `https://www.google.com/maps?q=${animal.location_lat},${animal.location_lng}`
    : null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/rescues" />

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <Link href="/rescues" className="inline-flex items-center gap-1 text-sm text-brand-orange font-semibold hover:underline mb-4">
          ← Back to Rescue Cases
        </Link>

        {/* Status banner */}
        <div className={`rounded-xl p-4 mb-5 flex items-center justify-between ${style.bg}`}>
          <div>
            <p className="font-bold text-sm">{style.label}</p>
            <p className="text-xs opacity-80">Case #{caseData.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <ShareToInstagram
              imageUrl={hasPhotos ? animal.photos[0] : null}
              caption={buildRescueCaption({
                animal_name: animal?.name,
                species: animal?.species ?? "animal",
                breed: animal?.breed,
                location: animal?.location_description,
                health_notes: animal?.health_notes,
                case_notes: caseData.case_notes,
              })}
              role={userRole}
              entityId={caseData.id}
            />
            <p className="text-xs opacity-70">
              Reported {new Date(caseData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          {/* Photos */}
          {hasPhotos ? (
            <div>
              <div className="flex items-center justify-center bg-gray-50 min-h-[240px] sm:min-h-[320px]">
                <img src={animal.photos[selectedPhoto]} alt="" className="max-h-[380px] w-full object-contain" />
              </div>
              {animal.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {animal.photos.map((url, i) => (
                    <button key={i} onClick={() => setSelectedPhoto(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedPhoto ? "border-brand-orange" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 bg-gray-50">
              <AnimalAvatar species={animal?.species ?? "other"} size={140} />
            </div>
          )}

          {/* Animal details */}
          <div className="p-6">
            <h1 className="font-heading text-2xl font-bold capitalize mb-1">
              {animal?.name || `${animal?.species ?? "Animal"} rescue`}
              {animal?.breed && <span className="text-gray-400 font-normal text-lg"> · {animal.breed}</span>}
            </h1>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Species</p>
                <p className="font-bold text-sm mt-0.5 capitalize">{animal?.species === "dog" ? "🐕 Dog" : animal?.species === "cat" ? "🐱 Cat" : "🐾 Other"}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Age</p>
                <p className="font-bold text-sm mt-0.5">{animal?.age_estimate || "Unknown"}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Gender</p>
                <p className="font-bold text-sm mt-0.5 capitalize">{animal?.gender === "male" ? "♂ Male" : animal?.gender === "female" ? "♀ Female" : "Unknown"}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Sterilized</p>
                <p className="font-bold text-sm mt-0.5">{animal?.sterilized ? "✅ Yes" : "❌ No"}{animal?.ear_tipped ? " · Ear-tipped" : ""}</p>
              </div>
            </div>

            {/* Health / condition */}
            {animal?.health_notes && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">Condition / Health Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{animal.health_notes}</p>
              </div>
            )}

            {animal?.temperament_notes && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">Temperament</h3>
                <p className="text-sm text-gray-600">{animal.temperament_notes}</p>
              </div>
            )}

            {caseData.case_notes && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">Case Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{caseData.case_notes}</p>
              </div>
            )}

            {/* Location */}
            {animal?.location_description && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">📍 Location</h3>
                <p className="text-sm text-gray-600">{animal.location_description}</p>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-orange font-bold mt-2 hover:underline">
                    Open in Google Maps ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reporter info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <h3 className="font-heading font-bold text-base mb-3">📞 Reporter Details</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">{reporter?.name || "Anonymous"}</p>
              <p className="text-sm text-gray-500">{reporter?.whatsapp_number}</p>
            </div>
            <a
              href={`https://wa.me/${reporter?.whatsapp_number?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'm a PawsitiveSpace volunteer following up on your animal rescue report. Can you share more details?")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.7 3 1.1 4.8 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
              Contact Reporter
            </a>
          </div>
        </div>

        {/* Assigned volunteer */}
        {volunteer && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
            <h3 className="font-heading font-bold text-base mb-2">🙋 Assigned Volunteer</h3>
            <p className="text-sm font-semibold text-gray-700">{volunteer.name}</p>
            <p className="text-sm text-gray-500">{volunteer.whatsapp_number}</p>
            {volunteer.area_coverage && <p className="text-xs text-gray-400 mt-1">Area: {volunteer.area_coverage}</p>}
          </div>
        )}

        {/* Urgency & SLA info */}
        {(() => {
          const urgency = getUrgency(caseData.case_notes);
          const overdue = isOverdue(caseData.created_at, caseData.case_notes, caseData.status);
          const daysSince = Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const sla = SLA_DAYS[urgency];
          return (
            <div className={`rounded-xl p-4 mb-5 ${overdue ? "bg-red-50 border-2 border-red-300" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Urgency: {URGENCY_LABELS[urgency]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{daysSince} day{daysSince !== 1 ? "s" : ""} since reported · SLA: {sla} days</p>
                </div>
                {overdue && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-600 text-white animate-pulse">
                    ⚠ OVERDUE — {daysSince - sla} day{daysSince - sla !== 1 ? "s" : ""} past SLA
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* Actions */}
        <div className="space-y-3">
          {/* Pick up case — open cases OR overdue in_progress cases (another volunteer can take over) */}
          {(caseData.status === "open" || (caseData.status === "in_progress" && isOverdue(caseData.created_at, caseData.case_notes, caseData.status))) && !showPickUp && (
            <button
              onClick={() => setShowPickUp(true)}
              className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl text-center text-lg hover:brightness-110 transition"
            >
              {caseData.status === "in_progress"
                ? "🔄 Take Over This Rescue (Overdue)"
                : "🙋 I'll Rescue This Animal"}
            </button>
          )}

          {showPickUp && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-heading font-bold text-base mb-3">
                {caseData.status === "in_progress" ? "Take Over This Case" : "Volunteer Details"}
              </h3>
              {caseData.status === "in_progress" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
                  ⚠ This case is overdue. The current volunteer ({volunteer?.name ?? "unknown"}) has not resolved it within the SLA. You can take it over.
                </div>
              )}
              <p className="text-sm text-gray-500 mb-4">Enter your details to pick up this rescue case.</p>
              {pickError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">{pickError}</p>}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Your Name *</label>
                  <input value={volName} onChange={(e) => setVolName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Your WhatsApp Number *</label>
                  <input value={volMobile} onChange={(e) => setVolMobile(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPickUp(false)}
                  className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">Cancel</button>
                <button onClick={handlePickUp} disabled={picking}
                  className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
                  {picking ? "Assigning…" : "Confirm — Pick Up Case"}
                </button>
              </div>
            </div>
          )}

          {/* Mark resolved (if in_progress) */}
          {caseData.status === "in_progress" && !showStatusUpdate && (
            <button onClick={() => { setShowStatusUpdate(true); setNewStatus("resolved"); }}
              className="w-full border-2 border-green-600 text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition">
              ✅ Mark as Resolved
            </button>
          )}

          {/* Reopen (if resolved) */}
          {caseData.status === "resolved" && !showStatusUpdate && (
            <button onClick={() => { setShowStatusUpdate(true); setNewStatus("open"); }}
              className="w-full border-2 border-red-500 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition">
              🔄 Reopen Case
            </button>
          )}

          {showStatusUpdate && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-heading font-bold text-base mb-3">
                {newStatus === "resolved" ? "✅ Resolve Case" : "🔄 Reopen Case"}
              </h3>
              <textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                rows={2} className="w-full border rounded-lg px-3 py-2.5 text-sm mb-3"
                placeholder={newStatus === "resolved" ? "How was the animal rescued? (optional)" : "Why is this being reopened? (optional)"} />
              <div className="flex gap-3">
                <button onClick={() => { setShowStatusUpdate(false); setNewStatus(""); setStatusNotes(""); }}
                  className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">Cancel</button>
                <button onClick={handleStatusUpdate} disabled={updating}
                  className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
                  {updating ? "Updating…" : newStatus === "resolved" ? "Confirm Resolved" : "Confirm Reopen"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
