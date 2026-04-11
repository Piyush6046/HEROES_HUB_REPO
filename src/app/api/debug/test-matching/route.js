import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, testScores, testWinningNumbers } = await req.json();
    
    // If test data provided, use it; otherwise use real data
    let userScores, winningNumbers;
    
    if (testScores && testWinningNumbers) {
      userScores = testScores;
      winningNumbers = testWinningNumbers;
    } else {
      // Get real user scores
      const { data: scores } = await supabaseAdmin
        .from("scores")
        .select("score")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(5);
      
      // Get latest draw
      const { data: draw } = await supabaseAdmin
        .from("draws")
        .select("winning_numbers")
        .order("month_year", { ascending: false })
        .limit(1)
        .single();
      
      userScores = scores?.map(s => s.score) || [];
      winningNumbers = draw?.winning_numbers || [];
    }
    
    // Perform matching
    const userSet = new Set(userScores);
    const matches = winningNumbers.filter(n => userSet.has(n));
    const matchCount = matches.length;
    
    // Determine tier
    let tier = null;
    if (matchCount >= 5) tier = "5-Match";
    else if (matchCount === 4) tier = "4-Match";
    else if (matchCount === 3) tier = "3-Match";
    
    return NextResponse.json({
      userId,
      userScores,
      winningNumbers,
      matches,
      matchCount,
      tier,
      isWinner: matchCount >= 3
    });
    
  } catch (error) {
    console.error("Test matching error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
