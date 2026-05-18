"use server";

import { createAdminClient } from "@/lib/supabase";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

/**
 * Send a WhatsApp message via Twilio REST API.
 */
export async function sendWhatsApp(to: string, message: string) {
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to.startsWith("+") ? to : "+" + to}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: TWILIO_FROM, To: toFormatted, Body: message }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error(`[WhatsApp] Failed to ${to}:`, data);
      return { success: false, error: data.message };
    }
    console.log(`[WhatsApp] Sent to ${to}: ${data.sid}`);
    return { success: true, sid: data.sid };
  } catch (err: any) {
    console.error(`[WhatsApp] Error sending to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Notify the foster when someone submits an adoption request for their listing.
 */
export async function notifyFosterOfAdoptionRequest(
  listingId: string,
  requesterName: string,
  requesterPhone?: string,
  description?: string
) {
  const supabase = createAdminClient();
  const { data: listing } = await supabase
    .from("adoption_listings")
    .select("foster_name, foster_mobile, species, breed")
    .eq("id", listingId)
    .single();

  if (!listing?.foster_mobile) return;

  const animal = listing.breed ? `${listing.species} (${listing.breed})` : listing.species;
  const message =
    `🐾 *PawsitiveSpace — New Adoption Request*\n\n` +
    `Hi ${listing.foster_name}, someone is interested in adopting your ${animal}!\n\n` +
    `👤 Requester: *${requesterName}*\n` +
    (requesterPhone ? `📞 Phone: *${requesterPhone}*\n` : "") +
    (description ? `📝 Note: ${description}\n` : "") +
    `\nPlease check the app under Foster → Manage to review the request.`;

  await sendWhatsApp(listing.foster_mobile, message);
}

/**
 * Notify all active volunteers (rescuers) when a new rescue case is created.
 */
export async function notifyVolunteersOfNewRescue(
  caseId: string,
  location: string,
  description: string,
  urgency: string,
  reporterName?: string,
  reporterPhone?: string
) {
  const supabase = createAdminClient();
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("name, whatsapp_number")
    .eq("is_active", true)
    .in("role", ["rescuer", "admin"]);

  if (!volunteers?.length) return;

  const shortId = caseId.slice(0, 8).toUpperCase();
  const urgencyEmoji = urgency === "high" ? "🔴" : urgency === "medium" ? "🟡" : "🟢";
  const message =
    `🚨 *PawsitiveSpace — New Rescue Reported*\n\n` +
    `${urgencyEmoji} Urgency: *${urgency}*\n` +
    `📍 Location: *${location}*\n` +
    `📝 ${description}\n\n` +
    (reporterName ? `👤 Reporter: *${reporterName}*\n` : "") +
    (reporterPhone ? `📞 Contact: *${reporterPhone}*\n` : "") +
    `\nCase: ${shortId}\n` +
    `Please check the app and respond if you can help!`;

  await Promise.allSettled(
    volunteers.map((v) => sendWhatsApp(v.whatsapp_number, message))
  );
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

  if (!overdueRescues?.length) return { notified: 0, overdue: 0 };

  const { data: admins } = await supabase
    .from("volunteers")
    .select("name, whatsapp_number")
    .eq("role", "admin")
    .eq("is_active", true);

  if (!admins?.length) return { notified: 0, overdue: overdueRescues.length };

  const rescueList = overdueRescues
    .map((r: any) => {
      const loc = r.animals?.location_description || "Unknown";
      const days = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
      return `• ${loc} — ${days}d ago (${r.id.slice(0, 8).toUpperCase()})`;
    })
    .join("\n");

  const message =
    `⚠️ *PawsitiveSpace — Overdue Rescues*\n\n` +
    `${overdueRescues.length} case(s) are overdue (${overdueDays}+ days):\n\n` +
    `${rescueList}\n\n` +
    `Please take action or reassign these cases.`;

  const results = await Promise.allSettled(
    admins.map((a) => sendWhatsApp(a.whatsapp_number, message))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return { notified: sent, overdue: overdueRescues.length };
}
