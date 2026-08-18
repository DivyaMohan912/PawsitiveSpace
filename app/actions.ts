"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadHomeStats() {
  const supabase = createAdminClient();

  // The database still holds legacy demo/seed rows marked "adopted". To show an
  // accurate public number we start from a known-correct baseline of real
  // adoptions completed up to launch, then add every genuine adoption recorded
  // after the cutoff below (their auto-updated `updated_at` timestamp is used).
  const ADOPTION_BASELINE = 2;
  const ADOPTION_COUNT_SINCE = "2026-08-17T18:28:37Z";

  const [rescued, adoptedAnimals, adoptedListings, fosterRows] = await Promise.all([
    // Rescued = animals rescued (including those that later passed away),
    // adopted/fostered are shown separately
    supabase
      .from("animals")
      .select("id", { count: "exact", head: true })
      .in("status", ["rescued", "deceased"]),
    // Adopted (rescue/admin flow) = animals marked adopted after the cutoff
    supabase
      .from("animals")
      .select("id", { count: "exact", head: true })
      .eq("status", "adopted")
      .gte("updated_at", ADOPTION_COUNT_SINCE),
    // Adopted (foster listing flow) = listings marked adopted after the cutoff
    supabase
      .from("adoption_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "adopted")
      .gte("updated_at", ADOPTION_COUNT_SINCE),
    // Foster homes = distinct people who have posted adoption listings
    supabase.from("adoption_listings").select("foster_mobile"),
  ]);

  const fosterCount = new Set(
    (fosterRows.data ?? []).map((r: any) => r.foster_mobile).filter(Boolean)
  ).size;

  return {
    rescued: rescued.count ?? 0,
    adopted: ADOPTION_BASELINE + (adoptedAnimals.count ?? 0) + (adoptedListings.count ?? 0),
    fosters: fosterCount,
  };
}
