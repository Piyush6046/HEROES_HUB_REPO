import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check the user's current status
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", "badodepiyush@gmail.com")
      .single();

    // Check subscription events
    const { data: events } = await supabaseAdmin
      .from("subscription_events")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    // Check if webhook endpoint exists
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/webhook`;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    return NextResponse.json({
      user,
      events,
      webhookConfig: {
        url: webhookUrl,
        hasSecret: !!webhookSecret,
        secretLength: webhookSecret?.length || 0
      },
      environment: {
        stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
