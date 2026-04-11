import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const variations = ["5-Match", "5-match", "Match 5", "5 Match", "tier1", "Tier 1", "5match"];
  const res = [];
  for (const v of variations) {
    const { error } = await supabaseAdmin.from("winners").insert({
      draw_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
      match_type: v,
      prize_amount: 0
    });
    res.push({ v, code: error?.code, msg: error?.message });
  }
  return NextResponse.json(res);
}
