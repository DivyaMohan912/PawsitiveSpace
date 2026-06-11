"use server";

import { createAdminClient } from "@/lib/supabase";

// In-memory OTP store (for production, use Redis or DB)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function sendOtp(mobile: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(mobile, { code, expiresAt });

  // Send OTP via WhatsApp (direct Twilio call)
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!sid || !token || !from) {
      console.error("[OTP] Twilio credentials missing");
      return { success: false, error: "WhatsApp service not configured." };
    }

    const toFormatted = mobile.startsWith("whatsapp:")
      ? mobile
      : `whatsapp:${mobile.startsWith("+") ? mobile : "+" + mobile}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: toFormatted,
        Body: `🐾 PawsitiveSpace Verification\n\nYour OTP is: *${code}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json();
      console.error("[OTP Twilio Error]", errData);
      return { success: false, error: "Failed to send OTP. Please try again." };
    }
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return { success: false, error: "Failed to send OTP. Please try again." };
  }

  return { success: true };
}

export async function verifyOtp(mobile: string, code: string) {
  const stored = otpStore.get(mobile);

  if (!stored) {
    return { success: false, error: "OTP expired or not found. Request a new one." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(mobile);
    return { success: false, error: "OTP has expired. Request a new one." };
  }

  if (stored.code !== code.trim()) {
    return { success: false, error: "Incorrect OTP. Please try again." };
  }

  otpStore.delete(mobile);
  return { success: true };
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email || null,
    mobile: data.mobile || null,
    subject: data.subject,
    message: data.message,
  });

  if (error) {
    // Table might not exist yet — log to WhatsApp as fallback
    console.error("[Contact Form Error]", error.message);
    try {
      const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.ADMIN_WHATSAPP || "+919988778877",
          message: `📩 New Contact Message\n\nFrom: ${data.name}\nMobile: ${data.mobile || "N/A"}\nEmail: ${data.email || "N/A"}\nSubject: ${data.subject}\n\n${data.message}`,
        }),
      });
    } catch {
      // silent
    }
  }

  return { success: true };
}

export async function registerVolunteer(data: {
  name: string;
  mobile: string;
  location: string;
  role: string;
  availability: string;
  reason: string;
}) {
  const supabase = createAdminClient();

  // Insert into volunteers table
  const { error } = await supabase.from("volunteers").insert({
    name: data.name,
    whatsapp_number: data.mobile,
    area_coverage: data.location,
    role: data.role === "foster" ? "foster" : "rescuer",
    is_active: true,
  });

  if (error) {
    // If duplicate, that's okay
    if (error.code === "23505") {
      return { success: false, error: "This mobile number is already registered as a volunteer." };
    }
    console.error("[Volunteer Register Error]", error.message);
    return { success: false, error: error.message };
  }

  // Notify admin via WhatsApp
  try {
    const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: process.env.ADMIN_WHATSAPP || "+919988778877",
        message: `🙋 New Volunteer Registration!\n\nName: ${data.name}\nMobile: ${data.mobile}\nLocation: ${data.location}\nRole: ${data.role}\nAvailability: ${data.availability}\nReason: ${data.reason}`,
      }),
    });
  } catch {
    // silent
  }

  return { success: true };
}
