import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: users } = await supabaseAdmin.from("profiles").select("id, email");
  const { data: scores } = await supabaseAdmin.from("scores").select("user_id, score");
  const { data: draws } = await supabaseAdmin.from("draws").select("winning_numbers").order('created_at', { ascending: false }).limit(1);

  return NextResponse.json({
    users: users?.map(u => ({ id: u.id, id_type: typeof u.id, email: u.email })),
    scores: scores?.map(s => ({ user_id: s.user_id, user_id_type: typeof s.user_id, score: s.score })),
    latest_draw: draws?.[0]
  });
}
