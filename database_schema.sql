-- HeroesHub Database Schema
-- Complete schema for the golf subscription platform

-- 1. PROFILES TABLE
-- User profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  
  -- Subscription fields
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'past_due', 'cancelled', 'trialing')),
  subscription_plan TEXT DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'yearly')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Charity preferences
  charity_id UUID REFERENCES charities(id),
  contribution_percentage INTEGER DEFAULT 15 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 50),
  
  -- User stats
  xp_points INTEGER DEFAULT 0,
  current_rank TEXT DEFAULT 'Rookie' CHECK (current_rank IN ('Rookie', 'Amateur', 'Ace', 'Champion', 'Legend')),
  rounds_played INTEGER DEFAULT 0,
  
  -- System fields
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CHARITIES TABLE
-- Available charities for users to support
CREATE TABLE IF NOT EXISTS charities (
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
);

-- 3. SCORES TABLE
-- User golf scores (Stableford points)
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  course_name TEXT,
  date_played DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DRAWS TABLE
-- Monthly prize draws
CREATE TABLE IF NOT EXISTS draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year TEXT NOT NULL UNIQUE, -- Format: '2024-01'
  winning_numbers INTEGER[] NOT NULL CHECK (array_length(winning_numbers, 1) = 5),
  draw_type TEXT DEFAULT 'standard' CHECK (draw_type IN ('standard', 'algorithmic', 'special')),
  
  -- Prize pools (in USD)
  prize_pool_5match DECIMAL(10,2) NOT NULL,
  prize_pool_4match DECIMAL(10,2) NOT NULL,
  prize_pool_3match DECIMAL(10,2) NOT NULL,
  total_pool DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  results_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WINNERS TABLE
-- Prize draw winners
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Match details
  match_type TEXT NOT NULL CHECK (match_type IN ('3-Match', '4-Match', '5-Match')),
  match_count INTEGER NOT NULL CHECK (match_count >= 3 AND match_count <= 5),
  user_scores INTEGER[] NOT NULL,
  
  -- Prize details
  prize_amount DECIMAL(10,2) NOT NULL,
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(draw_id, user_id) -- One winner per user per draw
);

-- 6. SUBSCRIPTION_EVENTS TABLE
-- Track subscription lifecycle events
CREATE TABLE IF NOT EXISTS subscription_events (
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
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_charity_id ON profiles(charity_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date_played DESC);
CREATE INDEX IF NOT EXISTS idx_draws_month_year ON draws(month_year DESC);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_payout_status ON winners(payout_status);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);

-- RLS (ROW LEVEL SECURITY) POLICIES
-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Scores table
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON scores FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Charities table (public read access)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active charities" ON charities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Draws table (public read access for completed draws)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view completed draws" ON draws FOR SELECT USING (status = 'completed' AND results_published = TRUE);
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Winners table
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all winners" ON winners FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON draws FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTIONS FOR XP AND RANK CALCULATION
CREATE OR REPLACE FUNCTION calculate_user_rank(user_xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF user_xp >= 1200 THEN RETURN 'Legend';
    ELSIF user_xp >= 700 THEN RETURN 'Champion';
    ELSIF user_xp >= 350 THEN RETURN 'Ace';
    ELSIF user_xp >= 150 THEN RETURN 'Amateur';
    ELSE RETURN 'Rookie';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION TO UPDATE USER XP AND RANK
CREATE OR REPLACE FUNCTION update_user_xp_and_rank()
RETURNS TRIGGER AS $$
BEGIN
    -- Update XP based on scores (10 points per score)
    UPDATE profiles 
    SET xp_points = (
        SELECT COALESCE(COUNT(*) * 10, 0) 
        FROM scores 
        WHERE user_id = NEW.user_id
    ),
    rounds_played = (
        SELECT COALESCE(COUNT(*), 0) 
        FROM scores 
        WHERE user_id = NEW.user_id
    ),
    current_rank = calculate_user_rank(
        SELECT COALESCE(COUNT(*) * 10, 0) 
        FROM scores 
        WHERE user_id = NEW.user_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER TO UPDATE XP WHEN SCORE IS ADDED
CREATE TRIGGER update_user_xp_on_score
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH ROW EXECUTE FUNCTION update_user_xp_and_rank();

-- SAMPLE DATA INSERTION (Optional - for development)
-- This would be removed in production
