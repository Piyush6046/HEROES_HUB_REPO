import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== DEBUG: Draw Matching Analysis ===");

    // Get current month draw
    const monthYear = new Date().toISOString().slice(0, 7);
    const { data: currentDraw, error: drawError } = await supabaseAdmin
      .from("draws")
      .select("*")
      .eq("month_year", monthYear)
      .single();

    if (drawError) {
      return NextResponse.json({ error: "No draw found for current month", details: drawError });
    }

    console.log("Current Draw:", currentDraw);

    // Get all users
    const { data: users, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, subscription_status, subscription_plan");

    if (userError) {
      return NextResponse.json({ error: "Error fetching users", details: userError });
    }

    console.log("Users:", users?.length, "active:", users?.filter(u => u.subscription_status === 'active').length);

    // Get all scores
    const { data: allScores, error: scoreError } = await supabaseAdmin
      .from("scores")
      .select("user_id, score, date_played");

    if (scoreError) {
      return NextResponse.json({ error: "Error fetching scores", details: scoreError });
    }

    console.log("Total Scores:", allScores?.length);

    // Group scores by user
    const scoresByUser = {};
    allScores?.forEach(score => {
      const uid = String(score.user_id).trim().toLowerCase();
      if (!scoresByUser[uid]) scoresByUser[uid] = [];
      scoresByUser[uid].push(Number(score.score));
    });

    // Check each user for matches
    const winSet = new Set(currentDraw.winning_numbers);
    const matchingResults = [];

    users?.forEach(user => {
      const uId = String(user.id).trim().toLowerCase();
      const userScores = Array.from(new Set(scoresByUser[uId] || []));
      const matches = userScores.filter(s => winSet.has(s)).length;

      let tier = null;
      if (matches >= 5) tier = "5-Match";
      else if (matches === 4) tier = "4-Match";
      else if (matches === 3) tier = "3-Match";

      matchingResults.push({
        userId: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        userScores,
        matches,
        tier,
        isWinner: matches >= 3
      });

      console.log(`User ${user.email}:`, {
        userId: user.id,
        userScores,
        matches,
        tier,
        isWinner: matches >= 3
      });
    });

    // Check existing winners
    const { data: existingWinners } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("draw_id", currentDraw.id);

    console.log("Existing Winners:", existingWinners?.length);

    return NextResponse.json({
      draw: currentDraw,
      users: users?.length || 0,
      activeUsers: users?.filter(u => u.subscription_status === 'active').length || 0,
      totalScores: allScores?.length || 0,
      matchingResults,
      existingWinners: existingWinners?.length || 0,
      debug: {
        winningNumbers: currentDraw.winning_numbers,
        winSet: Array.from(winSet),
        scoresByUser: Object.keys(scoresByUser).length,
        matchingUsers: matchingResults.filter(r => r.isWinner).length
      }
    });

  } catch (error) {
    console.error("Draw matching debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
