import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*");

    if (profileError) throw profileError;

    // Get all auth users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    return NextResponse.json({
      totalAuthUsers: users.length,
      totalProfiles: profiles?.length || 0,
      profiles: profiles?.map(p => ({
        id: p.id,
        full_name: p.full_name,
        subscription_status: p.subscription_status,
        subscription_plan: p.subscription_plan,
        charity_id: p.charity_id,
        created_at: p.created_at
      })) || [],
      authUsers: users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      }))
    });

  } catch (error) {
    console.error("Current status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
