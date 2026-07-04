import { useEffect, useState } from 'react';
import {
  Search, MapPin, Clock, DollarSign, CheckCircle, XCircle, Eye,
  Send, Star, BookOpen, X, AlertCircle, Loader2, ChevronRight,
  Bell, Zap, Users, LogOut, Phone,
  Flame, Trophy, Target, Plus, ShoppingBag, Sparkles, ExternalLink,
  Pencil, Save, User, Mail
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import {
  supabase, Job, Application, TrainingModule, Enrollment,
  UserGamification, DailyChallenge, ChallengeCompletion, MarketplaceListing,
  calcLevel, xpProgressInLevel, getMatchScore
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
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
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
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>{job.company_name[0]}</div>
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
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
              <Send size={18} /> Lamar Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── HOME SCREEN ─── */
function HomeScreen({ jobs, applications, enrollments, gamification, onJobPress, onTabChange }: {
  jobs: Job[]; applications: Application[]; enrollments: Enrollment[];
  gamification: UserGamification | null; onJobPress: (j: Job) => void; onTabChange: (t: string) => void;
}) {
  const { profile } = useAuth();
  const { settings } = useAccessibility();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const appliedIds = new Set(applications.map(a => a.job_id));
  const topJobs = jobs.slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative px-5 pt-12 pb-8 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div>
            <p className="text-blue-200 text-sm">{greeting},</p>
            <h1 className="text-xl font-bold text-white mt-0.5">{profile?.full_name?.split(' ')[0] || 'Pengguna'} 👋</h1>
            {profile?.disability_type && (
              <span className="inline-block bg-white/15 text-white text-xs font-medium px-2.5 py-1 rounded-full mt-1.5">
                ♿ {profile.disability_type}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </div>
            {settings.signLanguageAvatar && (
              <div className="bg-teal-400/20 border border-teal-400/30 rounded-xl px-2 py-1 text-center">
                <span className="text-xl">🤟</span>
                <p className="text-[9px] text-teal-200 font-bold">BISINDO</p>
              </div>
            )}
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
            <div className="flex items-center gap-1 flex-shrink-0"><Flame size={16} className="text-orange-500" /><span className="text-xs font-bold text-orange-600">{gamification.streak_days}</span></div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Lamaran', value: applications.length, color: '#3b82f6' },
          { label: 'Proses', value: applications.filter(a => ['reviewed', 'interview'].includes(a.status)).length, color: '#7c3aed' },
          { label: 'Pelatihan', value: enrollments.length, color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 shadow-card text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-6 pb-6">
        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Sparkles, label: 'AI Job Match', sub: 'Rekomendasi pintarku', tab: 'jobs', grad: ['#3b82f6','#1d4ed8'] },
              { icon: BookOpen, label: 'Game Training', sub: 'Kumpul XP & badge', tab: 'training', grad: ['#06b6d4','#0891b2'] },
              { icon: ShoppingBag, label: 'Marketplace', sub: 'Jual jasa & portfolio', tab: 'market', grad: ['#7c3aed','#5b21b6'] },
              { icon: Trophy, label: 'Leaderboard', sub: `Level ${gamification ? calcLevel(gamification.xp) : 1}`, tab: 'training', grad: ['#d97706','#b45309'] },
            ].map(({ icon: Icon, label, sub, tab, grad }) => (
              <button key={label} onClick={() => onTabChange(tab)}
                className="flex items-center gap-3 p-4 rounded-2xl text-white active:scale-95 transition-transform shadow-sm"
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-white" /></div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold leading-tight">{label}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI recommended jobs */}
        {topJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-700">AI Rekomendasi</h2>
              </div>
              <button onClick={() => onTabChange('jobs')} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">Lihat semua <ChevronRight size={14} /></button>
            </div>
            <div className="space-y-3">
              {topJobs.map(job => {
                const score = getMatchScore(job, profile?.disability_type);
                return (
                  <button key={job.id} onClick={() => onJobPress(job)}
                    className="w-full bg-white rounded-2xl p-4 shadow-card text-left active:scale-[0.98] transition-transform border border-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>{job.company_name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h3>
                          {appliedIds.has(job.id) && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500">{job.company_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <AIMatchBadge score={score} />
                          <span className="text-[10px] text-slate-400">{job.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.inclusivity_tags.slice(0, 2).map(t => (
                            <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[t] || 'bg-gray-100 text-gray-600'}`}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
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
              style={!selectedTag ? { background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' } : {}}>
              Semua
            </button>
            {allTags.map(t => (
              <button key={t} onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${selectedTag === t ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
                style={selectedTag === t ? { background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' } : {}}>
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
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>{job.company_name[0]}</div>
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
                        <div className="h-full rounded-full" style={{ width: `${e.progress}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
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
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
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
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
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
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
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
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
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
  const { profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    disability_type: '',
    location: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        disability_type: profile.disability_type || '',
        location: profile.location || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSignOut = async () => { await signOut(); onSignOut(); };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        disability_type: form.disability_type || null,
        location: form.location || null,
        phone: form.phone || null,
      })
      .eq('id', profile.id);

    if (!error) {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const dbBadges: string[] = gamification?.badges ?? [];
  const earnedBadges = dbBadges.length > 0 ? dbBadges : [];
  const inputCls = 'w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Profil Saya" right={
        editing ? (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        ) : (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 px-3 py-2 rounded-xl bg-blue-50 active:scale-95 transition-transform">
            <Pencil size={14} /> Edit
          </button>
        )
      } />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="relative h-32 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 100%)' }} />
        <div className="px-5 -mt-12 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                {gamification && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                    {calcLevel(gamification.xp)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="font-bold text-slate-900 text-lg leading-tight">{profile?.full_name || 'Pengguna'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Pencari Kerja</p>
                {profile?.disability_type && (
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mt-2">♿ {profile.disability_type}</span>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {editing ? (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nama lengkap" className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Jenis Disabilitas</label>
                  <select value={form.disability_type} onChange={e => setForm(f => ({ ...f, disability_type: e.target.value }))}
                    className={inputCls}>
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
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Lokasi / Kota</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Jakarta, Bandung, dll." className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nomor Telepon</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="08xxxxxxxxxx" className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <button onClick={() => setEditing(false)}
                  className="w-full py-2.5 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl active:scale-95 transition-transform">
                  Batal
                </button>
              </div>
            ) : (
              <>
                {gamification && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'XP', value: gamification.xp, color: '#d97706' },
                        { label: 'Coins', value: gamification.coins, color: '#f59e0b' },
                        { label: 'Streak', value: `${gamification.streak_days}d`, color: '#ef4444' },
                      ].map(s => (
                        <div key={s.label} className="bg-slate-50 rounded-xl py-2">
                          <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-slate-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-2">Badge Diperoleh</p>
                  {earnedBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {earnedBadges.map(b => (
                        <span key={b} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">{b}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Selesaikan tantangan harian untuk mendapatkan badge.</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {[
                    { icon: MapPin, label: profile?.location || 'Lokasi belum diisi' },
                    { icon: Phone, label: profile?.phone || 'Nomor belum diisi' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-slate-500">
                      <Icon size={14} className="text-slate-300" /> {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-5">
          <button onClick={handleSignOut} className="w-full bg-red-50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform border border-red-100 mt-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><LogOut size={18} className="text-red-500" /></div>
            <div className="flex-1 text-left"><p className="text-sm font-semibold text-red-600">Keluar</p><p className="text-xs text-red-400">Logout dari akun</p></div>
          </button>
        </div>
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
          <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }} />
          <div className="flex gap-1">
            {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {activeTab === 'home' && <HomeScreen jobs={jobs} applications={applications} enrollments={enrollments} gamification={gamification} onJobPress={setSelectedJob} onTabChange={onTabChange} />}
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
