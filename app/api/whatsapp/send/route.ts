import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    if (!to || !message) return NextResponse.json({ error: "to and message required" }, { status: 400 });

    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_WHATSAPP_FROM!;

    const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to.startsWith("+") ? to : "+" + to}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: toFormatted, Body: message }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("[WhatsApp Send Error]", data);
      return NextResponse.json({ error: data.message || "Failed to send" }, { status: 400 });
    }

    return NextResponse.json({ success: true, sid: data.sid });
  } catch (err: any) {
    console.error("[WhatsApp Send Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
