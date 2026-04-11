import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_status, subscription_plan");

    if (profileError) throw profileError;

    console.log("Current profiles:", profiles);

    // Update all users that have 'premium' or null status to 'active'
    const updates = [];
    for (const profile of profiles || []) {
      if (profile.subscription_status === 'premium' || 
          profile.subscription_status === null || 
          profile.subscription_status === undefined) {
        
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: 'active',
            subscription_plan: profile.subscription_plan || 'monthly',
            updated_at: new Date().toISOString()
          })
          .eq("id", profile.id);

        if (!updateError) {
          updates.push({
            id: profile.id,
            oldStatus: profile.subscription_status,
            newStatus: 'active'
          });
        } else {
          console.error("Error updating profile", profile.id, updateError);
        }
      }
    }

    return NextResponse.json({ 
      message: `Updated ${updates.length} user subscriptions`,
      updated: updates
    });

  } catch (error) {
    console.error("Fix subscriptions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
