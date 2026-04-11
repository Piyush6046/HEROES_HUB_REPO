import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== COMPLETE SYSTEM TEST ===");

    const results = {};

    // 1. Test User Registration
    const { data: users, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    results.users = {
      count: users?.length || 0,
      active: users?.filter(u => u.subscription_status === 'active').length || 0,
      latest: users?.[0] || null,
      error: userError?.message
    };

    // 2. Test Scores
    const { data: scores, error: scoreError } = await supabaseAdmin
      .from("scores")
      .select("*")
      .order("date_played", { ascending: false });

    results.scores = {
      count: scores?.length || 0,
      error: scoreError?.message,
      latest: scores?.slice(0, 5).map(s => ({ user_id: s.user_id, score: s.score, date: s.date_played }))
    };

    // 3. Test Draws
    const { data: draws, error: drawError } = await supabaseAdmin
      .from("draws")
      .select("*")
      .order("month_year", { ascending: false });

    results.draws = {
      count: draws?.length || 0,
      latest: draws?.[0] || null,
      error: drawError?.message
    };

    // 4. Test Winners
    const { data: winners, error: winnerError } = await supabaseAdmin
      .from("winners")
      .select("*, draws(month_year), profiles(*)")
      .order("created_at", { ascending: false });

    results.winners = {
      count: winners?.length || 0,
      pending: winners?.filter(w => w.payout_status === 'pending').length || 0,
      paid: winners?.filter(w => w.payout_status === 'paid').length || 0,
      error: winnerError?.message
    };

    // 5. Test Revenue Calculation
    const activeUsers = users?.filter(u => u.subscription_status === 'active') || [];
    const monthlyUsers = activeUsers.filter(u => u.subscription_plan === 'monthly').length;
    const yearlyUsers = activeUsers.filter(u => u.subscription_plan === 'yearly').length;
    const expectedRevenue = (monthlyUsers * 9.99) + (yearlyUsers * (89/12));
    const expectedCharityPool = expectedRevenue * 0.15;

    results.revenue = {
      activeUsers: activeUsers.length,
      monthlyUsers,
      yearlyUsers,
      expectedRevenue,
      expectedCharityPool,
      totalUsers: users?.length || 0
    };

    // 6. Test Score Matching Logic
    if (draws?.length > 0 && scores?.length > 0) {
      const latestDraw = draws[0];
      const winSet = new Set(latestDraw.winning_numbers);
      
      // Get user scores for the latest user
      const latestUser = users[0];
      const userScores = scores?.filter(s => s.user_id === latestUser.id).slice(0, 5).map(s => s.score);
      const matches = userScores.filter(s => winSet.has(s)).length;
      
      results.scoreMatching = {
        drawNumbers: latestDraw.winning_numbers,
        userScores,
        matches,
        userTier: matches >= 5 ? "5-Match" : matches >= 4 ? "4-Match" : matches >= 3 ? "3-Match" : null
      };
    }

    return NextResponse.json({
      status: "success",
      results,
      summary: {
        systemHealth: Object.values(results).every(r => !r.error),
        totalTests: 6,
        passedTests: Object.values(results).filter(r => !r.error).length,
        recommendations: getRecommendations(results)
      }
    });

  } catch (error) {
    console.error("Complete system test error:", error);
    return NextResponse.json({ 
      status: "error", 
      error: error.message,
      results: null 
    }, { status: 500 });
  }
}

function getRecommendations(results) {
  const recommendations = [];

  if (results.users?.active === 0) {
    recommendations.push("No active users found. Activate subscriptions to test revenue calculations.");
  }

  if (results.scores?.count === 0) {
    recommendations.push("No scores found. Add test scores to test draw matching.");
  }

  if (results.draws?.count === 0) {
    recommendations.push("No draws found. Publish a draw to test winner detection.");
  }

  if (results.winners?.pending > 0) {
    recommendations.push(`${results.winners.pending} winners pending payout. Test payout process.`);
  }

  if (results.revenue?.expectedRevenue === 0) {
    recommendations.push("Revenue calculation shows $0. Activate users with proper plans.");
  }

  return recommendations;
}
