import { useEffect, useState, useMemo } from 'react';
import {
  Briefcase, Plus, Users, Clock, CheckCircle, XCircle, Eye,
  Loader2, X, MapPin, DollarSign, AlertCircle, TrendingUp, Award,
  ChevronRight, LogOut, Building2, Phone, User, Bell, Zap,
  BarChart3, PieChart, Activity, Target, Heart, Accessibility,
  Check, AlertTriangle, Wallet, HandHeart, Settings, Shield,
  Lightbulb, Smile, Frown, Meh, Star, Calendar, BookOpen
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { supabase, Job, Application, CsrProgram } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const statusConfig: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: Clock },
  reviewed: { label: 'Ditinjau', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: Eye },
  interview: { label: 'Wawancara', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', icon: Users },
  accepted: { label: 'Diterima', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400', icon: XCircle },
};

const tagOptions = ['Ramah Netra', 'Ramah Tuli', 'Ramah Fisik', 'Remote', 'Fleksibel', 'Part-Time', 'Entry-Level', 'Tech-Friendly', 'Hybrid'];
const tagColors: Record<string, string> = {
  'Ramah Netra': 'bg-blue-100 text-blue-700', 'Ramah Tuli': 'bg-teal-100 text-teal-700',
  'Ramah Fisik': 'bg-green-100 text-green-700', 'Remote': 'bg-purple-100 text-purple-700',
  'Fleksibel': 'bg-orange-100 text-orange-700', 'Part-Time': 'bg-pink-100 text-pink-700',
  'Entry-Level': 'bg-yellow-100 text-yellow-700', 'Tech-Friendly': 'bg-indigo-100 text-indigo-700',
  'Hybrid': 'bg-cyan-100 text-cyan-700',
};
const jobTypeLabel: Record<string, string> = { full_time: 'Full Time', part_time: 'Part Time', remote: 'Remote', hybrid: 'Hybrid' };

interface PostJobSheetProps {
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function PostJobSheet({ companyName, onClose, onSuccess }: PostJobSheetProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', company_name: companyName, location: '', job_type: 'full_time' as Job['job_type'],
    salary_min: '', salary_max: '', description: '', requirements: '', inclusivity_tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleTag = (tag: string) => setForm(f => ({
    ...f,
    inclusivity_tags: f.inclusivity_tags.includes(tag) ? f.inclusivity_tags.filter(t => t !== tag) : [...f.inclusivity_tags, tag],
  }));

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.description) { setError('Judul, lokasi, dan deskripsi wajib diisi.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.from('jobs').insert({
      employer_id: user!.id,
      title: form.title, company_name: form.company_name || companyName,
      location: form.location, job_type: form.job_type,
      salary_min: form.salary_min ? parseInt(form.salary_min as string) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max as string) : null,
      description: form.description, requirements: form.requirements,
      inclusivity_tags: form.inclusivity_tags,
    });
    setLoading(false);
    if (error) setError('Gagal memposting. Coba lagi.');
    else onSuccess();
  };

  const inputCls = 'w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-t-3xl flex flex-col animate-slide-up" style={{ maxHeight: '92vh' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-0" />
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Posting Lowongan Baru</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 transition-transform">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Judul Posisi *</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="mis. UI/UX Designer Senior" required className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Nama Perusahaan *</label>
              <input type="text" value={form.company_name} onChange={update('company_name')} placeholder="Nama perusahaan" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Lokasi *</label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="Jakarta, Remote..." required className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Tipe Pekerjaan</label>
            <select value={form.job_type} onChange={update('job_type')} className={inputCls}>
              <option value="full_time">Penuh Waktu</option>
              <option value="part_time">Paruh Waktu</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Gaji Min (Rp)</label>
              <input type="number" value={form.salary_min} onChange={update('salary_min')} placeholder="3000000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Gaji Max (Rp)</label>
              <input type="number" value={form.salary_max} onChange={update('salary_max')} placeholder="8000000" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Deskripsi *</label>
            <textarea value={form.description} onChange={update('description')} rows={4} placeholder="Jelaskan tanggung jawab, benefit, dan lingkungan kerja inklusif..." required
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Persyaratan</label>
            <textarea value={form.requirements} onChange={update('requirements')} rows={2} placeholder="Pengalaman, keahlian, atau kualifikasi..."
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Tag Inklusivitas</label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    form.inclusivity_tags.includes(tag) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100">
          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? 'Memposting...' : 'Posting Lowongan'}
          </button>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}

/* ─── HOME SCREEN ─── */
function HomeScreen({ jobs, applications, onTabChange, onPostJob }: {
  jobs: Job[]; applications: Application[]; onTabChange: (t: string) => void; onPostJob: () => void;
}) {
  const { profile } = useAuth();
  const companyName = profile?.company_name || profile?.full_name || 'Perusahaan';

  const stats = [
    { label: 'Lowongan Aktif', value: jobs.filter(j => j.is_active).length, color: '#1565c0', bg: '#eff6ff' },
    { label: 'Total Pelamar', value: applications.length, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Menunggu Review', value: applications.filter(a => a.status === 'pending').length, color: '#d97706', bg: '#fffbeb' },
    { label: 'Diterima', value: applications.filter(a => a.status === 'accepted').length, color: '#059669', bg: '#f0fdf4' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-8 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0B1B6B 0%, #1565c0 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div>
            <p className="text-blue-200 text-sm">Dashboard Perusahaan</p>
            <h1 className="text-xl font-bold text-white mt-0.5">{companyName}</h1>
            {profile?.company_size && (
              <span className="inline-block bg-white/15 text-white text-xs font-medium px-2.5 py-1 rounded-full mt-1.5">
                🏢 {profile.company_size} karyawan
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </div>
        </div>

        {/* Post job button */}
        <button onClick={onPostJob}
          className="relative z-10 w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg active:scale-[0.98] transition-transform">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1565c0, #0097a7)' }}>
            <Plus size={16} className="text-white" />
          </div>
          <span className="text-slate-600 text-sm font-semibold">Posting lowongan baru...</span>
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4 mb-6 grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-6 pb-6">
        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Plus, label: 'Posting Lowongan', sub: 'Rekrut talenta', action: () => onPostJob(), grad: ['#1565c0','#0d47a1'] },
              { icon: Users, label: 'Lihat Pelamar', sub: `${applications.length} pelamar`, action: () => onTabChange('applicants'), grad: ['#7c3aed','#5b21b6'] },
              { icon: Briefcase, label: 'Kelola Lowongan', sub: `${jobs.length} lowongan`, action: () => onTabChange('my-jobs'), grad: ['#0097a7','#006064'] },
              { icon: Award, label: 'Profil Perusahaan', sub: 'Informasi bisnis', action: () => onTabChange('profile'), grad: ['#d97706','#b45309'] },
            ].map(({ icon: Icon, label, sub, action, grad }) => (
              <button key={label} onClick={action}
                className="flex items-center gap-3 p-4 rounded-2xl text-white active:scale-95 transition-transform shadow-sm"
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold leading-tight">{label}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        {applications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Pelamar Terbaru</h2>
              <button onClick={() => onTabChange('applicants')} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                Lihat semua <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2.5">
              {applications.slice(0, 3).map(app => {
                const cfg = statusConfig[app.status];
                const candidate = app.profiles;
                return (
                  <div key={app.id} className="bg-white rounded-2xl p-4 shadow-card border border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
                        {candidate?.full_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{candidate?.full_name || 'Kandidat'}</p>
                        <p className="text-xs text-slate-400 truncate">{app.jobs?.title || 'Posisi'}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MY JOBS SCREEN ─── */
function MyJobsScreen({ jobs, applications, onToggle, onPostJob }: {
  jobs: Job[]; applications: Application[]; onToggle: (id: string, active: boolean) => void; onPostJob: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Lowongan Saya" subtitle={`${jobs.length} lowongan`}
        right={
          <button onClick={onPostJob} className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
            <Plus size={14} /> Posting
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase size={48} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Belum ada lowongan</p>
            <button onClick={onPostJob} className="mt-3 flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-2xl active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
              <Plus size={16} /> Posting Sekarang
            </button>
          </div>
        ) : jobs.map(job => {
          const jobApps = applications.filter(a => a.job_id === job.id);
          return (
            <div key={job.id} className={`bg-white rounded-2xl p-4 shadow-card border ${job.is_active ? 'border-slate-50' : 'border-slate-200 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {job.is_active ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                    <span>·</span>
                    <span>{jobTypeLabel[job.job_type]}</span>
                  </div>
                </div>
                <button onClick={() => onToggle(job.id, job.is_active)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors active:scale-95 flex-shrink-0 ${
                    job.is_active ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50'
                  }`}>
                  {job.is_active ? 'Nonaktif' : 'Aktifkan'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.inclusivity_tags.map(t => (
                  <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[t] || 'bg-gray-100 text-gray-600'}`}>{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={12} /> {jobApps.length} pelamar
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── APPLICANTS SCREEN ─── */
function ApplicantsScreen({ applications, onUpdateStatus, updatingId }: {
  applications: Application[]; onUpdateStatus: (id: string, status: Application['status']) => void; updatingId: string | null;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Pelamar" subtitle={`${applications.length} total pelamar`} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={48} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Belum ada pelamar</p>
          </div>
        ) : applications.map(app => {
          const cfg = statusConfig[app.status];
          const candidate = app.profiles;
          const job = app.jobs;
          const isExpanded = expandedId === app.id;
          return (
            <div key={app.id} className="bg-white rounded-2xl shadow-card border border-slate-50 overflow-hidden">
              <button className="w-full p-4 text-left active:bg-slate-50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : app.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
                    {candidate?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{candidate?.full_name || 'Kandidat'}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{job?.title || 'Posisi'}</p>
                        {candidate?.disability_type && (
                          <span className="inline-block text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full mt-1">
                            ♿ {candidate.disability_type}
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 px-4 pb-4 space-y-3">
                  {app.cover_letter && (
                    <div className="bg-slate-50 rounded-2xl p-3 mt-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Surat Lamaran</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{app.cover_letter}"</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Ubah Status</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(statusConfig) as Application['status'][]).map(status => {
                        const sCfg = statusConfig[status];
                        return (
                          <button key={status}
                            onClick={() => onUpdateStatus(app.id, status)}
                            disabled={updatingId === app.id}
                            className={`flex items-center justify-center gap-1 text-[10px] font-bold py-2 rounded-xl border transition-all active:scale-95 ${
                              app.status === status ? `${sCfg.color}` : 'border-slate-200 text-slate-500 bg-white'
                            }`}>
                            {updatingId === app.id ? <Loader2 size={10} className="animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />}
                            {sCfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PROFILE SCREEN ─── */
function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  const { profile, signOut } = useAuth();
  const handleSignOut = async () => { await signOut(); onSignOut(); };
  const companyName = profile?.company_name || profile?.full_name || 'Perusahaan';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Profil Perusahaan" />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="relative h-32 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0B1B6B 0%, #1565c0 100%)' }} />
        <div className="px-5 -mt-12 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
                {companyName[0]}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="font-bold text-slate-900 text-lg leading-tight">{companyName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Perusahaan Mitra</p>
                {profile?.company_size && (
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mt-2">
                    {profile.company_size} karyawan
                  </span>
                )}
              </div>
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
          </div>
        </div>

        <div className="px-5 space-y-2">
          {[
            { icon: Building2, label: 'Informasi Perusahaan', desc: 'Nama, ukuran, industri' },
            { icon: Zap, label: 'Program Inklusivitas', desc: 'Fasilitas & akomodasi' },
            { icon: TrendingUp, label: 'Statistik Rekrutmen', desc: 'Laporan dan analitik' },
          ].map(({ icon: Icon, label, desc }) => (
            <button key={label} className="w-full bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}

          <button onClick={handleSignOut}
            className="w-full bg-red-50 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform border border-red-100 mt-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <LogOut size={18} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-red-600">Keluar</p>
              <p className="text-xs text-red-400">Logout dari akun</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CSR PROGRAM SHEET ─── */
interface CsrSheetProps {
  onClose: () => void;
  onSuccess: () => void;
}
function CsrSheet({ onClose, onSuccess }: CsrSheetProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', budget: '', target_beneficiaries: '', category: 'training', start_date: '', end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.budget) { setError('Judul dan anggaran wajib diisi.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.from('csr_programs').insert({
      employer_id: user!.id,
      title: form.title,
      description: form.description,
      budget: parseInt(form.budget),
      target_beneficiaries: parseInt(form.target_beneficiaries) || 10,
      category: form.category,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
    setLoading(false);
    if (error) setError('Gagal membuat program. Coba lagi.');
    else onSuccess();
  };

  const inputCls = 'w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-t-3xl flex flex-col animate-slide-up" style={{ maxHeight: '92vh' }}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Program CSR Baru</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 transition-transform">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3.5">
          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl"><AlertCircle size={14} /> {error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Nama Program *</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="mis. Pelatihan Digital untuk Disabilitas" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Deskripsi</label>
            <textarea value={form.description} onChange={update('description')} rows={3} placeholder="Jelaskan tujuan dan dampak program..." className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Anggaran (Rp) *</label>
              <input type="number" value={form.budget} onChange={update('budget')} placeholder="50000000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Target Beneficiary</label>
              <input type="number" value={form.target_beneficiaries} onChange={update('target_beneficiaries')} placeholder="50" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Kategori</label>
            <select value={form.category} onChange={update('category')} className={inputCls}>
              <option value="training">Pelatihan & Edukasi</option>
              <option value="employment">Ketenagakerjaan</option>
              <option value="accessibility">Aksesibilitas</option>
              <option value="technology">Teknologi Assistif</option>
              <option value="community">Pemberdayaan Komunitas</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Tanggal Mulai</label>
              <input type="date" value={form.start_date} onChange={update('start_date')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Tanggal Selesai</label>
              <input type="date" value={form.end_date} onChange={update('end_date')} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100">
          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <HandHeart size={18} />}
            {loading ? 'Membuat...' : 'Buat Program CSR'}
          </button>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}

/* ─── INCLUSION ANALYTICS SCREEN ─── */
function InclusionAnalyticsScreen({ applications, jobs }: { applications: Application[]; jobs: Job[] }) {
  const stats = useMemo(() => {
    const totalApps = applications.length;
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const interview = applications.filter(a => a.status === 'interview').length;
    const disabilityHired = applications.filter(a => a.status === 'accepted' && a.profiles?.disability_type).length;
    const acceptanceRate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;
    const disabilityRate = accepted > 0 ? Math.round((disabilityHired / accepted) * 100) : 0;
    const inclusivityScore = Math.min(100, Math.round((disabilityRate * 0.4) + (acceptanceRate * 0.3) + (jobs.filter(j => j.inclusivity_tags.length > 0).length / Math.max(1, jobs.length) * 100 * 0.3)));
    return { totalApps, accepted, pending, interview, disabilityHired, acceptanceRate, disabilityRate, inclusivityScore };
  }, [applications, jobs]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; disability: number }> = {};
    applications.forEach(app => {
      const month = new Date(app.applied_at).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      if (!months[month]) months[month] = { total: 0, disability: 0 };
      months[month].total++;
      if (app.profiles?.disability_type) months[month].disability++;
    });
    return Object.entries(months).slice(-6);
  }, [applications]);

  const disabilityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.filter(a => a.profiles?.disability_type).forEach(app => {
      const type = app.profiles!.disability_type!;
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [applications]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Excellent' };
    if (score >= 60) return { text: 'text-blue-600', bg: 'bg-blue-100', label: 'Good' };
    if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-100', label: 'Fair' };
    return { text: 'text-red-600', bg: 'bg-red-100', label: 'Needs Work' };
  };

  const scoreStyle = getScoreColor(stats.inclusivityScore);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Analitik Inklusi" subtitle="Dashboard KPI inklusivitas" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Inclusion Score */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Skor Inklusivitas</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.inclusivityScore}<span className="text-lg text-slate-400">/100</span></p>
            </div>
            <div className={`px-3 py-1.5 rounded-full ${scoreStyle.bg}`}>
              <span className={`text-xs font-bold ${scoreStyle.text}`}>{scoreStyle.label}</span>
            </div>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ width: `${stats.inclusivityScore}%`, background: 'linear-gradient(90deg, #1565c0, #0097a7)' }} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Lightbulb size={14} className="text-amber-500" />
            <p className="text-[11px] text-slate-500">Tingkat skor dengan merekrut lebih banyak kandidat disabilitas</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Pelamar', value: stats.totalApps, icon: Users, color: '#1565c0' },
            { label: 'Diterima', value: stats.accepted, icon: CheckCircle, color: '#059669' },
            { label: 'Disabilitas Diterima', value: stats.disabilityHired, icon: Heart, color: '#7c3aed' },
            { label: 'Rasio Inklusi', value: `${stats.disabilityRate}%`, icon: Target, color: '#d97706' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Funnel Rekrutmen</h3>
          <div className="space-y-2">
            {[
              { label: 'Lamaran Masuk', count: stats.totalApps, color: '#1565c0' },
              { label: 'Ditinjau', count: stats.totalApps - stats.pending, color: '#0ea5e9' },
              { label: 'Wawancara', count: stats.interview, color: '#7c3aed' },
              { label: 'Diterima', count: stats.accepted, color: '#059669' },
            ].map((item, idx) => {
              const max = Math.max(stats.totalApps, 1);
              const width = (item.count / max) * 100;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-24 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 rounded-lg transition-all" style={{ width: `${width}%`, backgroundColor: item.color }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disability Breakdown */}
        {disabilityBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Berdasarkan Jenis Disabilitas</h3>
            <div className="space-y-2">
              {disabilityBreakdown.map(([type, count], idx) => {
                const colors = ['#1565c0', '#7c3aed', '#059669', '#d97706', '#dc2626'];
                const color = colors[idx % colors.length];
                const pct = Math.round((count / stats.totalApps) * 100);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-600 w-24 truncate">{type}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {monthlyData.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Tren Bulanan</h3>
            <div className="flex items-end gap-2 h-20">
              {monthlyData.map(([month, data]) => {
                const max = Math.max(...monthlyData.map(([, d]) => d.total), 1);
                const height = (data.total / max) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex flex-col justify-end" style={{ height: 60 }}>
                      <div className="w-full rounded-t-md" style={{ height: `${height}%`, background: 'linear-gradient(180deg, #1565c0, #0d47a1)' }}>
                        {data.disability > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 rounded-t-md" style={{ height: `${(data.disability / data.total) * 100}%`, background: 'linear-gradient(180deg, #0097a7, #006064)' }} />
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-800" />
                <span className="text-[10px] text-slate-500">Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-700" />
                <span className="text-[10px] text-slate-500">Disabilitas</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CSR TRACKING SCREEN ─── */
function CsrTrackingScreen({ programs, onAddProgram }: { programs: CsrProgram[]; onAddProgram: () => void }) {
  const formatMoney = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const totalBudget = programs.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = programs.reduce((sum, p) => sum + p.spent, 0);
  const totalBeneficiaries = programs.reduce((sum, p) => sum + p.beneficiaries, 0);

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
    completed: { label: 'Selesai', color: 'bg-blue-100 text-blue-700' },
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-500' },
  };

  const categoryIcons: Record<string, React.ElementType> = {
    training: BookOpen,
    employment: Briefcase,
    accessibility: Accessibility,
    technology: Lightbulb,
    community: Users,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="CSR Tracking" subtitle="Kelola program CSR" right={
        <button onClick={onAddProgram} className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
          <Plus size={14} /> Tambah
        </button>
      } />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Anggaran', value: formatMoney(totalBudget), icon: Wallet, color: '#1565c0' },
            { label: 'Terpakai', value: formatMoney(totalSpent), icon: HandHeart, color: '#059669' },
            { label: 'Beneficiary', value: totalBeneficiaries, icon: Users, color: '#7c3aed' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-card text-center">
              <div className="w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
              <p className="text-[9px] text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Programs List */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-card text-center">
            <HandHeart size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Belum ada program CSR</p>
            <p className="text-xs text-slate-400 mt-1">Mulai program untuk mendukung komunitas disabilitas</p>
            <button onClick={onAddProgram} className="mt-4 flex items-center gap-2 mx-auto text-sm font-bold text-white px-5 py-2.5 rounded-2xl active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
              <Plus size={16} /> Buat Program
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map(program => {
              const Icon = categoryIcons[program.category] || HandHeart;
              const progress = program.budget > 0 ? Math.round((program.spent / program.budget) * 100) : 0;
              const beneficiaryProgress = program.target_beneficiaries > 0 ? Math.round((program.beneficiaries / program.target_beneficiaries) * 100) : 0;
              const status = statusConfig[program.status] || statusConfig.draft;
              return (
                <div key={program.id} className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{program.title}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{program.description || 'Tidak ada deskripsi'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Anggaran</span>
                        <span className="font-semibold text-slate-700">{progress}% terpakai</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-600" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Beneficiary</span>
                        <span className="font-semibold text-slate-700">{program.beneficiaries}/{program.target_beneficiaries}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: `${Math.min(beneficiaryProgress, 100)}%` }} />
                      </div>
                    </div>
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

/* ─── ACCESSIBILITY ASSESSMENT SCREEN ─── */
function AccessibilityAssessmentScreen() {
  const [categories, setCategories] = useState([
    { id: 'entrance', name: 'Akses Masuk', icon: Building2, items: [
      { id: 'ramp', label: 'Ramp kursi roda di pintu masuk', checked: false },
      { id: 'wide_door', label: 'Pintu lebar (min 90cm)', checked: false },
      { id: 'auto_door', label: 'Pintu otomatis/bantuan', checked: false },
      { id: 'signage', label: 'Penanda visual & braille', checked: false },
    ]},
    { id: 'interior', name: 'Area Interior', icon: Activity, items: [
      { id: 'elevator', label: 'Elevator/lift aksesibel', checked: false },
      { id: 'corridor', label: 'Koridor lebar bebas hambatan', checked: false },
      { id: 'flooring', label: 'Lantai anti slip/rata', checked: false },
      { id: 'lighting', label: 'Pencahayaan cukup & rata', checked: false },
    ]},
    { id: 'workstation', name: 'Area Kerja', icon: Briefcase, items: [
      { id: 'desk_adjust', label: 'Meja adjustable height', checked: false },
      { id: 'ergonomic', label: 'Kursi ergonomis', checked: false },
      { id: 'monitor_arm', label: 'Monitor arm/lengan', checked: false },
      { id: 'software', label: 'Software assistif tersedia', checked: false },
    ]},
    { id: 'restroom', name: 'Toilet', icon: Accessibility, items: [
      { id: 'accessible_toilet', label: 'Toilet aksesibel tersedia', checked: false },
      { id: 'grab_bars', label: 'Grab bar terpasang', checked: false },
      { id: 'emergency', label: 'Tombol darurat', checked: false },
      { id: 'wide_restroom', label: 'Ruang cukup untuk kursi roda', checked: false },
    ]},
    { id: 'emergency', name: 'Kesiapan Darurat', icon: AlertTriangle, items: [
      { id: 'visual_alarm', label: 'Alarm visual (strobe light)', checked: false },
      { id: 'evacuation', label: 'Rute evakuasi aksesibel', checked: false },
      { id: 'assembly', label: 'Titik kumpul aksesibel', checked: false },
      { id: 'trained_staff', label: 'Staf terlatih bantu disabilitas', checked: false },
    ]},
  ]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) }
        : cat
    ));
  };

  const calculateScore = () => {
    const total = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const checked = categories.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
    return Math.round((checked / total) * 100);
  };

  const getScoreStyle = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Excellent', icon: Smile };
    if (score >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', label: 'Good', icon: Meh };
    if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', label: 'Needs Improvement', icon: Frown };
    return { text: 'text-red-600', bg: 'bg-red-500', label: 'Critical', icon: Frown };
  };

  const score = calculateScore();
  const scoreStyle = getScoreStyle(score);
  const ScoreIcon = scoreStyle.icon;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title="Penilaian Aksesibilitas" subtitle="Audit infrastruktur kantor" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Score Card */}
        <div className="bg-white rounded-2xl p-5 shadow-card text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ScoreIcon size={32} className={scoreStyle.text} />
            <div className="text-left">
              <p className="text-3xl font-bold text-slate-900">{score}%</p>
              <p className="text-xs text-slate-500">{scoreStyle.label}</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${scoreStyle.bg}`} style={{ width: `${score}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {score >= 80 ? 'Kantor Anda sangat aksesibel!' : score >= 60 ? 'Layak, namun ada ruang perbaikan' : 'Perlu banyak perbaikan aksesibilitas'}
          </p>
        </div>

        {/* Categories */}
        {categories.map(category => {
          const Icon = category.icon;
          const checkedInCat = category.items.filter(i => i.checked).length;
          return (
            <div key={category.id} className="bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">{category.name}</h3>
                    <p className="text-[10px] text-slate-400">{checkedInCat}/{category.items.length} terpenuhi</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: checkedInCat === category.items.length ? '#05966920' : '#f1f5f9' }}>
                  {checkedInCat === category.items.length ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{Math.round((checkedInCat / category.items.length) * 100)}%</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {category.items.map(item => (
                  <button key={item.id} onClick={() => toggleItem(category.id, item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                      item.checked ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-transparent'
                    }`}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      item.checked ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                      {item.checked && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`text-xs text-left ${item.checked ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h4 className="text-sm font-bold text-slate-700">Rekomendasi</h4>
          </div>
          <ul className="space-y-2">
            {score < 80 && categories.flatMap(cat =>
              cat.items.filter(item => !item.checked).slice(0, 1).map(item => (
                <li key={item.id} className="flex items-start gap-2 text-xs text-slate-600">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Tambahkan "{item.label}" di kategori {cat.name}</span>
                </li>
              ))
            ).slice(0, 3)}
            {score >= 80 && (
              <li className="flex items-center gap-2 text-xs text-emerald-600">
                <Star size={12} className="text-amber-400" />
                <span>Kantor Anda sudah sangat aksesibel! Pertahankan standar ini.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN EMPLOYER APP ─── */
export default function EmployerApp({ activeTab, onTabChange, postJobTrigger, onSignOut }: {
  activeTab: string; onTabChange: (t: string) => void; postJobTrigger: number; onSignOut: () => void;
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [csrPrograms, setCsrPrograms] = useState<CsrProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [showCsrSheet, setShowCsrSheet] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (postJobTrigger > 0) setShowPostSheet(true);
  }, [postJobTrigger]);

  const fetchAll = async () => {
    setLoading(true);
    const [jobsRes, csrRes] = await Promise.all([
      supabase.from('jobs').select('*').eq('employer_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('csr_programs').select('*').eq('employer_id', user!.id).order('created_at', { ascending: false }),
    ]);
    const jobIds = (jobsRes.data ?? []).map((j: Job) => j.id);
    const appsRes = jobIds.length > 0
      ? await supabase.from('applications').select('*, jobs!inner(*), profiles(*)').in('job_id', jobIds).order('applied_at', { ascending: false })
      : { data: [] };
    if (jobsRes.data) setJobs(jobsRes.data as Job[]);
    if (appsRes.data) setApplications(appsRes.data as Application[]);
    if (csrRes.data) setCsrPrograms(csrRes.data as CsrProgram[]);
    setLoading(false);
  };

  const toggleJob = async (jobId: string, isActive: boolean) => {
    await supabase.from('jobs').update({ is_active: !isActive }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_active: !isActive } : j));
  };

  const updateStatus = async (appId: string, status: Application['status']) => {
    setUpdatingId(appId);
    await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', appId);
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    setUpdatingId(null);
  };

  const companyName = useAuth().profile?.company_name || useAuth().profile?.full_name || 'Perusahaan';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }} />
          <div className="flex gap-1">
            {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {activeTab === 'home' && <HomeScreen jobs={jobs} applications={applications} onTabChange={onTabChange} onPostJob={() => setShowPostSheet(true)} />}
      {activeTab === 'my-jobs' && <MyJobsScreen jobs={jobs} applications={applications} onToggle={toggleJob} onPostJob={() => setShowPostSheet(true)} />}
      {activeTab === 'applicants' && <ApplicantsScreen applications={applications} onUpdateStatus={updateStatus} updatingId={updatingId} />}
      {activeTab === 'analytics' && <InclusionAnalyticsScreen applications={applications} jobs={jobs} />}
      {activeTab === 'csr' && <CsrTrackingScreen programs={csrPrograms} onAddProgram={() => setShowCsrSheet(true)} />}
      {activeTab === 'assessment' && <AccessibilityAssessmentScreen />}
      {activeTab === 'profile' && <ProfileScreen onSignOut={onSignOut} />}

      {showPostSheet && (
        <PostJobSheet
          companyName={companyName}
          onClose={() => setShowPostSheet(false)}
          onSuccess={() => { setShowPostSheet(false); fetchAll(); }}
        />
      )}

      {showCsrSheet && (
        <CsrSheet
          onClose={() => setShowCsrSheet(false)}
          onSuccess={() => { setShowCsrSheet(false); fetchAll(); }}
        />
      )}
    </div>
  );
}
