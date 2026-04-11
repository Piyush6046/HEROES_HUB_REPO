import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const variations = [
    "5-Match", "4-Match", "3-Match",
    "5-match", "4-match", "3-match",
    "5", "4", "3",
    "Match 5", "Match 4", "Match 3",
    "Match-5", "Match-4", "Match-3",
    "tier1", "tier2", "tier3",
    "Tier 1", "Tier 2", "Tier 3"
  ];
  
  const results = [];
  
  for (const v of variations) {
    // We try to insert into winners with a dummy draw ID.
    // If it fails with 23514, the constraint rejected it.
    // If it fails with something else (like foreign key), the constraint PASSED.
    const { error } = await supabaseAdmin.from("winners").insert({
      draw_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
      match_type: v,
      prize_amount: 0
    });
    
    const passed = error?.code !== '23514';
    results.push({ value: v, passed, error_code: error?.code, message: error?.message });
  }

  return NextResponse.json({ results });
}
