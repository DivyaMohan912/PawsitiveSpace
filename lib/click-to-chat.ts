// Click-to-Chat utilities — no WhatsApp Business API / Twilio sends required.
// Generates wa.me links that open WhatsApp with a pre-filled message so the
// USER (admin/foster/reporter) taps to chat. Works with personal numbers,
// no Meta Business approval, no recurring API fees.

/** Org/public WhatsApp number shown to the public for click-to-chat. */
export const ORG_WHATSAPP =
  process.env.NEXT_PUBLIC_ORG_WHATSAPP || process.env.ADMIN_WHATSAPP || "+919346254625";

/** Strip everything except digits so wa.me accepts the number. */
export function digitsOnly(num?: string | null): string {
  return (num || "").replace(/[^0-9]/g, "");
}

/**
 * Build a click-to-chat link. Returns null when the phone is missing/invalid.
 */
export function buildWaLink(phone?: string | null, message = ""): string | null {
  const digits = digitsOnly(phone);
  if (digits.length < 10) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** Org-wide click-to-chat link (e.g. "Message us on WhatsApp"). */
export function orgWaLink(message = "Hi PawsitiveSpace! "): string {
  return buildWaLink(ORG_WHATSAPP, message)!;
}

/* --------------------------- Message templates --------------------------- */

export function adoptionRequestMessage(
  fosterName: string,
  animal: string,
  requesterName: string,
  requesterPhone?: string,
) {
  return (
    `🐾 PawsitiveSpace — Adoption Request\n\n` +
    `Hi ${fosterName}, ${requesterName} is interested in adopting your ${animal}.` +
    (requesterPhone ? `\nReach them at: ${requesterPhone}` : "") +
    `\n\nReview it under Foster → Manage.`
  );
}

export function newRescueMessage(
  shortId: string,
  location: string,
  description: string,
  urgency: string,
) {
  const emoji = urgency === "high" ? "🔴" : urgency === "medium" ? "🟡" : "🟢";
  return (
    `🚨 New Rescue ${shortId}\n${emoji} ${urgency}\n📍 ${location}\n📝 ${description}\n\nCan you help?`
  );
}

export function adoptionConfirmMessage(adopterName: string, animal: string, refId: string) {
  return (
    `🐾 PawsitiveSpace\nThanks ${adopterName}! Commitment signed for ${animal}. ` +
    `Ref: ${refId}. Tap send and our team will follow up.`
  );
}

/** Notify someone on the wishlist that a matching animal was just listed. */
export function matchingWishMessage(
  requesterName: string,
  animal: string,
  listingUrl: string,
) {
  return (
    `🐾 PawsitiveSpace — Good news!\n\n` +
    `Hi ${requesterName}, a ${animal} matching your adoption request was just listed. ` +
    `Take a look and reach out if you're interested:\n${listingUrl}`
  );
}
