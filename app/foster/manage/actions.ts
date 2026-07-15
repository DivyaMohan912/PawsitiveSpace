"use server";

import { createAdminClient } from "@/lib/supabase";
import { phonesMatch } from "@/lib/phone";

export async function loadFosterData(mobile: string) {
  const supabase = createAdminClient();

  // Match by normalised phone so listings saved with or without +91
  // (or with spaces/dashes) are all found.
  const { data: allListings } = await supabase
    .from("adoption_listings")
    .select("*")
    .order("created_at", { ascending: false });

  const listings = (allListings ?? []).filter((l: any) =>
    phonesMatch(l.foster_mobile ?? "", mobile)
  );

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

  // Community wishlist — open requests for animals not yet listed. Shown to all
  // fosters for awareness, independent of their own listings.
  const { data: wishes } = await supabase
    .from("adoption_wishes")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return { listings: listings ?? [], requests, wishes: wishes ?? [] };
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

export async function markWishFulfilled(wishId: string) {
  const supabase = createAdminClient();
  await supabase.from("adoption_wishes").update({ status: "fulfilled" }).eq("id", wishId);
  return { success: true };
}
