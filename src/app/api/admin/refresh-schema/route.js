import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Refreshing Supabase schema cache...");

    // Method 1: Try to refresh schema cache
    try {
      await supabaseAdmin.rpc('pg_refresh_schema_cache');
      console.log("Schema cache refresh attempted");
    } catch (error) {
      console.log("Schema cache refresh failed (expected):", error.message);
    }

    // Method 2: Force a simple query to each table to refresh cache
    const tables = ['profiles', 'charities', 'scores', 'draws', 'winners', 'subscription_events'];
    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = { 
          success: !error, 
          count: data?.length || 0,
          error: error?.message 
        };
      } catch (error) {
        results[table] = { success: false, error: error.message };
      }
    }

    return NextResponse.json({
      message: "Schema refresh completed",
      results,
      note: "Now try seeding the database again."
    });

  } catch (error) {
    console.error("Schema refresh error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
