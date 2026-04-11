import { getAICaddyAdvice } from "@/lib/ai";
import { supabase } from "@/lib/supabase"; // Use client for session check
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { scores, rank, userId } = await req.json();

    if (!scores || scores.length === 0) {
      return NextResponse.json({ 
        advice: "Log your first round to unlock AI Caddy insights! Every point counts towards your Ace rank.",
        luckyNumbers: [1, 7, 13, 22, 31]
      });
    }

    const advice = await getAICaddyAdvice(scores, rank);
    return NextResponse.json(advice);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
