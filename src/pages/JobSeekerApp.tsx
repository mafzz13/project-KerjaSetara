import { useEffect, useState, useRef } from 'react';
import {
  Search, MapPin, Clock, DollarSign, CheckCircle, XCircle, Eye,
  Send, Star, BookOpen, X, AlertCircle, Loader2, ChevronRight,
  Bell, Zap, Users, LogOut, Phone,
  Flame, Trophy, Target, Plus, ShoppingBag, Sparkles, ExternalLink,
  Pencil, Save, User, Mail, Mic, Keyboard, Volume2, Award, Briefcase,
  PlusCircle, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import {
  supabase, Job, Application, TrainingModule, Enrollment,
  UserGamification, DailyChallenge, ChallengeCompletion, MarketplaceListing,
  calcLevel, xpProgressInLevel, getMatchScore, Skill, WorkExperience
} from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

const tagColors: Record<string, string> = {
  'Ramah Netra': 'bg-blue-100 text-blue-700', 'Ramah Tuli': 'bg-teal-100 text-teal-700',
  'Ramah Fisik': 'bg-green-100 text-green-700', 'Remote': 'bg-purple-100 text-purple-700',
  'Fleksibel': 'bg-orange-100 text-orange-700', 'Part-Time': 'bg-pink-100 text-pink-700',
  'Entry-Level': 'bg-yellow-100 text-yellow-700', 'Tech-Friendly': 'bg-indigo-100 text-indigo-700',
  'Hybrid': 'bg-cyan-100 text-cyan-700',
};
const statusConfig: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: Clock },
  reviewed: { label: 'Ditinjau', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: Eye },
  interview: { label: 'Wawancara', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', icon: Users },
  accepted: { label: 'Diterima', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400', icon: XCircle },
};
const levelColors = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-amber-100 text-amber-700', advanced: 'bg-red-100 text-red-700' };
const levelLabel = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Mahir' };
const jobTypeLabel: Record<string, string> = { full_time: 'Full Time', part_time: 'Part Time', remote: 'Remote', hybrid: 'Hybrid' };

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return 'Negosiasi';
  const f = (n: number) => `${(n / 1e6).toFixed(0)}jt`;
  if (min && max) return `Rp ${f(min)}–${f(max)}`;
  return `Rp ${f(min || max!)}+`;
}

function AIMatchBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#64748b';
  const bg = score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : '#f8fafc';
  const label = score >= 80 ? 'Cocok!' : score >= 60 ? 'Sesuai' : 'Umum';
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: bg, color }}>
      <Sparkles size={9} />
      <span>AI {score}% {label}</span>
    </div>
  );
}

function XPBar({ gamification }: { gamification: UserGamification | null }) {
  if (!gamification) return null;
  const level = calcLevel(gamification.xp);
  const progress = xpProgressInLevel(gamification.xp);
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
        {level}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-700">Level {level}</span>
          <span className="text-[10px] text-slate-400 font-medium">{gamification.xp} XP</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)' }} />
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm">🪙</span>
        <span className="text-xs font-bold text-amber-600">{gamification.coins}</span>
      </div>
      {gamification.streak_days > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-bold text-orange-600">{gamification.streak_days}</span>
        </div>
      )}
    </div>
  );
}

function ApplySheet({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleApply = async () => {
    setLoading(true);
    const { error } = await supabase.from('applications').insert({ job_id: job.id, applicant_id: user!.id, cover_letter: coverLetter });
    setLoading(false);
    if (error) setError(error.code === '23505' ? 'Sudah dilamar.' : 'Gagal mengirim.');
    else onSuccess();
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-5 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
        <div>
          <h3 className="font-bold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company_name} · {job.location}</p>
        </div>
        {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-xl"><AlertCircle size={14} /> {error}</div>}
        <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4}
          placeholder="Ceritakan kenapa kamu cocok untuk posisi ini..."
          className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:bg-white resize-none transition-all" />
        <button onClick={handleApply} disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
      </div>
    </div>
  );
}

function JobDetailSheet({ job, applied, matchScore, onClose, onApply }: { job: Job; applied: boolean; matchScore: number; onClose: () => void; onApply: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl overflow-hidden animate-slide-up max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>{job.company_name[0]}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{job.title}</h3>
              <p className="text-sm text-slate-500">{job.company_name}</p>
              <div className="mt-2"><AIMatchBadge score={matchScore} /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ icon: MapPin, label: job.location }, { icon: Clock, label: jobTypeLabel[job.job_type] }, { icon: DollarSign, label: formatSalary(job.salary_min, job.salary_max) }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                <Icon size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.inclusivity_tags.map(tag => (
              <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
            ))}
          </div>
          <div><h4 className="font-bold text-slate-800 text-sm mb-2">Deskripsi Pekerjaan</h4><p className="text-sm text-slate-600 leading-relaxed">{job.description}</p></div>
          {job.requirements && <div><h4 className="font-bold text-slate-800 text-sm mb-2">Persyaratan</h4><p className="text-sm text-slate-600 leading-relaxed">{job.requirements}</p></div>}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
          {applied ? (
            <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold py-4 rounded-2xl">
              <CheckCircle size={18} /> Sudah Dilamar
            </div>
          ) : (
            <button onClick={onApply} className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
              <Send size={18} /> Lamar Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── HOME SCREEN ─── */
function HomeScreen({ jobs, applications, enrollments, gamification, onJobPress, onTabChange, onApply }: {
  jobs: Job[]; applications: Application[]; enrollments: Enrollment[];
  gamification: UserGamification | null; onJobPress: (j: Job) => void;
  onTabChange: (t: string) => void; onApply: (j: Job) => void;
}) {
  const { profile, user } = useAuth();
  const { settings, speak } = useAccessibility();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const appliedIds = new Set(applications.map(a => a.job_id));
  const topJobs = jobs.slice(0, 3);
  const completedEnrollments = enrollments.filter(e => e.completed).length;
  const dbBadges: string[] = gamification?.badges ?? [];
  const avgMatchScore = jobs.length > 0
    ? Math.round(jobs.slice(0, 5).reduce((acc, j) => acc + getMatchScore(j, profile?.disability_type), 0) / Math.min(5, jobs.length))
    : 70;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1F3A60 0%, #3582B8 85%, #0ea5e9 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex items-start gap-4 mb-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs font-medium">{greeting},</p>
            <h1 className="text-xl font-bold text-white leading-tight">
              <span className="font-normal">Selamat datang kembali, </span>
              <span>{profile?.full_name?.split(' ')[0] || 'Pengguna'}!</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 bg-green-400/20 border border-green-400/30 text-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Sparkles size={8} /> Matching {avgMatchScore}%
              </span>
              {(profile?.job_title || profile?.disability_type) && (
                <span className="text-[10px] text-blue-200">
                  {profile?.job_title || ''}
                  {profile?.job_title && profile?.location ? ' | ' : ''}
                  {profile?.location || ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </div>
          </div>
        </div>

        <button onClick={() => onTabChange('jobs')}
          className="relative z-10 w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg active:scale-[0.98] transition-transform">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-slate-400 text-sm flex-1 text-left">AI akan mencocokkan pekerjaan...</span>
          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={9} />Smart</span>
        </button>
      </div>

      {/* XP/Level strip */}
      {gamification && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border-b border-amber-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {calcLevel(gamification.xp)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800">Level {calcLevel(gamification.xp)} — {gamification.xp} XP</span>
              <span className="text-[10px] text-amber-600">🪙 {gamification.coins}</span>
            </div>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${xpProgressInLevel(gamification.xp)}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)' }} />
            </div>
          </div>
          {gamification.streak_days > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0"><Flame size={16} className="text-orange-500" /><span className="text-xs font-bold text-orange-600">{gamification.streak_days}🔥</span></div>
          )}
        </div>
      )}

      <div className="px-4 py-4 space-y-5 pb-6">
        {/* Statistik Saya */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Statistik Saya</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Lamaran\nTerkirim', value: applications.length, color: '#3582B8', bg: '#eff6ff', icon: Send },
              { label: 'Kursus\nSelesai', value: completedEnrollments, color: '#d97706', bg: '#fffbeb', icon: Award },
              { label: 'Sertifikat\nDiraih', value: dbBadges.length, color: '#059669', bg: '#f0fdf4', icon: Trophy },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 shadow-card text-center border border-slate-50">
                <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight whitespace-pre-line">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Assistive Tools */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Assistive Tools</h2>
          <div className="bg-white rounded-2xl shadow-card border border-slate-50 overflow-hidden">
            {[
              { icon: Volume2, label: 'AI Voice Reader', desc: 'Bacakan konten halaman', action: () => speak('AI Voice Reader aktif. Saya akan membacakan konten untuk kamu.', true), color: '#3582B8' },
              { icon: Mic, label: 'Voice Command', desc: 'Navigasi dengan suara', action: () => speak('Mode perintah suara siap.', true), color: '#7c3aed' },
              { icon: Keyboard, label: 'Keyboard Aksesibilitas', desc: 'Navigasi keyboard penuh', action: () => speak('Keyboard aksesibilitas aktif.', true), color: '#059669' },
            ].map(({ icon: Icon, label, desc, action, color }, i) => (
              <button key={label} onClick={action}
                className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors text-left ${i < 2 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: color + '15' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Lowongan Cocok untuk Anda */}
        {topJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Lowongan Cocok untuk Anda</h2>
              <button onClick={() => onTabChange('jobs')} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">Lihat semua <ChevronRight size={14} /></button>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-slate-50 overflow-hidden">
              {topJobs.map((job, i) => {
                const score = getMatchScore(job, profile?.disability_type);
                const isApplied = appliedIds.has(job.id);
                return (
                  <div key={job.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < topJobs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <button onClick={() => onJobPress(job)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>{job.company_name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{job.title}</p>
                        <p className="text-xs text-slate-500 truncate">{job.company_name} · {job.location}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: score >= 80 ? '#f0fdf4' : '#fffbeb', color: score >= 80 ? '#059669' : '#d97706' }}>
                          Matching {score}%
                        </span>
                      </div>
                    </button>
                    {isApplied ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-bold flex-shrink-0">
                        <CheckCircle size={14} /><span>Dilamar</span>
                      </div>
                    ) : (
                      <button onClick={() => onApply(job)}
                        className="flex-shrink-0 text-xs font-bold text-white px-3 py-2 rounded-xl active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                        Lamar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pelatihan Saya */}
        {enrollments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Pelatihan Saya</h2>
              <button onClick={() => onTabChange('training')} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">Lihat semua <ChevronRight size={14} /></button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {enrollments.slice(0, 3).map(e => {
                const mod = e.training_modules;
                if (!mod) return null;
                return (
                  <button key={e.id} onClick={() => onTabChange('training')}
                    className="flex-shrink-0 w-44 bg-white rounded-2xl p-3.5 shadow-card border border-slate-50 text-left active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                      {mod.title[0]}
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{mod.title}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${e.progress}%`, background: 'linear-gradient(90deg, #3582B8, #85B6D6)' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{e.progress}% selesai</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sertifikat Saya */}
        {dbBadges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Sertifikat Saya</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-slate-50 p-4">
              <div className="flex flex-wrap gap-2">
                {dbBadges.map(b => (
                  <div key={b} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <Award size={16} className="text-amber-500" />
                    <span className="text-xs font-semibold text-amber-800">{b}</span>
                  </div>
                ))}
              </div>
              {dbBadges.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">Selesaikan pelatihan untuk mendapatkan sertifikat.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── JOBS SCREEN ─── */
function JobsScreen({ jobs, applications, onJobPress }: { jobs: Job[]; applications: Application[]; onJobPress: (j: Job) => void }) {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');
  const appliedIds = new Set(applications.map(a => a.job_id));
  const allTags = ['Ramah Netra', 'Ramah Tuli', 'Ramah Fisik', 'Remote', 'Fleksibel', 'Part-Time'];

  let filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (!q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q)) &&
      (!selectedTag || j.inclusivity_tags.includes(selectedTag));
  });
  if (sortBy === 'match') {
    filtered = [...filtered].sort((a, b) => getMatchScore(b, profile?.disability_type) - getMatchScore(a, profile?.disability_type));
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Lowongan Kerja" subtitle={`${filtered.length} lowongan • AI Matching aktif`} />
      <div className="px-4 py-3 bg-white border-b border-slate-100 space-y-2.5">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari jabatan atau perusahaan..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 border border-transparent focus:border-blue-300 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto flex-1 pb-0.5" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setSelectedTag('')}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${!selectedTag ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
              style={!selectedTag ? { background: 'linear-gradient(135deg, #3582B8, #85B6D6)' } : {}}>
              Semua
            </button>
            {allTags.map(t => (
              <button key={t} onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${selectedTag === t ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
                style={selectedTag === t ? { background: 'linear-gradient(135deg, #3582B8, #85B6D6)' } : {}}>
                {t}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'match' | 'recent')}
            className="text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl px-2 py-1.5 outline-none flex-shrink-0">
            <option value="match">AI Match</option>
            <option value="recent">Terbaru</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Tidak ada hasil</p>
          </div>
        ) : filtered.map(job => {
          const score = getMatchScore(job, profile?.disability_type);
          return (
            <button key={job.id} onClick={() => onJobPress(job)}
              className="w-full bg-white rounded-2xl p-4 shadow-card text-left active:scale-[0.98] transition-transform border border-slate-50">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>{job.company_name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{job.title}</h3>
                    {appliedIds.has(job.id) && <CheckCircle size={15} className="text-green-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{job.company_name}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <AIMatchBadge score={score} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                    <span className="text-[11px] text-slate-400">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.inclusivity_tags.map(t => (
                      <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── GAMIFIED TRAINING SCREEN ─── */
function TrainingScreen({ modules, enrollments, gamification, challenges, completions, onEnroll, onCompleteChallenge }: {
  modules: TrainingModule[]; enrollments: Enrollment[]; gamification: UserGamification | null;
  challenges: DailyChallenge[]; completions: ChallengeCompletion[];
  onEnroll: (id: string) => void; onCompleteChallenge: (id: string, xp: number, coins: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'learn' | 'challenges' | 'board'>('learn');
  const [leaderboard, setLeaderboard] = useState<UserGamification[]>([]);
  const enrolledIds = new Set(enrollments.map(e => e.module_id));
  const completedIds = new Set(completions.map(c => c.challenge_id));

  useEffect(() => {
    if (activeTab === 'board') {
      supabase.from('user_gamification').select('*, profiles(full_name, disability_type)').order('xp', { ascending: false }).limit(10)
        .then(({ data }) => { if (data) setLeaderboard(data as UserGamification[]); });
    }
  }, [activeTab]);

  const challengeTypeColors: Record<string, string> = {
    learning: 'bg-blue-100 text-blue-700',
    apply: 'bg-green-100 text-green-700',
    profile: 'bg-purple-100 text-purple-700',
    social: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Pelatihan Gamifikasi" subtitle={gamification ? `${gamification.xp} XP • Level ${calcLevel(gamification.xp)}` : 'Kumpulkan XP & Badge'} />
      {gamification && <XPBar gamification={gamification} />}

      {/* Sub-tabs */}
      <div className="flex bg-white border-b border-slate-100 px-4">
        {([
          { id: 'learn', label: '📚 Belajar' },
          { id: 'challenges', label: '⚡ Tantangan' },
          { id: 'board', label: '🏆 Papan' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-bold transition-all ${activeTab === tab.id ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* LEARN TAB */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            {/* Active enrollments */}
            {enrollments.filter(e => !e.completed).length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sedang Dipelajari</h3>
                {enrollments.filter(e => !e.completed).map(e => {
                  const mod = e.training_modules;
                  if (!mod) return null;
                  return (
                    <div key={e.id} className="bg-white rounded-2xl p-4 shadow-card border border-blue-50 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 text-sm flex-1 mr-2 truncate">{mod.title}</h4>
                        <span className="text-xs font-bold text-blue-700">{e.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${e.progress}%`, background: 'linear-gradient(90deg, #3582B8, #85B6D6)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semua Modul</h3>
            {modules.map(mod => {
              const enrolled = enrolledIds.has(mod.id);
              return (
                <div key={mod.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-50 mb-3">
                  <div className="h-20 relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)' }}>
                    <BookOpen size={32} className="text-blue-200" />
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[mod.level]}`}>{levelLabel[mod.level]}</span>
                    <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/80 text-slate-600 px-2 py-0.5 rounded-full">{mod.category}</span>
                    {/* XP reward badge */}
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">+{mod.duration_hours * 5} XP</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{mod.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{mod.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={10} />{mod.duration_hours} jam</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />4.8</span>
                      </div>
                      {enrolled ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle size={12} /> Terdaftar
                        </span>
                      ) : (
                        <button onClick={() => onEnroll(mod.id)}
                          className="text-[11px] font-bold text-white px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                          style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                          Daftar +{mod.duration_hours * 5} XP
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mod.tags.slice(0, 2).map(t => (
                        <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${tagColors[t] || 'bg-slate-100 text-slate-600'}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Target size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Tantangan Harian</p>
                <p className="text-xs text-amber-600">{completions.length}/{challenges.length} selesai hari ini</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-amber-700">{completions.reduce((acc, c) => acc + (c.daily_challenges?.xp_reward || 0), 0)}</p>
                <p className="text-[10px] text-amber-500">XP didapat</p>
              </div>
            </div>

            {challenges.map(ch => {
              const done = completedIds.has(ch.id);
              const typeLabel: Record<string, string> = { learning: 'Belajar', apply: 'Melamar', profile: 'Profil', social: 'Sosial' };
              return (
                <div key={ch.id} className={`bg-white rounded-2xl p-4 shadow-card border transition-all ${done ? 'border-green-200 bg-green-50' : 'border-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${done ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {done ? '✅' : ch.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-bold text-sm ${done ? 'text-green-800' : 'text-slate-900'}`}>{ch.title}</h4>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+{ch.xp_reward} XP</span>
                          <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">🪙 {ch.coin_reward}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ch.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${challengeTypeColors[ch.challenge_type]}`}>
                          {typeLabel[ch.challenge_type]}
                        </span>
                        {!done && (
                          <button onClick={() => onCompleteChallenge(ch.id, ch.xp_reward, ch.coin_reward)}
                            className="text-[11px] font-bold text-white px-3 py-1.5 rounded-xl active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                            Selesaikan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'board' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-5 text-center mb-4">
              <Trophy size={28} className="text-amber-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-base">Papan Peringkat</h3>
              <p className="text-blue-200 text-xs mt-1">Top 10 pelajar paling aktif</p>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 size={28} className="animate-spin text-blue-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Memuat...</p>
              </div>
            ) : leaderboard.map((entry, i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              const name = (entry as UserGamification & { profiles?: { full_name: string } }).profiles?.full_name || 'Pengguna';
              return (
                <div key={entry.id} className={`flex items-center gap-3 p-4 rounded-2xl shadow-card border ${i < 3 ? 'border-amber-200 bg-amber-50' : 'bg-white border-slate-50'}`}>
                  <div className="w-8 text-center">
                    {medal ? <span className="text-xl">{medal}</span> : <span className="text-sm font-bold text-slate-400">#{i + 1}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{name}</p>
                    <p className="text-xs text-slate-400">Level {calcLevel(entry.xp)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-amber-700">{entry.xp}</p>
                    <p className="text-[10px] text-slate-400">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MARKETPLACE SCREEN ─── */
function MarketplaceScreen({ listings, myListings, onAddListing }: {
  listings: MarketplaceListing[]; myListings: MarketplaceListing[]; onAddListing: (l: Partial<MarketplaceListing>) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<'browse' | 'mine'>('browse');
  const [form, setForm] = useState({ title: '', description: '', category: 'Desain', price: '', price_type: 'fixed' as const, delivery_days: '7', tags: '' });
  const [loading, setLoading] = useState(false);

  const categories = ['Desain', 'Penulisan', 'Pemrograman', 'Pemasaran', 'Administrasi', 'Lainnya'];
  const categoryColors: Record<string, string> = {
    Desain: 'bg-blue-100 text-blue-700', Penulisan: 'bg-green-100 text-green-700',
    Pemrograman: 'bg-purple-100 text-purple-700', Pemasaran: 'bg-orange-100 text-orange-700',
    Administrasi: 'bg-cyan-100 text-cyan-700', Lainnya: 'bg-slate-100 text-slate-700',
  };

  const handleAdd = async () => {
    setLoading(true);
    await onAddListing({
      title: form.title, description: form.description, category: form.category,
      price: parseInt(form.price) || 0, price_type: form.price_type,
      delivery_days: parseInt(form.delivery_days) || 7,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setLoading(false);
    setShowAdd(false);
    setForm({ title: '', description: '', category: 'Desain', price: '', price_type: 'fixed', delivery_days: '7', tags: '' });
  };

  const inputCls = 'w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:bg-white transition-all';
  const display = tab === 'browse' ? listings : myListings;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Inclusive Marketplace" subtitle="Jual jasa & karya kreatifmu"
        right={
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
            <Plus size={18} />
          </button>
        }
      />
      <div className="flex bg-white border-b border-slate-100 px-4">
        {([{ id: 'browse', label: '🛍 Jelajahi' }, { id: 'mine', label: '📦 Milikku' }] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-bold transition-all ${tab === t.id ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag size={48} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">{tab === 'browse' ? 'Belum ada listing' : 'Belum ada jasa yang kamu jual'}</p>
            <p className="text-slate-400 text-sm mt-1">{tab === 'mine' ? 'Mulai jual jasamu sekarang' : 'Jadilah yang pertama berjualan'}</p>
            {tab === 'mine' && (
              <button onClick={() => setShowAdd(true)}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-2xl active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                <Plus size={16} /> Tambah Listing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {display.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl p-4 shadow-card border border-slate-50">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #e3f2fd, #e0f7fa)' }}>
                    {listing.category === 'Desain' ? '🎨' : listing.category === 'Penulisan' ? '✍️' : listing.category === 'Pemrograman' ? '💻' : '🌟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{listing.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[listing.category] || 'bg-slate-100 text-slate-600'}`}>
                        {listing.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-bold text-blue-700 text-sm">
                        {listing.price_type === 'negotiable' ? 'Negosiasi' : `Rp ${listing.price.toLocaleString('id-ID')}`}
                        {listing.price_type === 'hourly' ? '/jam' : ''}
                      </span>
                      <span className="text-[11px] text-slate-400">⏱ {listing.delivery_days} hari</span>
                      <span className="text-[11px] text-amber-500">⭐ {listing.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Eye size={10} /> {listing.views} lihat
                        <span className="mx-1">·</span>
                        <ShoppingBag size={10} /> {listing.orders} pesanan
                      </div>
                      <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 active:scale-95 transition-transform">
                        <ExternalLink size={12} /> Hubungi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add listing sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl flex flex-col animate-slide-up" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-0" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Tambah Layanan</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3.5">
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Judul Layanan *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="mis. Desain Logo Profesional" className={inputCls} /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Deskripsi *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Jelaskan layanan yang kamu tawarkan..."
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:bg-white resize-none transition-all" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tipe Harga</label>
                  <select value={form.price_type} onChange={e => setForm(f => ({ ...f, price_type: e.target.value as 'fixed' | 'hourly' | 'negotiable' }))} className={inputCls}>
                    <option value="fixed">Tetap</option><option value="hourly">Per Jam</option><option value="negotiable">Negosiasi</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Harga (Rp)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="150000" className={inputCls} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Estimasi (hari)</label>
                  <input type="number" value={form.delivery_days} onChange={e => setForm(f => ({ ...f, delivery_days: e.target.value }))} placeholder="7" className={inputCls} /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tags (pisah dengan koma)</label>
                <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Desain, Kreatif, Remote" className={inputCls} /></div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button onClick={handleAdd} disabled={loading || !form.title || !form.description}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {loading ? 'Menyimpan...' : 'Publikasikan Layanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PROFILE SCREEN ─── */
function ProfileScreen({ gamification, onSignOut }: { gamification: UserGamification | null; onSignOut: () => void }) {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    job_title: '',
    disability_type: '',
    location: '',
    phone: '',
    bio: '',
    available_for_work: false,
    skills: [] as Skill[],
    work_experience: [] as WorkExperience[],
  });
  const [activeSection, setActiveSection] = useState<'view' | 'edit-info' | 'edit-bio' | 'edit-skills' | 'edit-work'>('view');
  const [newSkill, setNewSkill] = useState({ name: '', level: 80 });
  const [newWork, setNewWork] = useState({ title: '', company: '', period: '', description: '' });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        job_title: profile.job_title || '',
        disability_type: profile.disability_type || '',
        location: profile.location || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        available_for_work: profile.available_for_work || false,
        skills: (profile.skills as Skill[]) || [],
        work_experience: (profile.work_experience as WorkExperience[]) || [],
      });
    }
  }, [profile]);

  const handleSignOut = async () => { await signOut(); onSignOut(); };

  const handleSave = async (fields: Partial<typeof form>) => {
    if (!profile) return;
    setSaving(true);
    const updateData: Record<string, unknown> = {};
    Object.entries(fields).forEach(([k, v]) => { updateData[k] = v === '' ? null : v; });
    const { error } = await supabase.from('profiles').update(updateData).eq('id', profile.id);
    if (!error) { await refreshProfile(); setActiveSection('view'); }
    setSaving(false);
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    const updated = [...form.skills, { name: newSkill.name.trim(), level: newSkill.level }];
    setForm(f => ({ ...f, skills: updated }));
    setNewSkill({ name: '', level: 80 });
  };

  const removeSkill = (i: number) => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const addWork = () => {
    if (!newWork.title.trim() || !newWork.company.trim()) return;
    const updated: WorkExperience[] = [...form.work_experience, { id: Date.now().toString(), ...newWork }];
    setForm(f => ({ ...f, work_experience: updated }));
    setNewWork({ title: '', company: '', period: '', description: '' });
  };

  const removeWork = (id: string) => setForm(f => ({ ...f, work_experience: f.work_experience.filter(w => w.id !== id) }));

  const dbBadges: string[] = gamification?.badges ?? [];
  const inputCls = 'w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';
  const avgMatchScore = 70;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Profil" onBack={activeSection !== 'view' ? () => setActiveSection('view') : undefined}
        right={activeSection === 'view' ? (
          <button onClick={() => setActiveSection('edit-info')}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
            <Pencil size={14} /> Edit Profil
          </button>
        ) : saving ? (
          <Loader2 size={18} className="text-blue-500 animate-spin" />
        ) : null}
      />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Banner */}
        <div className="relative h-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1F3A60 0%, #3582B8 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        {/* Avatar + Header Card */}
        <div className="px-4 -mt-10 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                {gamification && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                    {calcLevel(gamification.xp)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 text-xl leading-tight">{profile?.full_name || 'Pengguna'}</h2>
                {profile?.job_title && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {profile.job_title}{profile.location ? ` | ${profile.location}` : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    <Sparkles size={8} /> Matching {avgMatchScore}%
                  </span>
                  {profile?.disability_type && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      ♿ Adaptive Skills
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${form.available_for_work ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {form.available_for_work ? '✓ Available for Work' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact row */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1.5">
              {profile?.location && (
                <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} className="text-blue-400" />{profile.location}</span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12} className="text-blue-400" />{user.email}</span>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1 text-xs text-slate-500"><Phone size={12} className="text-blue-400" />{profile.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* EDIT-INFO Section */}
        {activeSection === 'edit-info' && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Edit Informasi Dasar</h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className={`${inputCls} pl-9`} placeholder="Nama lengkap" /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jabatan / Profesi</label>
                <div className="relative"><Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} className={`${inputCls} pl-9`} placeholder="Web Developer, Designer, dll." /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Disabilitas</label>
                <select value={form.disability_type} onChange={e => setForm(f => ({ ...f, disability_type: e.target.value }))} className={inputCls}>
                  <option value="">Tidak ada / Tidak ingin menyebutkan</option>
                  <option value="Disabilitas Netra">Disabilitas Netra</option>
                  <option value="Disabilitas Rungu">Disabilitas Rungu/Tuli</option>
                  <option value="Disabilitas Fisik">Disabilitas Fisik/Motorik</option>
                  <option value="Disabilitas Intelektual">Disabilitas Intelektual</option>
                  <option value="Disabilitas Mental">Disabilitas Psikososial/Mental</option>
                  <option value="Disabilitas Ganda">Disabilitas Ganda</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lokasi</label>
                <div className="relative"><MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={`${inputCls} pl-9`} placeholder="Jakarta, Bandung, dll." /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Telepon</label>
                <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={`${inputCls} pl-9`} placeholder="08xxxxxxxxxx" /></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Available for Work</p>
                  <p className="text-xs text-slate-400">Tampilkan status ke perusahaan</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, available_for_work: !f.available_for_work }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.available_for_work ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available_for_work ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setActiveSection('view')} className="flex-1 py-3 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl active:scale-95 transition-transform">Batal</button>
                <button onClick={() => handleSave({ full_name: form.full_name, job_title: form.job_title, disability_type: form.disability_type, location: form.location, phone: form.phone, available_for_work: form.available_for_work })}
                  disabled={saving}
                  className="flex-1 py-3 text-sm font-bold text-white rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN VIEW */}
        {activeSection === 'view' && (
          <div className="px-4 space-y-4">
            {/* Tentang Saya */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-700 text-sm">Tentang Saya</h3>
                <button onClick={() => setActiveSection('edit-bio')} className="text-xs text-blue-500 font-semibold flex items-center gap-1"><Pencil size={12} />Edit</button>
              </div>
              {profile?.bio ? (
                <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
              ) : (
                <button onClick={() => setActiveSection('edit-bio')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                  + Tambah bio / deskripsi diri
                </button>
              )}
            </div>

            {/* Keterampilan Saya */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-700 text-sm">Keterampilan Saya</h3>
                <button onClick={() => setActiveSection('edit-skills')} className="text-xs text-blue-500 font-semibold flex items-center gap-1"><Pencil size={12} />Edit</button>
              </div>
              {form.skills.length > 0 ? (
                <div className="space-y-3">
                  {form.skills.map((skill, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{skill.name}</span>
                        <span className="text-xs font-bold" style={{ color: '#3582B8' }}>{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${skill.level}%`, background: 'linear-gradient(90deg, #3582B8, #85B6D6)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setActiveSection('edit-skills')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                  + Tambah keterampilan
                </button>
              )}
            </div>

            {/* Riwayat Pekerjaan */}
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-700 text-sm">Riwayat Pekerjaan</h3>
                <button onClick={() => setActiveSection('edit-work')} className="text-xs text-blue-500 font-semibold flex items-center gap-1"><Pencil size={12} />Edit</button>
              </div>
              {form.work_experience.length > 0 ? (
                <div className="space-y-3">
                  {form.work_experience.map(w => (
                    <div key={w.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{w.title}</p>
                        <p className="text-xs text-slate-500">{w.company}{w.period ? ` · ${w.period}` : ''}</p>
                        {w.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">- {w.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => setActiveSection('edit-work')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                  + Tambah riwayat pekerjaan
                </button>
              )}
            </div>

            {/* Sertifikasi */}
            {dbBadges.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-4">
                <h3 className="font-bold text-blue-700 text-sm mb-3">Sertifikasi</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dbBadges.map(b => (
                    <div key={b} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Award size={18} className="text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-amber-800 leading-tight">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* XP Stats */}
            {gamification && (
              <div className="bg-white rounded-2xl shadow-card p-4">
                <h3 className="font-bold text-slate-700 text-sm mb-3">Statistik Gamifikasi</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'XP', value: gamification.xp, color: '#d97706' },
                    { label: 'Coins', value: gamification.coins, color: '#f59e0b' },
                    { label: 'Streak', value: `${gamification.streak_days}d`, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl py-3">
                      <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleSignOut} className="w-full bg-red-50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform border border-red-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><LogOut size={18} className="text-red-500" /></div>
              <div className="flex-1 text-left"><p className="text-sm font-semibold text-red-600">Keluar</p><p className="text-xs text-red-400">Logout dari akun</p></div>
            </button>
          </div>
        )}

        {/* EDIT BIO */}
        {activeSection === 'edit-bio' && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Tentang Saya</h3>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={5} className={`${inputCls} resize-none`}
                placeholder="Ceritakan sedikit tentang dirimu, pengalaman, dan tujuan karirmu..." />
              <div className="flex gap-2">
                <button onClick={() => setActiveSection('view')} className="flex-1 py-3 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl">Batal</button>
                <button onClick={() => handleSave({ bio: form.bio })} disabled={saving}
                  className="flex-1 py-3 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT SKILLS */}
        {activeSection === 'edit-skills' && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Keterampilan Saya</h3>
              {form.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{skill.name}</span>
                      <span className="text-xs text-blue-600 font-bold">{skill.level}%</span>
                    </div>
                    <input type="range" min={10} max={100} value={skill.level}
                      onChange={e => { const s = [...form.skills]; s[i] = { ...s[i], level: +e.target.value }; setForm(f => ({ ...f, skills: s })); }}
                      className="w-full h-2 rounded-full accent-blue-500" />
                  </div>
                  <button onClick={() => removeSkill(i)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-xs font-bold text-slate-500">Tambah Keterampilan</p>
                <div className="flex gap-2">
                  <input value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
                    placeholder="Nama skill" className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-400" />
                  <input type="number" min={10} max={100} value={newSkill.level}
                    onChange={e => setNewSkill(s => ({ ...s, level: Math.min(100, Math.max(10, +e.target.value)) }))}
                    className="w-16 px-2 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none text-center focus:border-blue-400" />
                  <button onClick={addSkill} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                    <PlusCircle size={16} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveSection('view')} className="flex-1 py-3 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl">Batal</button>
                <button onClick={() => handleSave({ skills: form.skills })} disabled={saving}
                  className="flex-1 py-3 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT WORK EXPERIENCE */}
        {activeSection === 'edit-work' && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Pekerjaan</h3>
              {form.work_experience.map(w => (
                <div key={w.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{w.title}</p>
                    <p className="text-xs text-slate-500">{w.company}{w.period ? ` · ${w.period}` : ''}</p>
                    {w.description && <p className="text-xs text-slate-400 mt-1">- {w.description}</p>}
                  </div>
                  <button onClick={() => removeWork(w.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-xs font-bold text-slate-500">Tambah Pengalaman</p>
                <input value={newWork.title} onChange={e => setNewWork(w => ({ ...w, title: e.target.value }))} placeholder="Jabatan / Posisi" className={inputCls} />
                <input value={newWork.company} onChange={e => setNewWork(w => ({ ...w, company: e.target.value }))} placeholder="Nama perusahaan" className={inputCls} />
                <input value={newWork.period} onChange={e => setNewWork(w => ({ ...w, period: e.target.value }))} placeholder="Periode (2020 - 2022)" className={inputCls} />
                <input value={newWork.description} onChange={e => setNewWork(w => ({ ...w, description: e.target.value }))} placeholder="Deskripsi singkat" className={inputCls} />
                <button onClick={addWork}
                  className="w-full py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3582B8, #85B6D6)' }}>
                  <PlusCircle size={15} /> Tambah
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveSection('view')} className="flex-1 py-3 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl">Batal</button>
                <button onClick={() => handleSave({ work_experience: form.work_experience })} disabled={saving}
                  className="flex-1 py-3 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function JobSeekerApp({ activeTab, onTabChange, onSignOut }: {
  activeTab: string; onTabChange: (t: string) => void; onSignOut: () => void;
}) {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [j, a, m, e, g, ch, comp, l, ml] = await Promise.all([
      supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('applications').select('*, jobs(*)').order('applied_at', { ascending: false }),
      supabase.from('training_modules').select('*').eq('is_active', true),
      supabase.from('enrollments').select('*, training_modules(*)'),
      supabase.from('user_gamification').select('*').eq('user_id', user!.id).maybeSingle(),
      supabase.from('daily_challenges').select('*').eq('is_active', true),
      supabase.from('challenge_completions').select('*, daily_challenges(*)').eq('user_id', user!.id),
      supabase.from('marketplace_listings').select('*, profiles(full_name, disability_type)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('marketplace_listings').select('*, profiles(full_name, disability_type)').eq('seller_id', user!.id),
    ]);
    if (j.data) setJobs(j.data as Job[]);
    if (a.data) setApplications(a.data as Application[]);
    if (m.data) setModules(m.data as TrainingModule[]);
    if (e.data) setEnrollments(e.data as Enrollment[]);
    if (g.data) setGamification(g.data as UserGamification);
    else {
      const { data: newG } = await supabase.from('user_gamification').insert({ user_id: user!.id }).select().maybeSingle();
      if (newG) setGamification(newG as UserGamification);
    }
    if (ch.data) setChallenges(ch.data as DailyChallenge[]);
    if (comp.data) setCompletions(comp.data as ChallengeCompletion[]);
    if (l.data) setListings(l.data as MarketplaceListing[]);
    if (ml.data) setMyListings(ml.data as MarketplaceListing[]);
    setLoading(false);
  };

  const handleEnroll = async (moduleId: string) => {
    await supabase.from('enrollments').insert({ module_id: moduleId });
    const mod = modules.find(m => m.id === moduleId);
    const xpGain = (mod?.duration_hours || 1) * 5;
    if (gamification) {
      const newXp = gamification.xp + xpGain;
      await supabase.from('user_gamification').update({ xp: newXp, level: calcLevel(newXp), updated_at: new Date().toISOString() }).eq('user_id', user!.id);
    }
    speak(`Berhasil daftar pelatihan! +${xpGain} XP`);
    fetchAll();
  };

  const handleCompleteChallenge = async (challengeId: string, xpReward: number, coinReward: number) => {
    const { error } = await supabase.from('challenge_completions').insert({ challenge_id: challengeId });
    if (!error && gamification) {
      const newXp = gamification.xp + xpReward;
      const newCoins = gamification.coins + coinReward;
      await supabase.from('user_gamification').update({ xp: newXp, coins: newCoins, level: calcLevel(newXp), updated_at: new Date().toISOString() }).eq('user_id', user!.id);
      speak(`Tantangan selesai! +${xpReward} XP dan ${coinReward} koin!`);
      fetchAll();
    }
  };

  const handleAddListing = async (listing: Partial<MarketplaceListing>) => {
    await supabase.from('marketplace_listings').insert({ ...listing, seller_id: user!.id });
    speak('Layanan berhasil dipublikasikan!');
    fetchAll();
  };

  const appliedIds = new Set(applications.map(a => a.job_id));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #3582B8 0%, #85B6D6 100%)' }} />
          <div className="flex gap-1">
            {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {activeTab === 'home' && <HomeScreen jobs={jobs} applications={applications} enrollments={enrollments} gamification={gamification} onJobPress={setSelectedJob} onTabChange={onTabChange} onApply={setApplyJob} />}
      {activeTab === 'jobs' && <JobsScreen jobs={jobs} applications={applications} onJobPress={setSelectedJob} />}
      {activeTab === 'training' && <TrainingScreen modules={modules} enrollments={enrollments} gamification={gamification} challenges={challenges} completions={completions} onEnroll={handleEnroll} onCompleteChallenge={handleCompleteChallenge} />}
      {activeTab === 'market' && <MarketplaceScreen listings={listings} myListings={myListings} onAddListing={handleAddListing} />}
      {activeTab === 'profile' && <ProfileScreen gamification={gamification} onSignOut={onSignOut} />}

      {selectedJob && (
        <JobDetailSheet job={selectedJob} applied={appliedIds.has(selectedJob.id)}
          matchScore={getMatchScore(selectedJob, useAuth().profile?.disability_type)}
          onClose={() => setSelectedJob(null)} onApply={() => { setSelectedJob(null); setApplyJob(selectedJob); }} />
      )}
      {applyJob && (
        <ApplySheet job={applyJob} onClose={() => setApplyJob(null)}
          onSuccess={() => { setApplyJob(null); fetchAll(); speak('Lamaran berhasil dikirim! +80 XP'); }} />
      )}
    </div>
  );
}
