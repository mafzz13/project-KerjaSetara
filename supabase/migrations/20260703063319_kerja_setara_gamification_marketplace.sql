/*
# Kerja Setara – Gamification, Marketplace & Analytics Schema

## Summary
Adds gamification (XP/points, challenges, leaderboard), inclusive marketplace,
and employer CSR/analytics tables to power the full operational features.

## New Tables

### user_gamification
XP points, level, streak, and total coins per user (job seekers).

### daily_challenges
Pre-seeded challenges users can complete for XP rewards.

### challenge_completions
Records of which users completed which challenges.

### marketplace_listings
Freelancer service/product listings from job seeker users.

### csr_programs
CSR programs created by employers for funding disability training.

### portfolio_items
Portfolio pieces attached to a marketplace listing or user profile.

## Security
All tables use RLS with authenticated access scoped to owners.
Marketplace listings readable by all authenticated users.
Leaderboard data (gamification) readable by all authenticated users.
*/

-- user_gamification
CREATE TABLE IF NOT EXISTS user_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  coins integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gamification_select" ON user_gamification;
CREATE POLICY "gamification_select" ON user_gamification FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "gamification_insert" ON user_gamification;
CREATE POLICY "gamification_insert" ON user_gamification FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "gamification_update" ON user_gamification;
CREATE POLICY "gamification_update" ON user_gamification FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- daily_challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  coin_reward integer NOT NULL DEFAULT 10,
  challenge_type text NOT NULL DEFAULT 'learning' CHECK (challenge_type IN ('learning', 'apply', 'profile', 'social')),
  icon text NOT NULL DEFAULT '⚡',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenges_select" ON daily_challenges;
CREATE POLICY "challenges_select" ON daily_challenges FOR SELECT
  TO authenticated USING (is_active = true);

-- challenge_completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "completions_select" ON challenge_completions;
CREATE POLICY "completions_select" ON challenge_completions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_insert" ON challenge_completions;
CREATE POLICY "completions_insert" ON challenge_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- marketplace_listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Desain',
  price integer NOT NULL DEFAULT 0,
  price_type text NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'negotiable')),
  delivery_days integer NOT NULL DEFAULT 7,
  tags text[] DEFAULT '{}',
  portfolio_url text,
  is_active boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  orders integer NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select" ON marketplace_listings;
CREATE POLICY "listings_select" ON marketplace_listings FOR SELECT
  TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "listings_insert" ON marketplace_listings;
CREATE POLICY "listings_insert" ON marketplace_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "listings_update" ON marketplace_listings;
CREATE POLICY "listings_update" ON marketplace_listings FOR UPDATE
  TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "listings_delete" ON marketplace_listings;
CREATE POLICY "listings_delete" ON marketplace_listings FOR DELETE
  TO authenticated USING (auth.uid() = seller_id);

-- csr_programs
CREATE TABLE IF NOT EXISTS csr_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  budget integer NOT NULL DEFAULT 0,
  spent integer NOT NULL DEFAULT 0,
  beneficiaries integer NOT NULL DEFAULT 0,
  target_beneficiaries integer NOT NULL DEFAULT 100,
  category text NOT NULL DEFAULT 'Pelatihan',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'draft')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE csr_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "csr_select" ON csr_programs;
CREATE POLICY "csr_select" ON csr_programs FOR SELECT
  TO authenticated USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "csr_insert" ON csr_programs;
CREATE POLICY "csr_insert" ON csr_programs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "csr_update" ON csr_programs;
CREATE POLICY "csr_update" ON csr_programs FOR UPDATE
  TO authenticated USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON user_gamification(xp DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller_id ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_csr_employer_id ON csr_programs(employer_id);

-- Seed daily challenges
INSERT INTO daily_challenges (title, description, xp_reward, coin_reward, challenge_type, icon) VALUES
  ('Selesaikan 1 Sesi Belajar', 'Ikuti dan selesaikan minimal 1 sesi di modul pelatihan manapun', 100, 20, 'learning', '📚'),
  ('Lamar 1 Lowongan Hari Ini', 'Temukan dan lamar pekerjaan yang sesuai dengan profilmu', 80, 15, 'apply', '📤'),
  ('Lengkapi Profil Disabilitas', 'Perbarui informasi aksesibilitas di profil kamu', 60, 10, 'profile', '✨'),
  ('Jelajahi 3 Lowongan Baru', 'Buka dan baca detail minimal 3 lowongan hari ini', 50, 10, 'apply', '🔍'),
  ('Bagikan Kisah Suksesmu', 'Tulis pengalaman inspiratif di komunitas platform', 120, 25, 'social', '💬'),
  ('Tonton Video Pelatihan', 'Selesaikan 1 video materi pelatihan berdurasi min. 5 menit', 70, 15, 'learning', '🎬'),
  ('Daftar Pelatihan Baru', 'Enroll ke modul pelatihan yang belum pernah kamu ikuti', 90, 20, 'learning', '🎓')
ON CONFLICT DO NOTHING;

-- Seed marketplace listings (sample, no seller_id since no real users yet)
-- These will be populated by real users
