import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Manually add the missing columns to the winners table
    const sql = `
      ALTER TABLE winners 
      ADD COLUMN IF NOT EXISTS proof_url TEXT,
      ADD COLUMN IF NOT EXISTS proof_uploaded_at TIMESTAMP WITH TIME ZONE;
    `;
    
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
       // If RPC generic executor is missing, try a different approach (insert-based schema update)
       console.error("RPC Error:", error);
       return NextResponse.json({ 
         error: "Database doesn't support direct SQL RPC. Please run the setup-schema again or add columns manually in Supabase Dashboard.",
         missingColumns: ["proof_url", "proof_uploaded_at"]
       });
    }

    return NextResponse.json({ message: "Database repaired! Columns added successfully." });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
