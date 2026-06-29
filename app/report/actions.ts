"use server";

import { createAdminClient } from "@/lib/supabase";
import { notifyVolunteersOfNewRescue } from "@/lib/whatsapp";

interface ReportData {
  species: string;
  location: string;
  description: string;
  urgency: string;
  reporter_name: string;
  reporter_whatsapp: string;
  photos: string[];
  lat: number | null;
  lng: number | null;
}

export async function submitReport(data: ReportData) {
  const supabase = createAdminClient();

  try {
    // Upsert reporter
    const { data: reporter, error: repErr } = await supabase
      .from("reporters")
      .upsert(
        { whatsapp_number: data.reporter_whatsapp, name: data.reporter_name },
        { onConflict: "whatsapp_number" }
      )
      .select("id")
      .single();
    if (repErr) throw repErr;

    // Create animal
    const { data: animal, error: animalErr } = await supabase
      .from("animals")
      .insert({
        species: data.species,
        location_description: data.location,
        location_lat: data.lat,
        location_lng: data.lng,
        health_notes: data.description,
        photos: data.photos.length > 0 ? data.photos : [],
        reported_by: reporter.id,
      })
      .select("id")
      .single();
    if (animalErr) throw animalErr;

    // Create case
    const { data: rescue, error: caseErr } = await supabase
      .from("rescue_cases")
      .insert({
        animal_id: animal.id,
        reported_by: reporter.id,
        case_notes: `Urgency: ${data.urgency}. ${data.description}`,
      })
      .select("id")
      .single();
    if (caseErr) throw caseErr;

    // Build volunteer click-to-chat links (fire-and-forget; no API send)
    notifyVolunteersOfNewRescue(
      rescue.id,
      data.location,
      data.description,
      data.urgency,
      data.reporter_name,
      data.reporter_whatsapp
    ).catch(() => {});

    return { success: true, caseId: rescue.id.slice(0, 8).toUpperCase() };
  } catch (err: any) {
    console.error("[Report Submit Error]", err);
    return { success: false, error: err.message || "Something went wrong" };
  }
}
