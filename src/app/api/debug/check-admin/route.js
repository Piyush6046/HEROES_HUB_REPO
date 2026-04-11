import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', 'admin@gmial.com')
    .single();

  return NextResponse.json({ data, error });
}
