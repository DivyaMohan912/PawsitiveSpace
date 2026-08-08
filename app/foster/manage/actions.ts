"use server";

import { createAdminClient } from "@/lib/supabase";
import { phonesMatch, isEmail } from "@/lib/phone";
import { sendOtp, verifyOtp } from "@/app/shared-actions";

/**
 * Return the foster's listings that match a mobile number (normalised so +91,
 * spaces and dashes all resolve to the same person).
 */
async function listingsForMobile(mobile: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("adoption_listings")
    .select("id, foster_mobile, foster_email");
  return (data ?? []).filter((l: any) => phonesMatch(l.foster_mobile ?? "", mobile));
}

/**
 * Send a login code by EMAIL for a foster, bound to their mobile number.
 * If an email is already on file for that number, the entered email must match
 * it. On the very first email login (no email on file yet) any valid email is
 * accepted and gets linked to the number on successful verification.
 */
export async function sendFosterEmailOtp(mobile: string, email: string) {
  const entered = (email ?? "").trim().toLowerCase();
  if (!isEmail(entered)) return { success: false, error: "Enter a valid email address." };

  const mine = await listingsForMobile(mobile);
  if (mine.length === 0) {
    return { success: false, error: "No listings found for this mobile number." };
  }

  const stored = mine.map((l: any) => l.foster_email).find(Boolean) as string | undefined;
  if (stored && stored.trim().toLowerCase() !== entered) {
    return { success: false, error: "This email isn't linked to that number. Use your registered email, or receive the code on WhatsApp." };
  }

  return await sendOtp(entered);
}

/**
 * Verify a foster's emailed login code. On the first successful email login the
 * email is linked to all of that foster's listings so future logins are bound.
 */
export async function verifyFosterEmailOtp(mobile: string, email: string, code: string) {
  const entered = (email ?? "").trim().toLowerCase();
  const res = await verifyOtp(entered, code);
  if (!res.success) return res;

  const mine = await listingsForMobile(mobile);
  const idsToBind = mine.filter((l: any) => !l.foster_email).map((l: any) => l.id);
  if (idsToBind.length > 0) {
    const supabase = createAdminClient();
    await supabase.from("adoption_listings").update({ foster_email: entered }).in("id", idsToBind);
  }
  return { success: true };
}

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
