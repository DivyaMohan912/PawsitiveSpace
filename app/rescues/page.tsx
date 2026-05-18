"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import { loadRescueCases } from "./actions";

interface RescueCase {
  id: string;
  status: string;
  case_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  animal: {
    id: string;
    name: string | null;
    species: string;
    breed: string | null;
    health_notes: string | null;
    photos: string[];
    location_description: string | null;
    location_lat: number | null;
    location_lng: number | null;
    status: string;
  };
}

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  open: { bg: "bg-red-100 text-red-700", label: "🔴 Open" },
  in_progress: { bg: "bg-yellow-100 text-yellow-700", label: "🟡 In Progress" },
  resolved: { bg: "bg-green-100 text-green-700", label: "🟢 Resolved" },
  closed: { bg: "bg-gray-100 text-gray-500", label: "⚪ Closed" },
};

function getUrgency(caseNotes: string | null): "high" | "medium" | "low" {
  if (!caseNotes) return "medium";
  const lower = caseNotes.toLowerCase();
  if (lower.includes("urgency: high")) return "high";
  if (lower.includes("urgency: low")) return "low";
  return "medium";
}

const SLA_DAYS: Record<string, number> = { high: 2, medium: 7, low: 30 };

function isOverdue(createdAt: string, caseNotes: string | null, status: string): boolean {
  if (status === "resolved" || status === "closed") return false;
  const urgency = getUrgency(caseNotes);
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > SLA_DAYS[urgency];
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractArea(location: string | null): string {
  if (!location) return "Unknown Location";
  // Remove GPS coordinates, trim, take first meaningful part
  const cleaned = location.replace(/\d+\.\d+,\s*\d+\.\d+/g, "").replace(/[—\-]\s*$/, "").trim();
  if (!cleaned) return "GPS Location";
  // Take first part before comma as the area name
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[0] || "Unknown Location";
}

export default function RescuesPage() {
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadRescueCases(statusFilter).then((data) => {
      setCases(data as unknown as RescueCase[]);
      setLoading(false);
    });
  }, [statusFilter]);

  function shareLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Compute distances & sort
  const casesWithDistance = useMemo(() => {
    return cases.map((c) => {
      let distance: number | null = null;
      if (sortByDistance && userCoords && c.animal?.location_lat && c.animal?.location_lng) {
        distance = getDistance(userCoords.lat, userCoords.lng, c.animal.location_lat, c.animal.location_lng);
      }
      return { ...c, distance };
    }).sort((a, b) => {
      if (sortByDistance && a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0; // keep original order
    });
  }, [cases, sortByDistance, userCoords]);

  // Group by location area
  const grouped = useMemo(() => {
    if (!groupByLocation) return null;
    const map = new Map<string, typeof casesWithDistance>();
    for (const c of casesWithDistance) {
      const area = extractArea(c.animal?.location_description);
      if (!map.has(area)) map.set(area, []);
      map.get(area)!.push(c);
    }
    // Sort groups: by distance of first item if available, else alphabetically
    return Array.from(map.entries()).sort((a, b) => {
      const da = a[1][0]?.distance;
      const db = b[1][0]?.distance;
      if (da !== null && db !== null && da !== undefined && db !== undefined) return da - db;
      return a[0].localeCompare(b[0]);
    });
  }, [casesWithDistance, groupByLocation]);

  function CaseCard({ c }: { c: (typeof casesWithDistance)[0] }) {
    const style = STATUS_STYLES[c.status] ?? STATUS_STYLES.open;
    const animal = c.animal;
    return (
      <Link href={`/rescues/${c.id}`} className="bg-white rounded-2xl p-6 hover:shadow-lg transition block">
        <div className="flex gap-5">
          <div className="shrink-0">
            {animal?.photos && animal.photos.length > 0 ? (
              <img src={animal.photos[0]} alt="" className="w-32 h-32 rounded-xl object-cover" />
            ) : (
              <AnimalAvatar species={animal?.species ?? "other"} size={128} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading font-bold text-base truncate">
                {animal?.name || `${animal?.species ?? "Animal"} rescue`}
                {animal?.breed && <span className="text-gray-400 font-normal text-sm"> · {animal.breed}</span>}
              </h3>
              <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg}`}>
                {style.label}
              </span>
            </div>
            {animal?.location_description && (
              <p className="text-xs text-gray-500 mt-1 truncate">📍 {animal.location_description}</p>
            )}
            {c.distance !== null && (
              <p className="text-xs text-brand-orange font-semibold mt-0.5">
                {c.distance < 1 ? `${Math.round(c.distance * 1000)}m away` : `${c.distance.toFixed(1)} km away`}
              </p>
            )}
            {animal?.health_notes && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{animal.health_notes}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <p className="text-[10px] text-gray-400">
                Reported {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-[10px] text-gray-400">
                Case #{c.id.slice(0, 8).toUpperCase()}
              </p>
              {(() => {
                const urgency = getUrgency(c.case_notes);
                const urgencyStyle = urgency === "high" ? "bg-red-100 text-red-700" : urgency === "low" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
                return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${urgencyStyle}`}>{urgency.toUpperCase()}</span>;
              })()}
              {isOverdue(c.created_at, c.case_notes, c.status) && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">⚠ OVERDUE</span>
              )}
            </div>
          </div>
        </div>
        {/* Photos strip */}
        {animal?.photos && animal.photos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {animal.photos.slice(1, 5).map((url, i) => (
              <img key={i} src={url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ))}
            {animal.photos.length > 5 && (
              <span className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">
                +{animal.photos.length - 5}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/rescues" />

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h1 className="font-heading text-3xl font-bold">Rescue Cases</h1>
          <Link href="/report" className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 transition">
            + Report Animal
          </Link>
        </div>
        <p className="text-gray-500 mb-6">Active rescue cases in Hyderabad. Volunteers can find nearby cases to assist.</p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "active", label: "Active" },
              { key: "open", label: "🔴 Open" },
              { key: "in_progress", label: "🟡 In Progress" },
              { key: "overdue", label: "⚠ Overdue" },
              { key: "resolved", label: "🟢 Resolved" },
              { key: "all", label: "All" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  statusFilter === s.key ? "bg-brand-orange text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Group by location */}
            <button
              onClick={() => setGroupByLocation(!groupByLocation)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                groupByLocation ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              📍 Group by Location
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-brand-orange animate-pulse">Loading rescue cases…</p>
          </div>
        )}

        {/* Results */}
        {!loading && casesWithDistance.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">🐾</p>
            <p className="text-gray-400 mb-3">No rescue cases found for this filter.</p>
            <Link href="/report" className="text-brand-orange font-bold hover:underline">Report an animal in need →</Link>
          </div>
        )}

        {!loading && casesWithDistance.length > 0 && !groupByLocation && (
          <div className="grid sm:grid-cols-2 gap-4">
            {casesWithDistance.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        )}

        {!loading && grouped && groupByLocation && (
          <div className="space-y-8">
            {grouped.map(([area, items]) => (
              <div key={area}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📍</span>
                  <h2 className="font-heading font-bold text-lg">{area}</h2>
                  <span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                  {items[0]?.distance !== null && items[0]?.distance !== undefined && (
                    <span className="text-xs text-brand-orange font-semibold">
                      ~{items[0].distance < 1 ? `${Math.round(items[0].distance * 1000)}m` : `${items[0].distance.toFixed(1)} km`}
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((c) => (
                    <CaseCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
