import { NextResponse } from "next/server";
import { notifyAdminsOfOverdueRescues } from "@/lib/whatsapp";

// Called by Vercel Cron daily — or manually via POST
export async function POST() {
  try {
    const result = await notifyAdminsOfOverdueRescues(3);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Overdue Cron Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Vercel Cron calls GET by default
export async function GET() {
  return POST();
}
