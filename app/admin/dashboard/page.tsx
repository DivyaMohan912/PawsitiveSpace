"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import StatusBadge from "@/components/admin/StatusBadge";
import MaskedPhone from "@/components/admin/MaskedPhone";

interface Metrics {
  openCases: number;
  inCare: number;
  pendingAdoptions: number;
  tnrThisMonth: number;
}

interface ActivityItem {
  id: string;
  type: "rescue" | "adoption";
  animal_name: string | null;
  reporter_phone: string | null;
  status: string;
  created_at: string;
}

interface UrgentCase {
  id: string;
  animal_id: string;
  species: string;
  location_description: string | null;
  case_notes: string | null;
  created_at: string;
}

export default function Dashboard() {
  const supabase = createBrowserClient();
  const [metrics, setMetrics] = useState<Metrics>({ openCases: 0, inCare: 0, pendingAdoptions: 0, tnrThisMonth: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [urgent, setUrgent] = useState<UrgentCase[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [openRes, careRes, adoptRes, tnrRes, casesRes, adoptionsRes, urgentRes] = await Promise.all([
      supabase.from("rescue_cases").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("animals").select("id", { count: "exact", head: true }).in("status", ["rescued", "fostered"]),
      supabase.from("adoptions").select("id", { count: "exact", head: true }).in("status", ["enquiry", "application"]),
      supabase.from("tnr_records").select("id", { count: "exact", head: true }).gte("neuter_date", monthStart),
      supabase.from("rescue_cases").select("id, status, created_at, animals(name), reporters(whatsapp_number)").order("created_at", { ascending: false }).limit(10),
      supabase.from("adoptions").select("id, status, created_at, animals(name), adopter_whatsapp").order("created_at", { ascending: false }).limit(10),
      supabase.from("rescue_cases").select("id, animal_id, case_notes, created_at, animals(species, location_description)").eq("status", "open").lt("created_at", dayAgo).order("created_at", { ascending: true }).limit(10),
    ]);

    setMetrics({
      openCases: openRes.count ?? 0,
      inCare: careRes.count ?? 0,
      pendingAdoptions: adoptRes.count ?? 0,
      tnrThisMonth: tnrRes.count ?? 0,
    });

    // Merge and sort activity
    const caseActivity: ActivityItem[] = (casesRes.data ?? []).map((c: any) => ({
      id: c.id,
      type: "rescue",
      animal_name: c.animals?.name ?? null,
      reporter_phone: c.reporters?.whatsapp_number ?? null,
      status: c.status,
      created_at: c.created_at,
    }));
    const adoptActivity: ActivityItem[] = (adoptionsRes.data ?? []).map((a: any) => ({
      id: a.id,
      type: "adoption",
      animal_name: a.animals?.name ?? null,
      reporter_phone: a.adopter_whatsapp,
      status: a.status,
      created_at: a.created_at,
    }));
    const merged = [...caseActivity, ...adoptActivity]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    setActivity(merged);

    setUrgent(
      (urgentRes.data ?? []).map((u: any) => ({
        id: u.id,
        animal_id: u.animal_id,
        species: u.animals?.species ?? "other",
        location_description: u.animals?.location_description ?? null,
        case_notes: u.case_notes,
        created_at: u.created_at,
      }))
    );
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const metricCards = [
    { label: "Open Cases", value: metrics.openCases, color: "text-red-500", bg: "bg-red-50" },
    { label: "Animals in Care", value: metrics.inCare, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Adoptions", value: metrics.pendingAdoptions, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "TNR This Month", value: metrics.tnrThisMonth, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((m) => (
          <div key={m.label} className={`${m.bg} rounded-2xl p-5`}>
            <p className={`text-3xl font-heading font-bold ${m.color}`}>{m.value}</p>
            <p className="text-sm font-semibold text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-heading font-bold text-lg mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="text-base">{a.type === "rescue" ? "🚨" : "🏠"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold">{a.id.slice(0, 8).toUpperCase()}</span>
                    {a.animal_name && <span className="text-gray-500"> · {a.animal_name}</span>}
                    {a.reporter_phone && (
                      <span className="ml-2"><MaskedPhone number={a.reporter_phone} /></span>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Cases */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            ⚠️ Urgent Cases
            <span className="text-xs font-normal text-gray-400">(open &gt; 24h)</span>
          </h2>
          {urgent.length === 0 ? (
            <p className="text-green-600 text-sm font-semibold">All clear — no overdue cases 🎉</p>
          ) : (
            <div className="space-y-3">
              {urgent.map((u) => (
                <div key={u.id} className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">{u.id.slice(0, 8).toUpperCase()}</span>
                    <StatusBadge status="open" />
                    <span className="text-xs text-gray-400">{timeAgo(u.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {u.species} · {u.location_description ?? "Location unknown"}
                  </p>
                  {u.case_notes && <p className="text-xs text-gray-500 mt-1 truncate">{u.case_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
