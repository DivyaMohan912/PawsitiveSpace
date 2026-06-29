"use server";

import { createAdminClient } from "@/lib/supabase";
import { notifyFosterOfAdoptionRequest } from "@/lib/whatsapp";
import { buildWaLink, ORG_WHATSAPP, adoptionConfirmMessage } from "@/lib/click-to-chat";

interface CommitmentFormData {
  animalId: string;
  fullName: string;
  mobile: string;
  idType: string;
  idLast4: string;
  address: string;
  email: string;
  signatureName: string;
  ipAddress?: string;
  userAgent?: string;
  adoptionReason?: string;
}

function generateRefId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PWS-${year}-${num}`;
}

export async function submitAdoptionCommitment(data: CommitmentFormData) {
  const supabase = createAdminClient();

  try {
    const refId = generateRefId();
    const signedAt = new Date().toISOString();

    // 1. Try adoption_listings first (public adopt flow), fall back to animals table
    let animalName = "your new companion";
    let realAnimalId: string | null = null;

    const { data: listing } = await supabase
      .from("adoption_listings")
      .select("id, species, species_other, breed")
      .eq("id", data.animalId)
      .single();

    if (listing) {
      // animalId is a listing ID — create an animal record so the FK is satisfied
      animalName = listing.species === "other"
        ? listing.species_other || "Animal"
        : `${listing.breed ? listing.breed + " " : ""}${listing.species}`;

      const { data: newAnimal, error: animalInsErr } = await supabase
        .from("animals")
        .insert({
          species: listing.species === "other" ? (listing.species_other || "other") : listing.species,
          name: animalName,
          status: "adopted",
        })
        .select("id")
        .single();

      if (animalInsErr) throw new Error(`Animal record creation failed: ${animalInsErr.message}`);
      realAnimalId = newAnimal.id;
    } else {
      // animalId is already an animals table ID
      const { data: animal } = await supabase
        .from("animals")
        .select("name, species")
        .eq("id", data.animalId)
        .single();

      animalName = animal?.name || animal?.species || "your new companion";
      realAnimalId = data.animalId;
    }

    // 2. Insert adoption record (using real animals table ID)
    const { data: adoption, error: adoptErr } = await supabase
      .from("adoptions")
      .insert({
        animal_id: realAnimalId,
        adopter_name: data.fullName,
        adopter_whatsapp: data.mobile,
        adopter_email: data.email || null,
        adopter_address: data.address,
        status: "enquiry",
        notes: `Commitment form signed. Ref: ${refId}${listing ? `. Listing: ${data.animalId}` : ""}${data.adoptionReason ? `\n\nReason for adoption: ${data.adoptionReason}` : ""}`,
      })
      .select("id")
      .single();

    if (adoptErr) throw new Error(`Adoption insert failed: ${adoptErr.message}`);

    // 3. Insert commitment record
    const { data: commitment, error: commitErr } = await supabase
      .from("adoption_commitments")
      .insert({
        adoption_id: adoption.id,
        adopter_name: data.fullName,
        adopter_mobile: data.mobile,
        id_type: data.idType,
        id_last4: data.idLast4,
        signature_name: data.signatureName,
        signed_at: signedAt,
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null,
        form_version: "1.0",
        all_checkboxes_confirmed: true,
        reference_id: refId,
      })
      .select("id")
      .single();

    if (commitErr) throw new Error(`Commitment insert failed: ${commitErr.message}`);

    // 4. Schedule follow-ups
    const followups = [
      { followup_type: "1_week", days: 7 },
      { followup_type: "1_month", days: 30 },
      { followup_type: "3_month", days: 90 },
    ];

    const signedDate = new Date(signedAt);
    const followupRows = followups.map((f) => {
      const due = new Date(signedDate);
      due.setDate(due.getDate() + f.days);
      return {
        adoption_id: adoption.id,
        commitment_id: commitment.id,
        followup_type: f.followup_type,
        due_date: due.toISOString().split("T")[0],
        status: "pending",
      };
    });

    const { error: followupErr } = await supabase
      .from("adoption_followups")
      .insert(followupRows);

    if (followupErr) console.error("Followup insert failed:", followupErr.message);

    // 5. Auto-create adoption request for the foster (if this is a listing)
    if (listing) {
      const { error: reqErr } = await supabase.from("adoption_requests").insert({
        listing_id: data.animalId,
        commitment_id: commitment.id,
        requester_name: data.fullName,
        requester_mobile: data.mobile,
        status: "pending",
      });
      if (reqErr) console.error("Adoption request insert failed:", reqErr.message);
      else notifyFosterOfAdoptionRequest(data.animalId, data.fullName, data.mobile, data.adoptionReason).catch((e) => console.error("[Foster Notify Error]", e));
    }

    // 6. Build click-to-chat link for the adopter to message the org (no API send)
    const adopterLink = buildWaLink(
      ORG_WHATSAPP,
      adoptionConfirmMessage(data.fullName, animalName, refId),
    );

    return { success: true, referenceId: refId, animalName, chatLink: adopterLink };
  } catch (err: any) {
    console.error("[Commitment Submit Error]", err);
    return { success: false, error: err.message };
  }
}

export async function checkAndFlagAdopter(mobileNumber: string, complaintId?: string) {
  const supabase = createAdminClient();

  try {
    // 1. Find commitments by mobile
    const { data: commitments } = await supabase
      .from("adoption_commitments")
      .select("id, adoption_id, adopter_name")
      .eq("adopter_mobile", mobileNumber);

    if (!commitments || commitments.length === 0) return { flagged: false };

    // 2. Flag each linked adoption
    for (const c of commitments) {
      await supabase.from("flags").insert({
        entity_type: "adoption",
        entity_id: c.adoption_id,
        flag_type: "community_report",
        raised_by_type: "system",
        severity: "high",
        notes: `Adopter mobile ${mobileNumber} matched to abuse complaint${complaintId ? ` #${complaintId}` : ""}. Adopter: ${c.adopter_name}`,
      });

      await supabase
        .from("adoptions")
        .update({ status: "flagged" })
        .eq("id", c.adoption_id);
    }

    return { flagged: true, count: commitments.length };
  } catch (err: any) {
    console.error("[Flag Adopter Error]", err);
    return { flagged: false, error: err.message };
  }
}
