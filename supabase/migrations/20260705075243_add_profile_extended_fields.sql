ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS available_for_work boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS job_title text;
