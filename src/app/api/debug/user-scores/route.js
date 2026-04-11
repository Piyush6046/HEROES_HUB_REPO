import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: "User not found", details: userError.message }, { status: 404 });
    }

    // Get user scores
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("date_played", { ascending: false });

    if (scoresError) {
      return NextResponse.json({ error: "Error fetching scores", details: scoresError.message }, { status: 500 });
    }

    // Test adding a sample score
    const testScore = {
      user_id: userId,
      score: 18,
      course_name: "Test Course",
      date_played: new Date().toISOString().split('T')[0],
      notes: "Debug test score"
    };

    const { data: insertedScore, error: insertError } = await supabaseAdmin
      .from("scores")
      .insert(testScore)
      .select()
      .single();

    return NextResponse.json({
      user,
      scores: scores || [],
      insertedScore,
      insertError,
      debug: {
        userId,
        scoresCount: scores?.length || 0,
        databaseSchema: "scores table exists"
      }
    });

  } catch (error) {
    console.error("User scores debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
