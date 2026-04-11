import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('winners')
    .select('*')
    .limit(1);

  return NextResponse.json({ data, error });
}
