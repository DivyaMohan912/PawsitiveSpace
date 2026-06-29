"use server";

import { createAdminClient } from "@/lib/supabase";
import {
  buildWaLink,
  adoptionRequestMessage,
  newRescueMessage,
} from "@/lib/click-to-chat";

/**
 * NOTE: WhatsApp Business API / Twilio programmatic sends have been removed.
 * These helpers now return click-to-chat (wa.me) links so a volunteer/admin
 * can tap to open WhatsApp with a pre-filled message — no API approval or
 * fees required. They return links (never throw) so callers keep their
 * fire-and-forget shape.
 */

/**
 * Build a click-to-chat link to notify the foster about a new adoption request.
 */
export async function notifyFosterOfAdoptionRequest(
  listingId: string,
  requesterName: string,
  requesterPhone?: string,
  _description?: string
) {
  const supabase = createAdminClient();
  const { data: listing } = await supabase
    .from("adoption_listings")
    .select("foster_name, foster_mobile, species, breed")
    .eq("id", listingId)
    .single();

  if (!listing?.foster_mobile) return { link: null as string | null };

  const animal = listing.breed ? `${listing.species} (${listing.breed})` : listing.species;
  const message = adoptionRequestMessage(listing.foster_name, animal, requesterName, requesterPhone);
  return { link: buildWaLink(listing.foster_mobile, message) };
}

/**
 * Notify all active volunteers (rescuers) when a new rescue case is created.
 */
export async function notifyVolunteersOfNewRescue(
  caseId: string,
  location: string,
  description: string,
  urgency: string,
  _reporterName?: string,
  _reporterPhone?: string
) {
  const supabase = createAdminClient();
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("name, whatsapp_number")
    .eq("is_active", true)
    .in("role", ["rescuer", "admin"]);

  if (!volunteers?.length) return { links: [] as { name: string; link: string | null }[] };

  const shortId = caseId.slice(0, 8).toUpperCase();
  const message = newRescueMessage(shortId, location, description, urgency);

  return {
    links: volunteers.map((v) => ({ name: v.name, link: buildWaLink(v.whatsapp_number, message) })),
  };
}

/**
 * Notify admins about overdue rescue cases (open/in_progress for > N days).
 */
export async function notifyAdminsOfOverdueRescues(overdueDays = 3) {
  const supabase = createAdminClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - overdueDays);

  const { data: overdueRescues } = await supabase
    .from("rescue_cases")
    .select("id, case_notes, created_at, animals(name, location_description)")
    .in("status", ["open", "in_progress"])
    .lt("created_at", cutoff.toISOString());

  if (!overdueRescues?.length) return { overdue: 0, links: [] as string[] };

  const { data: admins } = await supabase
    .from("volunteers")
    .select("name, whatsapp_number")
    .eq("role", "admin")
    .eq("is_active", true);

  if (!admins?.length) return { overdue: overdueRescues.length, links: [] };

  const rescueList = overdueRescues
    .map((r: any) => {
      const loc = r.animals?.location_description || "Unknown";
      const days = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
      return `• ${loc} — ${days}d ago (${r.id.slice(0, 8).toUpperCase()})`;
    })
    .join("\n");

  const message =
    `⚠️ PawsitiveSpace — ${overdueRescues.length} overdue rescue(s) (${overdueDays}+ days):\n\n${rescueList}`;

  const links = admins.map((a) => buildWaLink(a.whatsapp_number, message)).filter(Boolean) as string[];
  return { overdue: overdueRescues.length, links };
}
