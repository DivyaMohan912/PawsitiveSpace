"use server";

import { createAdminClient } from "@/lib/supabase";
import { isEmail, phoneKey, toE164 } from "@/lib/phone";

// In-memory OTP store (for production, use Redis or DB)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Canonical key an OTP is stored/looked-up under. Emails are lower-cased;
 * phone numbers are reduced to their last 10 digits so that the code works
 * regardless of whether the user typed `+91` or not.
 */
function otpKey(identifier: string): string {
  return isEmail(identifier) ? identifier.trim().toLowerCase() : phoneKey(identifier);
}

/**
 * When no SMS/email provider is configured we can't actually deliver the code.
 * Outside production we surface it so local development is not blocked; in
 * production we fail with the original "not configured" error.
 */
function devFallback(code: string, channel: "email" | "whatsapp", error: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[OTP] ${channel} provider not configured — dev code: ${code}`);
    return { success: true, channel, devCode: code as string | undefined };
  }
  return { success: false, error, channel };
}

/**
 * Send a 6-digit OTP via Email or WhatsApp. Detects channel from the
 * identifier: anything with "@" is emailed (Resend), otherwise the code is
 * delivered over WhatsApp (Twilio).
 */
export async function sendOtp(identifier: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const channel: "email" | "whatsapp" = isEmail(identifier) ? "email" : "whatsapp";

  otpStore.set(otpKey(identifier), { code, expiresAt });

  try {
    if (channel === "email") {
      const key = process.env.RESEND_API_KEY;
      const from = process.env.OTP_EMAIL_FROM || "PawsitiveSpace <noreply@pawsitivespace.org>";
      if (!key) {
        console.error("[OTP] RESEND_API_KEY missing");
        return devFallback(code, channel, "Email service not configured.");
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
      const fromRaw = process.env.TWILIO_WHATSAPP_FROM;
      if (!sid || !token || !fromRaw) {
        console.error("[OTP] Twilio WhatsApp credentials missing");
        return devFallback(code, channel, "WhatsApp service not configured.");
      }
      // Twilio WhatsApp senders/recipients must be prefixed with `whatsapp:`.
      const from = fromRaw.startsWith("whatsapp:") ? fromRaw : `whatsapp:${fromRaw}`;
      const to = `whatsapp:${toE164(identifier)}`;
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
        console.error("[OTP WhatsApp Error]", await resp.json());
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
  const stored = otpStore.get(otpKey(identifier));

  if (!stored) {
    return { success: false, error: "OTP expired or not found. Request a new one." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(otpKey(identifier));
    return { success: false, error: "OTP has expired. Request a new one." };
  }

  if (stored.code !== code.trim()) {
    return { success: false, error: "Incorrect OTP. Please try again." };
  }

  otpStore.delete(otpKey(identifier));
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
  roles: string[];
  availability: string;
  reason: string;
  animals?: string[];
}) {
  const supabase = createAdminClient();

  const validRoles = ["rescuer", "foster", "transporter"];
  const interests = data.roles.filter((r) => validRoles.includes(r));
  if (interests.length === 0) interests.push("rescuer");
  const role = interests[0];

  // De-duplicate animal selections while preserving order.
  const animals = Array.from(new Set((data.animals ?? []).filter(Boolean)));

  // Insert into volunteers table
  const { error } = await supabase.from("volunteers").insert({
    name: data.name,
    whatsapp_number: data.mobile,
    area_coverage: data.location,
    role,
    interests,
    availability: data.availability || null,
    motivation: data.reason || null,
    can_rescue_animals: animals.length > 0 ? animals : null,
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
