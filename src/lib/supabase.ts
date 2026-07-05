import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'job_seeker' | 'employer';

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  disability_type?: string;
  company_name?: string;
  company_size?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  job_title?: string;
  available_for_work?: boolean;
  skills?: Skill[];
  work_experience?: WorkExperience[];
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'remote' | 'hybrid';
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string;
  inclusivity_tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
  jobs?: Job;
  profiles?: Profile;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  thumbnail_url?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  module_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  completed_at?: string;
  training_modules?: TrainingModule;
}

export interface UserGamification {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  coins: number;
  streak_days: number;
  last_activity_date?: string;
  badges: string[];
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  challenge_type: 'learning' | 'apply' | 'profile' | 'social';
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
  daily_challenges?: DailyChallenge;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  delivery_days: number;
  tags: string[];
  portfolio_url?: string;
  is_active: boolean;
  views: number;
  orders: number;
  rating: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface CsrProgram {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  budget: number;
  spent: number;
  beneficiaries: number;
  target_beneficiaries: number;
  category: string;
  status: 'active' | 'completed' | 'draft';
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export function calcLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 200) + 1);
}

export function xpForNextLevel(level: number): number {
  return level * 200;
}

export function xpProgressInLevel(xp: number): number {
  const level = calcLevel(xp);
  const levelStart = (level - 1) * 200;
  const levelEnd = level * 200;
  return ((xp - levelStart) / (levelEnd - levelStart)) * 100;
}

export function getMatchScore(job: Job, disabilityType?: string): number {
  if (!disabilityType) return 70;
  const tags = job.inclusivity_tags.map(t => t.toLowerCase());
  let score = 50;

  const d = disabilityType.toLowerCase();
  if (d.includes('netra') && (tags.includes('ramah netra') || tags.includes('remote'))) score += 40;
  else if (d.includes('rungu') || d.includes('tuli')) { if (tags.includes('ramah tuli') || tags.includes('remote')) score += 40; }
  else if (d.includes('fisik')) { if (tags.includes('ramah fisik') || tags.includes('remote') || tags.includes('hybrid')) score += 40; }
  else score += 20;

  if (tags.includes('remote')) score += 10;
  if (tags.includes('fleksibel')) score += 5;
  if (tags.includes('entry-level')) score += 5;

  return Math.min(99, score);
}
