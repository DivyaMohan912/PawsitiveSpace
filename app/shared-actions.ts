"use server";

import { createAdminClient } from "@/lib/supabase";

// In-memory OTP store (for production, use Redis or DB)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function isEmail(id: string) {
  return /.+@.+\..+/.test(id);
}

/**
 * Send a 6-digit OTP via Email or SMS (no WhatsApp API). Detects channel from
 * the identifier: anything with "@" is emailed (Resend), otherwise SMS (Twilio).
 */
export async function sendOtp(identifier: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const channel: "email" | "sms" = isEmail(identifier) ? "email" : "sms";

  otpStore.set(identifier, { code, expiresAt });

  try {
    if (channel === "email") {
      const key = process.env.RESEND_API_KEY;
      const from = process.env.OTP_EMAIL_FROM || "PawsitiveSpace <noreply@pawsitivespace.org>";
      if (!key) {
        console.error("[OTP] RESEND_API_KEY missing");
        return { success: false, error: "Email service not configured.", channel };
      }
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [identifier],
          subject: "Your PawsitiveSpace verification code",
          text: `Your OTP is ${code}. It expires in 5 minutes. Do not share it with anyone.`,
        }),
      });
      if (!resp.ok) {
        console.error("[OTP Email Error]", await resp.text());
        return { success: false, error: "Failed to send OTP. Please try again.", channel };
      }
    } else {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_SMS_FROM;
      if (!sid || !token || !from) {
        console.error("[OTP] Twilio SMS credentials missing");
        return { success: false, error: "SMS service not configured.", channel };
      }
      const to = identifier.startsWith("+") ? identifier : `+${identifier}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: `PawsitiveSpace: your OTP is ${code} (valid 5 min). Do not share.`,
        }),
      });
      if (!resp.ok) {
        console.error("[OTP SMS Error]", await resp.json());
        return { success: false, error: "Failed to send OTP. Please try again.", channel };
      }
    }
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return { success: false, error: "Failed to send OTP. Please try again.", channel };
  }

  return { success: true, channel };
}

export async function verifyOtp(identifier: string, code: string) {
  const stored = otpStore.get(identifier);

  if (!stored) {
    return { success: false, error: "OTP expired or not found. Request a new one." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { success: false, error: "OTP has expired. Request a new one." };
  }

  if (stored.code !== code.trim()) {
    return { success: false, error: "Incorrect OTP. Please try again." };
  }

  otpStore.delete(identifier);
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
    // Table might not exist yet — log for admin review (no WhatsApp API send)
    console.error("[Contact Form Error]", error.message);
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

  // Admin reviews new volunteers in the dashboard (no WhatsApp API send).
  return { success: true };
}
