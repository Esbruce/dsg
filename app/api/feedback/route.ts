import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json().catch(() => ({}));

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
    }

    const payload = {
      name: typeof name === "string" && name.trim() ? name.trim().slice(0, 200) : undefined,
      email: typeof email === "string" && email.trim() ? email.trim().slice(0, 200) : undefined,
      message: message.trim().slice(0, 5000),
      at: new Date().toISOString(),
    };

    // Store in Supabase (service role bypasses RLS)
    const { error: dbError } = await supabaseAdmin
      .from("feedback")
      .insert({
        name: payload.name ?? null,
        email: payload.email ?? null,
        message: payload.message,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Failed to save feedback:", dbError);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // Optional: also log for visibility while setting up dashboards/alerts
    console.log("Feedback saved:", payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

