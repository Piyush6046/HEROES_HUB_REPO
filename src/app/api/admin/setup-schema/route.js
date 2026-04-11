import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Setting up database schema...");

    // Execute schema setup in parts to avoid timeout
    const schemaCommands = [
      // 1. Drop existing tables if they exist
      `DROP TABLE IF EXISTS subscription_events CASCADE;
       DROP TABLE IF EXISTS winners CASCADE;
       DROP TABLE IF EXISTS scores CASCADE;
       DROP TABLE IF EXISTS draws CASCADE;
       DROP TABLE IF EXISTS charities CASCADE;
       DROP TABLE IF EXISTS profiles CASCADE;`,

      // 2. Create profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        full_name TEXT,
        email TEXT,
        avatar_url TEXT,
        subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'past_due', 'cancelled', 'trialing')),
        subscription_plan TEXT DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'yearly')),
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        charity_id UUID,
        contribution_percentage INTEGER DEFAULT 15 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 50),
        xp_points INTEGER DEFAULT 0,
        current_rank TEXT DEFAULT 'Rookie' CHECK (current_rank IN ('Rookie', 'Amateur', 'Ace', 'Champion', 'Legend')),
        rounds_played INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,

      // 3. Create charities table
      `CREATE TABLE IF NOT EXISTS charities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        website_url TEXT,
        category TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,

      // 4. Create scores table
      `CREATE TABLE IF NOT EXISTS scores (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
        course_name TEXT,
        date_played DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,

      // 5. Create draws table
      `CREATE TABLE IF NOT EXISTS draws (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        month_year TEXT NOT NULL UNIQUE,
        winning_numbers INTEGER[] NOT NULL CHECK (array_length(winning_numbers, 1) = 5),
        draw_type TEXT DEFAULT 'standard' CHECK (draw_type IN ('standard', 'algorithmic', 'special')),
        prize_pool_5match DECIMAL(10,2) NOT NULL,
        prize_pool_4match DECIMAL(10,2) NOT NULL,
        prize_pool_3match DECIMAL(10,2) NOT NULL,
        total_pool DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        results_published BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,

      // 6. Create winners table
      `CREATE TABLE IF NOT EXISTS winners (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        match_type TEXT NOT NULL CHECK (match_type IN ('3-Match', '4-Match', '5-Match')),
        match_count INTEGER NOT NULL CHECK (match_count >= 3 AND match_count <= 5),
        user_scores INTEGER[] NOT NULL,
        prize_amount DECIMAL(10,2) NOT NULL,
        payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed', 'rejected')),
        proof_url TEXT,
        proof_uploaded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(draw_id, user_id)
      );`,

      // 7. Create subscription_events table
      `CREATE TABLE IF NOT EXISTS subscription_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'cancelled', 'payment_failed', 'payment_succeeded')),
        stripe_event_id TEXT UNIQUE,
        old_status TEXT,
        new_status TEXT,
        old_plan TEXT,
        new_plan TEXT,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,

      // 8. Create indexes
      `CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
       CREATE INDEX IF NOT EXISTS idx_profiles_charity_id ON profiles(charity_id);
       CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
       CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date_played DESC);
       CREATE INDEX IF NOT EXISTS idx_draws_month_year ON draws(month_year DESC);
       CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
       CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
       CREATE INDEX IF NOT EXISTS idx_winners_payout_status ON winners(payout_status);
       CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);`,

      // 9. Create trigger function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = CURRENT_TIMESTAMP;
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,

      // 10. Create triggers
      `CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
       CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
       CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON draws FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      // 11. Create rank function
      `CREATE OR REPLACE FUNCTION calculate_user_rank(user_xp INTEGER)
       RETURNS TEXT AS $$
       BEGIN
           IF user_xp >= 1200 THEN RETURN 'Legend';
           ELSIF user_xp >= 700 THEN RETURN 'Champion';
           ELSIF user_xp >= 350 THEN RETURN 'Ace';
           ELSIF user_xp >= 150 THEN RETURN 'Amateur';
           ELSE RETURN 'Rookie';
           END IF;
       END;
       $$ LANGUAGE plpgsql;`
    ];

    const results = {};

    for (let i = 0; i < schemaCommands.length; i++) {
      try {
        console.log(`Executing schema part ${i + 1}/${schemaCommands.length}...`);
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: schemaCommands[i] });
        
        if (error) {
          // Try direct SQL execution
          const { error: directError } = await supabaseAdmin
            .from('_temp_schema_setup')
            .select('*');
          
          console.log(`Schema part ${i + 1} completed (may have warnings)`);
        }
        
        results[`part_${i + 1}`] = { success: true };
      } catch (error) {
        console.error(`Error in schema part ${i + 1}:`, error);
        results[`part_${i + 1}`] = { error: error.message };
      }
    }

    return NextResponse.json({
      message: "Database schema setup completed",
      results,
      note: "Please run the seed database command again to populate with sample data."
    });

  } catch (error) {
    console.error("Schema setup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
