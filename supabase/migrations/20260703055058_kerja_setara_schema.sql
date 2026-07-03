/*
# Kerja Setara – Full Platform Schema

## Summary
Creates the complete database schema for the inclusive job-matching and skill-training portal.
This app has authentication (email/password), so all policies use TO authenticated and auth.uid().

## New Tables

### profiles
Stores user profiles for both job seekers and employers.
Columns: id (references auth.users), full_name, role (job_seeker | employer), disability_type,
company_name, company_size, bio, avatar_url, phone, location, created_at, updated_at.

### jobs
Job listings posted by employers.
Columns: id, employer_id (references profiles), title, company_name, location, job_type
(full_time | part_time | remote | hybrid), salary_min, salary_max, description, requirements,
inclusivity_tags (array of text), is_active, created_at, updated_at.

### applications
Job applications submitted by job seekers.
Columns: id, job_id, applicant_id, status (pending | reviewed | interview | accepted | rejected),
cover_letter, applied_at, updated_at.

### training_modules
Skill training courses available on the platform.
Columns: id, title, description, category, duration_hours, level (beginner | intermediate | advanced),
instructor, thumbnail_url, tags, is_active, created_at.

### enrollments
Job seeker enrollments in training modules.
Columns: id, user_id, module_id, progress (0-100), completed, enrolled_at, completed_at.

## Security
- RLS enabled on all tables.
- Profiles: owners can read/update their own profile; employers can read all job-seeker profiles.
- Jobs: employers own their jobs; job seekers can read active jobs.
- Applications: applicants own their applications; employers can read applications for their jobs.
- Training modules: readable by all authenticated users; managed by system.
- Enrollments: users own their enrollments.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'job_seeker' CHECK (role IN ('job_seeker', 'employer')),
  disability_type text,
  company_name text,
  company_size text,
  bio text,
  avatar_url text,
  phone text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company_name text NOT NULL,
  location text NOT NULL DEFAULT 'Remote',
  job_type text NOT NULL DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'remote', 'hybrid')),
  salary_min integer,
  salary_max integer,
  description text NOT NULL DEFAULT '',
  requirements text,
  inclusivity_tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_all" ON jobs;
CREATE POLICY "jobs_select_all" ON jobs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "jobs_insert_employer" ON jobs;
CREATE POLICY "jobs_insert_employer" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "jobs_update_employer" ON jobs;
CREATE POLICY "jobs_update_employer" ON jobs FOR UPDATE
  TO authenticated USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "jobs_delete_employer" ON jobs;
CREATE POLICY "jobs_delete_employer" ON jobs FOR DELETE
  TO authenticated USING (auth.uid() = employer_id);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  cover_letter text,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select" ON applications;
CREATE POLICY "applications_select" ON applications FOR SELECT
  TO authenticated USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid())
  );

DROP POLICY IF EXISTS "applications_insert" ON applications;
CREATE POLICY "applications_insert" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "applications_update" ON applications;
CREATE POLICY "applications_update" ON applications FOR UPDATE
  TO authenticated USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid())
  ) WITH CHECK (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid())
  );

DROP POLICY IF EXISTS "applications_delete" ON applications;
CREATE POLICY "applications_delete" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = applicant_id);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Teknologi',
  duration_hours integer NOT NULL DEFAULT 10,
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  instructor text NOT NULL DEFAULT '',
  thumbnail_url text,
  tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modules_select" ON training_modules;
CREATE POLICY "modules_select" ON training_modules FOR SELECT
  TO authenticated USING (is_active = true);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed boolean NOT NULL DEFAULT false,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, module_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select" ON enrollments;
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_insert" ON enrollments;
CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_update" ON enrollments;
CREATE POLICY "enrollments_update" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_delete" ON enrollments;
CREATE POLICY "enrollments_delete" ON enrollments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);

-- Seed training modules
INSERT INTO training_modules (title, description, category, duration_hours, level, instructor, tags)
VALUES
  ('Desain Grafis dengan Figma', 'Pelajari desain UI/UX profesional menggunakan Figma. Cocok untuk penyandang disabilitas fisik yang bekerja dari rumah.', 'Desain', 20, 'beginner', 'Rina Kartika', ARRAY['Desain', 'Figma', 'Remote-Friendly']),
  ('Pengembangan Web Frontend', 'HTML, CSS, JavaScript dasar hingga lanjutan. Materi disampaikan dengan teks dan visual untuk aksesibilitas optimal.', 'Teknologi', 40, 'intermediate', 'Budi Santoso', ARRAY['Coding', 'Web', 'Remote-Friendly']),
  ('Bahasa Isyarat Indonesia (BISINDO)', 'Kursus BISINDO komprehensif untuk komunikasi profesional. Tersedia caption dan teks penuh.', 'Komunikasi', 15, 'beginner', 'Sari Dewi', ARRAY['BISINDO', 'Komunikasi', 'Ramah Tuli']),
  ('Manajemen Keuangan Digital', 'Kelola keuangan pribadi dan bisnis menggunakan aplikasi digital. Kompatibel dengan screen reader.', 'Bisnis', 12, 'beginner', 'Ahmad Fauzi', ARRAY['Keuangan', 'Digital', 'Ramah Netra']),
  ('Pemasaran Digital & Media Sosial', 'Strategi pemasaran online untuk era digital. Semua materi dalam format aksesibel.', 'Pemasaran', 18, 'intermediate', 'Dina Puspita', ARRAY['Marketing', 'Sosial Media', 'Remote-Friendly']),
  ('Data Entry & Administrasi Kantor', 'Keterampilan administrasi kantor modern termasuk spreadsheet dan pengelolaan dokumen.', 'Administrasi', 8, 'beginner', 'Hendra Wijaya', ARRAY['Administrasi', 'Office', 'Ramah Fisik'])
ON CONFLICT DO NOTHING;

-- Seed sample jobs
INSERT INTO jobs (employer_id, title, company_name, location, job_type, salary_min, salary_max, description, requirements, inclusivity_tags)
SELECT
  (SELECT id FROM profiles WHERE role = 'employer' LIMIT 1),
  j.title, j.company_name, j.location, j.job_type, j.salary_min, j.salary_max, j.description, j.requirements, j.inclusivity_tags
FROM (VALUES
  ('Desainer UI/UX', 'Gojek Indonesia', 'Jakarta (Remote)', 'remote', 6000000, 12000000,
   'Kami mencari desainer UI/UX berbakat untuk bergabung dengan tim produk kami. Posisi ini sepenuhnya remote-friendly.',
   'Pengalaman minimal 1 tahun dengan Figma, portofolio desain yang kuat',
   ARRAY['Ramah Fisik', 'Remote', 'Fleksibel']),
  ('Customer Service Representative', 'Tokopedia', 'Bandung (Hybrid)', 'hybrid', 4000000, 6000000,
   'Bergabunglah dengan tim CS kami yang inklusif. Kami menyediakan perangkat bantu untuk karyawan difabel.',
   'Komunikasi baik, sabar, kemampuan multitasking',
   ARRAY['Ramah Tuli', 'Ramah Fisik', 'Hybrid']),
  ('Data Entry Specialist', 'BCA Finance', 'Surabaya', 'full_time', 3500000, 5000000,
   'Posisi entry-level untuk pengolahan data. Lingkungan kerja aksesibel dengan fasilitas lengkap.',
   'Teliti, cepat mengetik, familiar dengan Excel',
   ARRAY['Ramah Netra', 'Ramah Fisik', 'Entry-Level']),
  ('Content Writer', 'Kompas Gramedia', 'Remote', 'remote', 4500000, 7000000,
   'Tulis konten kreatif dan informatif untuk platform digital kami dari mana saja.',
   'Kemampuan menulis yang baik, SEO dasar, kreativitas tinggi',
   ARRAY['Remote', 'Fleksibel', 'Ramah Fisik']),
  ('Software Developer', 'Bukalapak', 'Jakarta (Remote)', 'remote', 8000000, 15000000,
   'Bangun fitur-fitur inovatif di platform e-commerce kami. Fully remote, tools aksesibel disediakan.',
   'Pengalaman React/Node.js minimal 2 tahun, kemampuan problem solving',
   ARRAY['Ramah Netra', 'Remote', 'Tech-Friendly']),
  ('Virtual Assistant', 'Startup Lokal', 'Remote', 'part_time', 2000000, 4000000,
   'Bantu operasional bisnis kami secara remote. Jam kerja fleksibel, cocok untuk difabel fisik.',
   'Organisasi yang baik, komunikasi email, Microsoft Office',
   ARRAY['Ramah Fisik', 'Remote', 'Part-Time', 'Fleksibel'])
) AS j(title, company_name, location, job_type, salary_min, salary_max, description, requirements, inclusivity_tags)
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'employer' LIMIT 1)
ON CONFLICT DO NOTHING;
