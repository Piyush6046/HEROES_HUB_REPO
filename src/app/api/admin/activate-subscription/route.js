import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(`Manually activating subscription for user: ${userId}`);

    // Simulate webhook payload
    const updateData = {
      subscription_status: "active",
      stripe_customer_id: "cus_test_" + Math.random().toString(36).substr(2, 9),
      stripe_subscription_id: "sub_test_" + Math.random().toString(36).substr(2, 9),
      updated_at: new Date().toISOString()
    };

    const { data: updatedUser, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the subscription event
    await supabaseAdmin
      .from("subscription_events")
      .insert({
        user_id: userId,
        event_type: "payment_succeeded",
        data: updateData,
        created_at: new Date().toISOString()
      });

    console.log("Subscription activated successfully:", updatedUser);

    return NextResponse.json({
      message: "Subscription activated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Manual activation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
