"use server";

import { createAdminClient } from "@/lib/supabase";

export async function loadCaseDetail(caseId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("rescue_cases")
    .select(`
      id, status, case_notes, assigned_to, created_at, updated_at,
      animal:animals(id, name, species, breed, age_estimate, gender, sterilized, ear_tipped, health_notes, temperament_notes, location_description, location_lat, location_lng, photos, status),
      reporter:reporters!reported_by(id, name, whatsapp_number),
      volunteer:volunteers!assigned_to(id, name, whatsapp_number, area_coverage)
    `)
    .eq("id", caseId)
    .single();

  if (error) {
    console.error("[loadCaseDetail Error]", error);
    return null;
  }
  return data;
}

export async function pickUpCase(caseId: string, volunteerName: string, volunteerMobile: string) {
  const supabase = createAdminClient();

  try {
    // Upsert volunteer record
    const { data: vol, error: volErr } = await supabase
      .from("volunteers")
      .upsert(
        { name: volunteerName, whatsapp_number: volunteerMobile, role: "rescuer" },
        { onConflict: "whatsapp_number" }
      )
      .select("id")
      .single();

    if (volErr) throw volErr;

    // Assign case
    const { error: updateErr } = await supabase
      .from("rescue_cases")
      .update({ assigned_to: vol.id, status: "in_progress" })
      .eq("id", caseId);

    if (updateErr) throw updateErr;

    return { success: true };
  } catch (err: any) {
    console.error("[pickUpCase Error]", err);
    return { success: false, error: err.message };
  }
}

export async function updateCaseStatus(caseId: string, status: string, notes?: string) {
  const supabase = createAdminClient();

  try {
    const update: Record<string, unknown> = { status };
    if (notes) update.case_notes = notes;
    // Clear volunteer assignment when reopening
    if (status === "open") update.assigned_to = null;

    const { error } = await supabase
      .from("rescue_cases")
      .update(update)
      .eq("id", caseId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[updateCaseStatus Error]", err);
    return { success: false, error: err.message };
  }
}
