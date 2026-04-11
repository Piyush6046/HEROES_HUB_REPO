import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get current month draw
    const monthYear = new Date().toISOString().slice(0, 7);
    const { data: currentDraw, error: drawErr } = await supabaseAdmin
      .from("draws")
      .select("*")
      .eq("month_year", monthYear)
      .single();

    if (drawErr) {
      return NextResponse.json({ error: "No draw found for current month", details: drawErr });
    }

    // Get all users and their subscription plans
    const { data: users, error: userErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, subscription_status, subscription_plan");

    // Get all scores
    const { data: scores, error: scoreErr } = await supabaseAdmin
      .from("scores")
      .select("user_id, score, date");

    // Get all winners for this draw
    const { data: winners, error: winnerErr } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("draw_id", currentDraw.id);

    // Calculate expected prize pool
    const monthlyUsers = users?.filter(u => u.subscription_plan === 'monthly').length || 0;
    const yearlyUsers = users?.filter(u => u.subscription_plan === 'yearly').length || 0;
    const expectedGrossPool = (monthlyUsers * 9.99) + (yearlyUsers * (89/12));
    const expectedTierPools = {
      "5-Match": expectedGrossPool * 0.40,
      "4-Match": expectedGrossPool * 0.35,
      "3-Match": expectedGrossPool * 0.25
    };

    // Simulate winner detection
    const winSet = new Set(currentDraw.winning_numbers);
    const scoresByUser = (scores || []).reduce((acc, s) => {
      const uid = String(s.user_id).trim().toLowerCase();
      if (!acc[uid]) acc[uid] = [];
      acc[uid].push(Number(s.score));
      return acc;
    }, {});

    const simulatedWinners = [];
    users?.forEach(u => {
      const uId = String(u.id).trim().toLowerCase();
      const userScores = Array.from(new Set(scoresByUser[uId] || []));
      const matches = userScores.filter(s => winSet.has(s)).length;

      let tier = null;
      if (matches >= 5) tier = "5-Match";
      else if (matches === 4) tier = "4-Match";
      else if (matches === 3) tier = "3-Match";

      if (tier) {
        simulatedWinners.push({ 
          userId: u.id, 
          email: u.email,
          tier, 
          matches, 
          userScores,
          expectedPrize: expectedTierPools[tier] / simulatedWinners.filter(w => w.tier === tier).length || 0
        });
      }
    });

    return NextResponse.json({
      draw: currentDraw,
      prizePoolCalculation: {
        monthlyUsers,
        yearlyUsers,
        expectedGrossPool,
        expectedTierPools,
        actualPool: currentDraw.prize_pool_5match + currentDraw.prize_pool_4match + currentDraw.prize_pool_3match
      },
      winners: {
        actual: winners,
        simulated: simulatedWinners,
        actualCount: winners?.length || 0,
        simulatedCount: simulatedWinners.length
      },
      debug: {
        totalUsers: users?.length || 0,
        totalScores: scores?.length || 0,
        winningNumbers: currentDraw.winning_numbers
      }
    });

  } catch (error) {
    console.error("Prize check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
