import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', 'admin@gmial.com')
    .select();

  return NextResponse.json({ data, error });
}
