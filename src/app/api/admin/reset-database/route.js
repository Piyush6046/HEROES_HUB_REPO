import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Starting database reset...");

    // Delete all data in correct order to respect foreign key constraints
    const tables = [
      'winners',      // Depends on draws, profiles
      'scores',       // Depends on profiles  
      'draws',        // Independent
      'profiles'      // Independent
    ];

    const results = {};

    for (const table of tables) {
      console.log(`Deleting all records from ${table}...`);
      const { error, count } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        results[table] = { error: error.message };
      } else {
        console.log(`Successfully deleted from ${table}`);
        results[table] = { success: true };
      }
    }

    // Reset sequence counters if needed (PostgreSQL specific)
    await supabaseAdmin.rpc('reset_sequences');

    return NextResponse.json({
      message: "Database reset completed successfully",
      results
    });

  } catch (error) {
    console.error("Database reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
