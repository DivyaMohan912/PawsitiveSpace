import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const supabase = createAdminClient();

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // In production, send the temp password via email/WhatsApp
    return NextResponse.json({ success: true, userId: data.user.id, tempPassword });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
