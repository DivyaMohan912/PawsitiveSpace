import { NextResponse } from "next/server";

/**
 * DEPRECATED: the Twilio WhatsApp Business API inbound handler (auto-parsing
 * messages, AI intent detection, and auto-replies) has been removed. Users
 * now report animals through the web form at /report, and contact volunteers
 * via Click-to-Chat (wa.me) links. This endpoint only acknowledges any
 * lingering Twilio webhook so it won't retry — no API sends occur.
 */
export function POST() {
  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export function GET() {
  return NextResponse.json({ status: "deprecated", service: "pawsitivespace-whatsapp" });
}
