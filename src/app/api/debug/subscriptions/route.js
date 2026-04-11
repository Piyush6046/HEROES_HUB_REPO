import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all users with their subscription details
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, subscription_status, subscription_plan, stripe_customer_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (profileError) throw profileError;

    // Get all users from Auth to compare
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Calculate revenue metrics
    const activeUsers = profiles?.filter(p => p.subscription_status === 'active') || [];
    const monthlyUsers = activeUsers.filter(p => p.subscription_plan === 'monthly');
    const yearlyUsers = activeUsers.filter(p => p.subscription_plan === 'yearly');
    
    const monthlyRevenue = monthlyUsers.length * 9.99;
    const yearlyRevenue = yearlyUsers.length * (89/12); // Monthly equivalent
    const totalRevenue = monthlyRevenue + yearlyRevenue;
    const charityPool = totalRevenue * 0.15;

    return NextResponse.json({
      summary: {
        totalAuthUsers: users.length,
        totalProfiles: profiles?.length || 0,
        activeSubscribers: activeUsers.length,
        monthlySubscribers: monthlyUsers.length,
        yearlySubscribers: yearlyUsers.length,
        monthlyRevenue: `$${monthlyRevenue.toFixed(2)}`,
        yearlyRevenue: `$${yearlyRevenue.toFixed(2)}`,
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        charityPool: `$${charityPool.toFixed(2)}`
      },
      profiles: profiles || [],
      authUsers: users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        hasProfile: profiles?.some(p => p.id === u.id)
      }))
    });

  } catch (error) {
    console.error("Subscription debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
