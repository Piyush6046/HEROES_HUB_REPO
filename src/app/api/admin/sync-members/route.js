import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Fetch ALL users from Auth (Service Role)
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Fetch existing profiles (IDs only)
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id");
    const existingIds = new Set(profiles?.map(p => p.id) || []);

    const missingUsers = users.filter(u => !existingIds.has(u.id));

    if (missingUsers.length === 0) {
      return NextResponse.json({ message: "All user profiles are already in sync." });
    }

    // 3. Create missing profiles (No email column used)
    const newProfiles = missingUsers.map(u => ({
      id: u.id,
      full_name: u.user_metadata?.full_name || u.email.split("@")[0],
      subscription_status: 'active',
      subscription_plan: 'monthly', // Default to monthly, can be updated later
      role: u.email?.includes("admin") ? "admin" : "user"
    }));

    const { error: insertError } = await supabaseAdmin.from("profiles").insert(newProfiles);
    if (insertError) throw insertError;

    return NextResponse.json({
      message: `Successfully synchronized ${newProfiles.length} missing profiles.`,
      count: newProfiles.length
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
