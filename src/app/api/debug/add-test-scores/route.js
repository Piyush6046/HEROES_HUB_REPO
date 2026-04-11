import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, scores } = await req.json();

    if (!userId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Missing userId or scores array" }, { status: 400 });
    }

    console.log("Adding test scores for user:", userId);
    console.log("Scores to add:", scores);

    // Delete existing scores for this user
    await supabaseAdmin
      .from("scores")
      .delete()
      .eq("user_id", userId);

    // Insert new scores
    const scoresToInsert = scores.map((score, index) => ({
      user_id: userId,
      score: score,
      course_name: `Test Course ${index + 1}`,
      date_played: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      notes: `Test score for debugging`
    }));

    const { data: insertedScores, error } = await supabaseAdmin
      .from("scores")
      .insert(scoresToInsert)
      .select();

    if (error) {
      console.error("Error inserting test scores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Successfully inserted test scores:", insertedScores);

    return NextResponse.json({
      message: "Test scores added successfully",
      scores: insertedScores,
      debug: {
        userId,
        scoresInserted: insertedScores?.length || 0
      }
    });

  } catch (error) {
    console.error("Add test scores error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
