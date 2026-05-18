"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadHomeStats() {
  const supabase = createAdminClient();

  const [rescues, adoptions, tnr, fosters] = await Promise.all([
    supabase.from("rescue_cases").select("id", { count: "exact", head: true }),
    supabase.from("adoptions").select("id", { count: "exact", head: true }),
    supabase.from("tnr_records").select("id", { count: "exact", head: true }),
    supabase.from("volunteers").select("id", { count: "exact", head: true }).eq("role", "foster").eq("is_active", true),
  ]);

  return {
    rescued: rescues.count ?? 0,
    adopted: adoptions.count ?? 0,
    tnr: tnr.count ?? 0,
    fosters: fosters.count ?? 0,
  };
}
