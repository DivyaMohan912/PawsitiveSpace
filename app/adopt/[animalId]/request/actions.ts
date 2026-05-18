"use server";

import { createAdminClient } from "@/lib/supabase";
import { notifyFosterOfAdoptionRequest } from "@/lib/whatsapp";

export async function submitAdoptionRequest(data: {
  listingId: string;
  commitmentRef: string | null;
  name: string;
  mobile: string;
}) {
  const supabase = createAdminClient();

  try {
    // Check for existing active request
    const { data: existing } = await supabase
      .from("adoption_requests")
      .select("id")
      .eq("requester_mobile", data.mobile)
      .in("status", ["pending", "approved"])
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: "You already have an active adoption request. Each person can only have one active request at a time." };
    }

    // Resolve commitment UUID from reference string
    let commitmentUuid: string | null = null;
    if (data.commitmentRef) {
      const { data: commitment } = await supabase
        .from("adoption_commitments")
        .select("id")
        .eq("reference_id", data.commitmentRef)
        .single();
      commitmentUuid = commitment?.id ?? null;
    }

    const { error: insertErr } = await supabase.from("adoption_requests").insert({
      listing_id: data.listingId,
      commitment_id: commitmentUuid,
      requester_name: data.name,
      requester_mobile: data.mobile,
      status: "pending",
    });

    if (insertErr) {
      if (insertErr.message.includes("idx_one_active_request")) {
        return { success: false, error: "You already have an active adoption request." };
      }
      return { success: false, error: insertErr.message };
    }

    // Notify foster via WhatsApp (fire-and-forget)
    notifyFosterOfAdoptionRequest(data.listingId, data.name, data.mobile).catch((err) => {
      console.error("[Adoption Notify Error]", err);
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
