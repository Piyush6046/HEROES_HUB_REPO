import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  // Diagnostic: Try to insert a dummy winner with a few common string variations 
  // to see which one the constraint allows.
  const variations = ["5-Match", "5-match", "Match-5", "5 Match"];
  const results = {};
  
  for (const v of variations) {
    const { error } = await supabaseAdmin.from("winners").insert({
      draw_id: "00000000-0000-0000-0000-000000000000", // Will fail on foreign key anyway, but constraint check happens first
      user_id: "00000000-0000-0000-0000-000000000000",
      match_type: v,
      prize_amount: 0
    });
    results[v] = error?.message;
  }

  return NextResponse.json(results);
}
