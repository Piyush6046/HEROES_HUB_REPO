import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { userId, email, fullName, charityId, contribution = 15, planId = 'monthly' } = await req.json();

    // Validation
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields: userId, email" }, { status: 400 });
    }

    if (!['monthly', 'yearly'].includes(planId)) {
      return NextResponse.json({ error: "Invalid planId. Must be 'monthly' or 'yearly'" }, { status: 400 });
    }

    if (contribution < 10 || contribution > 50) {
      return NextResponse.json({ error: "Contribution must be between 10% and 50%" }, { status: 400 });
    }

    console.log(`Onboarding user: ${userId}, plan: ${planId}, charity: ${charityId}`);

    // 1. Create or update user profile
    const profileData = {
      id: userId,
      email: email,
      full_name: fullName || email.split("@")[0],
      charity_id: charityId,
      contribution_percentage: contribution,
      subscription_status: 'pending',
      subscription_plan: planId,
      role: 'user',
      xp_points: 0,
      current_rank: 'Rookie',
      rounds_played: 0,
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json({ error: "Failed to create user profile", details: profileError.message }, { status: 500 });
    }

    console.log("Profile created/updated:", profile);

    // 2. Create Stripe checkout session
    try {
      const priceId = planId === 'yearly'
        ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

      if (!priceId) {
        console.error("Missing Stripe price ID for plan:", planId);
        return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signup?checkout=cancel`,
        metadata: {
          userId,
          planId,
          charityId: charityId || '',
          contribution: contribution.toString()
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto'
      });

      console.log("Stripe session created:", session.id);

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        profile: profile
      });

    } catch (stripeError) {
      console.error("Stripe session creation error:", stripeError);
      return NextResponse.json({ error: "Failed to create payment session", details: stripeError.message }, { status: 500 });
    }

  } catch (error) {
    console.error("ONBOARDING API error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
