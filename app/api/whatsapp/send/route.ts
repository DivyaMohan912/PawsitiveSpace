import { NextResponse } from "next/server";

/**
 * DEPRECATED: programmatic WhatsApp sends (Twilio WhatsApp API) have been
 * removed. The app now uses Click-to-Chat (wa.me) links so volunteers/admins
 * tap to chat — no Business API approval or fees required. This endpoint
 * intentionally no longer sends messages.
 */
export async function POST() {
  return NextResponse.json(
    { error: "WhatsApp API sending is disabled. Use click-to-chat (wa.me) links instead." },
    { status: 410 },
  );
}
