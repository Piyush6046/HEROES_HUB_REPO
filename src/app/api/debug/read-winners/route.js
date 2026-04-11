import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("winners").select("match_type").limit(10);
  if (error) return NextResponse.json({ error });
  return NextResponse.json({ existing_types: data.map(d => d.match_type) });
}
