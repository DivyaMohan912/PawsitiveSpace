"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadRescueCases(statusFilter: string) {
  const supabase = createAdminClient();

  let q = supabase
    .from("rescue_cases")
    .select("id, status, case_notes, assigned_to, created_at, animal:animals(id, name, species, breed, health_notes, photos, location_description, location_lat, location_lng, status)")
    .order("created_at", { ascending: false });

  if (statusFilter === "active") {
    q = q.in("status", ["open", "in_progress"]);
  } else if (statusFilter === "overdue") {
    q = q.in("status", ["open", "in_progress"]);
  } else if (statusFilter !== "all") {
    q = q.eq("status", statusFilter);
  }

  const { data, error } = await q;

  // Client-side overdue filtering (needs case_notes for urgency parsing)
  if (statusFilter === "overdue" && data) {
    const SLA: Record<string, number> = { high: 2, medium: 7, low: 30 };
    return data.filter((c: any) => {
      const notes = (c.case_notes || "").toLowerCase();
      const urgency = notes.includes("urgency: high") ? "high" : notes.includes("urgency: low") ? "low" : "medium";
      const daysSince = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > SLA[urgency];
    });
  }
  if (error) {
    console.error("[loadRescueCases Error]", error);
    return [];
  }
  return data ?? [];
}
