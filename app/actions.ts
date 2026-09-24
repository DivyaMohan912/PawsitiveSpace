"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadHomeStats() {
  const supabase = createAdminClient();

  // Public stats mirror the admin dashboard so the numbers always agree:
  //   Rescued  = rescue cases marked resolved or closed
  //   Adopted  = adoptions marked completed
  //   Volunteers = distinct mobile numbers in the volunteers table
  const [rescued, adopted, volunteerRows] = await Promise.all([
    supabase
      .from("rescue_cases")
      .select("id", { count: "exact", head: true })
      .in("status", ["resolved", "closed"]),
    supabase
      .from("adoptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("volunteers").select("whatsapp_number"),
  ]);

  const volunteerCount = new Set(
    (volunteerRows.data ?? []).map((r: any) => r.whatsapp_number).filter(Boolean)
  ).size;

  return {
    rescued: rescued.count ?? 0,
    adopted: adopted.count ?? 0,
    volunteers: volunteerCount,
  };
}
