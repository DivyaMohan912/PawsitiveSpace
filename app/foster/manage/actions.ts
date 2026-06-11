"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadFosterData(mobile: string) {
  const supabase = createAdminClient();

  const { data: listings } = await supabase
    .from("adoption_listings")
    .select("*")
    .eq("foster_mobile", mobile)
    .order("created_at", { ascending: false });

  const listingIds = (listings ?? []).map((l: any) => l.id);
  let requests: any[] = [];
  if (listingIds.length > 0) {
    const { data } = await supabase
      .from("adoption_requests")
      .select("*, commitment:adoption_commitments!commitment_id(id, adoption_id)")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    // Fetch adoption reasons from adoptions table via commitment
    const enriched = [];
    for (const req of (data ?? [])) {
      let adoption_reason: string | null = null;
      const commitmentData = req.commitment as any;
      if (commitmentData?.adoption_id) {
        const { data: adoption } = await supabase
          .from("adoptions")
          .select("notes")
          .eq("id", commitmentData.adoption_id)
          .single();
        if (adoption?.notes) {
          const match = adoption.notes.match(/Reason for adoption:\s*([\s\S]+)/);
          adoption_reason = match ? match[1].trim() : null;
        }
      }
      enriched.push({ ...req, commitment: undefined, adoption_reason });
    }
    requests = enriched;
  }

  return { listings: listings ?? [], requests };
}

export async function completeAdoption(requestId: string, listingId: string) {
  const supabase = createAdminClient();
  await supabase.from("adoption_requests").update({ status: "completed" }).eq("id", requestId);
  await supabase.from("adoption_listings").update({ status: "adopted" }).eq("id", listingId);
  await supabase.from("adoption_requests").update({ status: "rejected" }).eq("listing_id", listingId).eq("status", "pending").neq("id", requestId);
  return { success: true };
}

export async function rejectRequest(requestId: string) {
  const supabase = createAdminClient();
  await supabase.from("adoption_requests").update({ status: "rejected" }).eq("id", requestId);
  return { success: true };
}

export async function closeListing(listingId: string) {
  const supabase = createAdminClient();
  await supabase.from("adoption_listings").update({ status: "closed" }).eq("id", listingId);
  await supabase.from("adoption_requests").update({ status: "rejected" }).eq("listing_id", listingId).eq("status", "pending");
  return { success: true };
}

export async function reopenListing(listingId: string) {
  const supabase = createAdminClient();
  await supabase.from("adoption_listings").update({ status: "open" }).eq("id", listingId);
  return { success: true };
}
