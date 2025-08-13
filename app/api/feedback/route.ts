import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captchaService } from "@/lib/auth/captcha";

export async function POST(request: Request) {
  try {
    // Enforce same-origin to mitigate CSRF from other sites
    const origin = request.headers.get("origin");
    const url = new URL(request.url);
    if (origin && origin !== url.origin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, message, captchaToken } = await request.json().catch(() => ({}));
    // Verify Cloudflare Turnstile if configured
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || undefined;
    const tokenFromHeader = request.headers.get("cf-turnstile-response");
    const token = captchaToken || tokenFromHeader;

    const captchaStatus = await captchaService.verifyToken(token ?? "", typeof ip === "string" ? ip : undefined);
    if (!captchaStatus.success) {
      return NextResponse.json({ error: captchaStatus.error || "CAPTCHA verification failed" }, { status: 400 });
    }


    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
    }

    const payload = {
      name: typeof name === "string" && name.trim() ? name.trim().slice(0, 200) : undefined,
      email: typeof email === "string" && email.trim() ? email.trim().slice(0, 200) : undefined,
      message: message.trim().slice(0, 5000),
      at: new Date().toISOString(),
    };

    // Store in Supabase using anon client (respects RLS anon insert-only)
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("feedback")
      .insert({
        name: payload.name ?? null,
        email: payload.email ?? null,
        message: payload.message,
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

