import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// ---------- lazy-initialized clients (avoids build-time env errors) ----------

let _supabase: SupabaseClient;
function db() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

let _anthropic: Anthropic;
function ai() {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

// ---------- types ----------

interface ParsedIntent {
  intent: "REPORT_ANIMAL" | "ADOPTION_ENQUIRY" | "STATUS_CHECK" | "UNKNOWN";
  species?: string;
  location?: string;
  description?: string;
  urgency?: "high" | "medium" | "low";
}

// ---------- helpers ----------

async function parseIntent(message: string): Promise<ParsedIntent> {
  // Fallback if no Anthropic API key — use simple keyword matching
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackParse(message);
  }

  try {
    const resp = await ai().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `You are an assistant for an animal rescue NGO in Hyderabad, India.
Parse the following WhatsApp message and return JSON only.
Identify intent as one of: REPORT_ANIMAL | ADOPTION_ENQUIRY | STATUS_CHECK | UNKNOWN
Also extract any relevant fields: species, location, description, urgency (high/medium/low).
Message: ${message}
Return format: { "intent": "...", "species": "...", "location": "...", "description": "...", "urgency": "..." }`,
      },
    ],
  });

  const text = resp.content[0].type === "text" ? resp.content[0].text : "{}";

  try {
    return JSON.parse(text) as ParsedIntent;
  } catch {
    return { intent: "UNKNOWN" };
  }
  } catch {
    return fallbackParse(message);
  }
}

function fallbackParse(message: string): ParsedIntent {
  const msg = message.toLowerCase();
  if (msg.includes("adopt") || msg.includes("want a") || msg.includes("looking for")) {
    const species = msg.includes("cat") ? "cat" : msg.includes("dog") ? "dog" : undefined;
    return { intent: "ADOPTION_ENQUIRY", species, description: message };
  }
  if (msg.includes("status") || msg.includes("update") || msg.includes("check")) {
    return { intent: "STATUS_CHECK", description: message };
  }
  // Default: treat as animal report
  const species = msg.includes("cat") ? "cat" : msg.includes("dog") ? "dog" : undefined;
  const urgency = msg.includes("injur") || msg.includes("bleed") || msg.includes("hit") ? "high" : "medium";
  return { intent: "REPORT_ANIMAL", species, description: message, urgency, location: undefined };
}

async function upsertReporter(whatsappNumber: string) {
  const { data, error } = await db()
    .from("reporters")
    .upsert(
      { whatsapp_number: whatsappNumber },
      { onConflict: "whatsapp_number" }
    )
    .select("id, total_reports")
    .single();

  if (error) throw error;
  return data;
}

async function incrementReports(reporterId: string, current: number) {
  await db()
    .from("reporters")
    .update({ total_reports: current + 1 })
    .eq("id", reporterId);
}

async function sendWhatsApp(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_WHATSAPP_FROM!;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }),
  });
}

const HELP_MENU = `🐾 *PawsitiveSpace — Hyderabad Animal Rescue*

Here's what I can help with:

1️⃣ *Report an animal* — Send a message describing what you see:
   • Species (dog/cat), condition, and location
   • 📸 Attach photos for quick identification
   • 📍 Share your live location pin
   
2️⃣ *Adoption enquiry* — Tell me what kind of pet you'd like to adopt

3️⃣ *Check status* — Reply "status" to track your latest case

💡 *Example:* "Injured dog near Jubilee Hills Check Post, limping on right leg" + attach a photo + share location

Just send a message and I'll handle the rest!`;

// ---------- POST handler ----------

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = (formData.get("From") as string) ?? "";
    const body = (formData.get("Body") as string) ?? "";
    const latitude = formData.get("Latitude") as string | null;
    const longitude = formData.get("Longitude") as string | null;
    const numMedia = parseInt((formData.get("NumMedia") as string) ?? "0", 10);

    // Collect media URLs (Twilio sends MediaUrl0, MediaUrl1, etc.)
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string | null;
      if (url) mediaUrls.push(url);
    }

    if (!from) {
      return twimlEmpty();
    }

    // Handle location-only messages (no body text)
    const messageText = body || (latitude && longitude ? `Location shared: ${latitude}, ${longitude}` : "");
    if (!messageText && mediaUrls.length === 0) {
      return twimlEmpty();
    }

    const whatsappNumber = from.replace("whatsapp:", "");
    const reporter = await upsertReporter(whatsappNumber);
    const parsed = await parseIntent(messageText);

    // If location was shared via WhatsApp location pin, use it
    if (latitude && longitude) {
      parsed.location = parsed.location
        ? `${parsed.location} (GPS: ${latitude}, ${longitude})`
        : `${latitude}, ${longitude}`;
    }

    // Log to whatsapp_logs table
    const { data: logRow } = await db()
      .from("whatsapp_logs")
      .insert({
        from_number: whatsappNumber,
        message_body: messageText,
        parsed_intent: parsed.intent,
        parsed_data: { ...parsed, media_count: mediaUrls.length, has_location: !!(latitude && longitude) },
      })
      .select("id")
      .single();

    switch (parsed.intent) {
      case "REPORT_ANIMAL": {
        const species =
          parsed.species && ["cat", "dog"].includes(parsed.species.toLowerCase())
            ? parsed.species.toLowerCase()
            : "other";

        // Download and re-upload media to Supabase Storage for persistence
        const photoUrls: string[] = [];
        for (const mediaUrl of mediaUrls) {
          try {
            const sid = process.env.TWILIO_ACCOUNT_SID!;
            const token = process.env.TWILIO_AUTH_TOKEN!;
            const authHeader = Buffer.from(`${sid}:${token}`).toString("base64");

            const mediaResp = await fetch(mediaUrl, {
              headers: { Authorization: `Basic ${authHeader}` },
            });
            if (!mediaResp.ok) continue;

            const contentType = mediaResp.headers.get("content-type") ?? "image/jpeg";
            const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
            const buffer = await mediaResp.arrayBuffer();
            const path = `whatsapp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: upErr } = await db().storage
              .from("photos")
              .upload(path, Buffer.from(buffer), { contentType, upsert: true });

            if (!upErr) {
              const { data: pubUrl } = db().storage.from("photos").getPublicUrl(path);
              photoUrls.push(pubUrl.publicUrl);
            }
          } catch (e) {
            console.error("[WhatsApp Media Download Error]", e);
          }
        }

        // Parse GPS coordinates if available
        const locLat = latitude ? parseFloat(latitude) : null;
        const locLng = longitude ? parseFloat(longitude) : null;

        const { data: animal, error: animalErr } = await db()
          .from("animals")
          .insert({
            species,
            location_description: parsed.location ?? null,
            location_lat: locLat,
            location_lng: locLng,
            health_notes: parsed.description ?? null,
            photos: photoUrls.length > 0 ? photoUrls : [],
            reported_by: reporter.id,
          })
          .select("id")
          .single();

        if (animalErr) throw animalErr;

        const { data: rescue, error: rescueErr } = await db()
          .from("rescue_cases")
          .insert({
            animal_id: animal.id,
            reported_by: reporter.id,
            case_notes: `Urgency: ${parsed.urgency ?? "unknown"}. ${parsed.description ?? ""}`.trim(),
          })
          .select("id")
          .single();

        if (rescueErr) throw rescueErr;

        await incrementReports(reporter.id, reporter.total_reports ?? 0);

        // Link log to case
        if (logRow?.id) {
          await db().from("whatsapp_logs").update({ linked_case_id: rescue.id }).eq("id", logRow.id);
        }

        // Build confirmation with what was captured
        const captured: string[] = [];
        if (species !== "other") captured.push(`🐾 Species: ${species}`);
        if (parsed.location) captured.push(`📍 Location: ${parsed.location}`);
        if (photoUrls.length > 0) captured.push(`📸 Photos: ${photoUrls.length} received`);
        if (parsed.description) captured.push(`📝 Description noted`);
        const capturedStr = captured.length > 0 ? `\n\n*Captured:*\n${captured.join("\n")}` : "";

        await sendWhatsApp(
          from,
          `✅ Thank you for reporting! Your case ID is:\n*${rescue.id.slice(0, 8).toUpperCase()}*${capturedStr}\n\nOur rescue team will respond shortly. Reply "status" anytime to check progress.`
        );
        break;
      }

      case "ADOPTION_ENQUIRY": {
        let animalId: string | null = null;

        if (parsed.species) {
          const { data: match } = await db()
            .from("animals")
            .select("id")
            .eq("species", parsed.species.toLowerCase())
            .in("status", ["rescued", "fostered"])
            .limit(1)
            .single();

          if (match) animalId = match.id;
        }

        if (!animalId) {
          const { data: placeholder } = await db()
            .from("animals")
            .insert({ species: parsed.species?.toLowerCase() ?? "other", status: "rescued" })
            .select("id")
            .single();
          animalId = placeholder!.id;
        }

        const { data: adoption, error: adoptErr } = await db()
          .from("adoptions")
          .insert({
            animal_id: animalId,
            adopter_name: whatsappNumber,
            adopter_whatsapp: whatsappNumber,
            notes: parsed.description ?? body,
          })
          .select("id")
          .single();

        if (adoptErr) throw adoptErr;

        await sendWhatsApp(
          from,
          `🏠 Adoption enquiry received! Reference: *${adoption.id.slice(0, 8).toUpperCase()}*\n\nA volunteer will reach out to you soon with available animals matching your request.`
        );
        break;
      }

      case "STATUS_CHECK": {
        // Check if message contains a case ID (e.g., "status 1FB4282F" or "status 1fb4282f-ce52-...")
        const statusMsg = (body ?? "").trim();
        const caseIdMatch = statusMsg.match(/status\s+([a-f0-9-]{8,})/i);

        if (caseIdMatch) {
          // Look up specific case by ID (partial or full UUID)
          const searchId = caseIdMatch[1].toLowerCase();
          const { data: allCases } = await db()
            .from("rescue_cases")
            .select("id, status, created_at, updated_at, case_notes, animals(name, species, location_description)")
            .order("created_at", { ascending: false });

          const match = allCases?.find((c: any) => c.id.toLowerCase().startsWith(searchId) || c.id.toLowerCase() === searchId);

          if (match) {
            const animal = (match as any).animals;
            const statusEmoji: Record<string, string> = { open: "🟡", in_progress: "🔵", resolved: "🟢", closed: "⚪" };
            const emoji = statusEmoji[match.status] || "⚪";
            await sendWhatsApp(
              from,
              `📋 *Rescue Case Status*\n\n` +
              `Case: *${match.id.slice(0, 8).toUpperCase()}*\n` +
              `${emoji} Status: *${match.status.replace("_", " ").toUpperCase()}*\n` +
              (animal?.species ? `🐾 Species: ${animal.species}\n` : "") +
              (animal?.location_description ? `📍 Location: ${animal.location_description}\n` : "") +
              `📅 Reported: ${new Date(match.created_at).toLocaleDateString()}\n` +
              `🔄 Last Updated: ${new Date(match.updated_at).toLocaleDateString()}\n` +
              (match.case_notes ? `📝 Notes: ${match.case_notes}` : "")
            );
          } else {
            await sendWhatsApp(
              from,
              `❌ No case found matching *${searchId.toUpperCase()}*.\n\nPlease double-check the case ID and try again.\nExample: status 1FB4282F`
            );
          }
        } else {
          // No case ID provided — show the reporter's latest case
          const { data: cases } = await db()
            .from("rescue_cases")
            .select("id, status, created_at, case_notes")
            .eq("reported_by", reporter.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (cases) {
            await sendWhatsApp(
              from,
              `📋 Your latest case *${cases.id.slice(0, 8).toUpperCase()}*:\n\nStatus: *${cases.status}*\nNotes: ${cases.case_notes ?? "No updates yet"}\nReported: ${new Date(cases.created_at).toLocaleDateString()}\n\n💡 Tip: Send *status <CaseID>* to check any specific case.`
            );
          } else {
            await sendWhatsApp(
              from,
              `ℹ️ No cases found for your number.\n\n💡 Tip: Send *status <CaseID>* to check a specific case by its ID.`
            );
          }
        }
        break;
      }

      default: {
        await sendWhatsApp(from, HELP_MENU);
      }
    }

    return twimlEmpty();
  } catch (err) {
    console.error("[WhatsApp Webhook Error]", err);
    // ALWAYS return 200 so Twilio doesn't retry and create duplicates
    return twimlEmpty();
  }
}

// Twilio expects a TwiML response or empty 200
function twimlEmpty() {
  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "pawsitivespace-whatsapp" });
}
