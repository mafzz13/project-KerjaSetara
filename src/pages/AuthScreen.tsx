import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Briefcase, Building2, Loader2, AlertCircle, Mic, Volume2, VolumeX, Fingerprint, Shield, CheckCircle, Lock, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import Logo from '../components/Logo';

/* ─── BRAND COLORS ─── */
const C = {
  navy: '#1F3A60',
  blue: '#3582B8',
  lightBlue: '#85B6D6',
  bg: '#EDF3F6',
  gold: '#F7CF59',
};

function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LinkedInLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full flex items-end justify-center" style={{ height: 200 }}>
      {/* Sky gradient background handled by parent */}
      {/* People silhouettes */}
      <div className="flex items-end justify-center gap-4 pb-2 relative z-10">
        {/* Person 1 – laptop user */}
        <div className="flex flex-col items-center gap-1" style={{ marginBottom: 8 }}>
          <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-2xl shadow-lg">👨‍💻</div>
          <div className="w-10 h-6 rounded bg-white/20 flex items-center justify-center"><span className="text-[10px] text-white font-bold">Dev</span></div>
        </div>
        {/* Person 2 – wheelchair + headphones (center, taller) */}
        <div className="flex flex-col items-center gap-1" style={{ marginBottom: 0 }}>
          <div className="w-16 h-16 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-3xl shadow-xl">👩‍🦯</div>
          <div className="w-12 h-5 rounded bg-white/20 flex items-center justify-center"><span className="text-[9px] text-white font-bold">Designer</span></div>
        </div>
        {/* Person 3 – professional */}
        <div className="flex flex-col items-center gap-1" style={{ marginBottom: 8 }}>
          <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-2xl shadow-lg">👨‍💼</div>
          <div className="w-10 h-6 rounded bg-white/20 flex items-center justify-center"><span className="text-[10px] text-white font-bold">Manager</span></div>
        </div>
      </div>
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-white" style={{ borderRadius: '60% 60% 0 0 / 80% 80% 0 0' }} />
    </div>
  );
}

function VoiceLoginModal({ isOpen, onClose, onSuccess, speak }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; speak: (text: string, interrupt?: boolean) => void;
}) {
  const [status, setStatus] = useState<'listening' | 'processing' | 'success' | 'error'>('listening');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('listening');
      setTranscript('');
      setErrorMsg('');
      speak('Silakan ucapkan email atau kata kunci akun kamu.', true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const SR = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SR) { setErrorMsg('Browser tidak mendukung voice recognition'); setStatus('error'); return; }
    const recognition = new SR();
    recognition.lang = 'id-ID'; recognition.continuous = false; recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript.toLowerCase();
      setTranscript(text);
      if (result.isFinal) {
        setStatus('processing');
        speak('Memproses perintah suara...', true);
        setTimeout(() => {
          if (text.includes('login') || text.includes('masuk') || text.includes('email')) {
            setStatus('success');
            speak('Login berhasil! Selamat datang.', true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
          } else {
            setErrorMsg('Perintah tidak dikenali. Coba ucapkan "login" atau email kamu.');
            setStatus('listening');
            speak('Perintah tidak dikenali. Silakan coba lagi.', true);
          }
        }, 1500);
      }
    };

    recognition.onerror = () => { setErrorMsg('Gagal mengenali suara. Silakan coba lagi.'); setStatus('listening'); };
    recognition.onend = () => { if (status === 'listening') { try { recognition.start(); } catch { } } };
    try { recognition.start(); } catch { }
    return () => { try { recognition.stop(); } catch { } };
  }, [isOpen, status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-md animate-slide-up pb-safe" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-4" />
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})` }}>
              <Mic size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Login dengan Suara</h3>
              <p className="text-xs text-slate-500">Ucapkan email atau kata kunci</p>
            </div>
          </div>

          <div className="flex flex-col items-center py-6">
            {status === 'listening' && (
              <>
                <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: C.blue }} />
                  <div className="absolute inset-2 rounded-full animate-ping opacity-30" style={{ background: C.blue, animationDelay: '200ms' }} />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})` }}>
                    <Mic size={36} className="text-white" />
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-semibold">Mendengarkan...</p>
                <p className="text-xs text-slate-400 mt-1">Ucapkan "login" atau email kamu</p>
              </>
            )}
            {status === 'processing' && (
              <><div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: C.bg }}><Loader2 size={36} className="animate-spin" style={{ color: C.blue }} /></div>
              <p className="text-sm text-slate-700 font-semibold">Memproses...</p></>
            )}
            {status === 'success' && (
              <><div className="w-24 h-24 rounded-full flex items-center justify-center bg-green-100 mb-4"><CheckCircle size={36} className="text-green-600" /></div>
              <p className="text-sm text-green-700 font-semibold">Login Berhasil!</p></>
            )}
            {transcript && <div className="mt-4 p-3 rounded-xl w-full" style={{ background: C.bg }}><p className="text-xs text-slate-500 mb-1">Yang terdengar:</p><p className="text-sm text-slate-700">"{transcript}"</p></div>}
            {errorMsg && <div className="mt-4 flex items-center gap-2 text-red-500 text-xs"><AlertCircle size={14} />{errorMsg}</div>}
          </div>

          <button onClick={onClose} className="w-full py-3 text-sm font-semibold text-slate-600 rounded-2xl active:scale-95 transition-transform" style={{ background: C.bg }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';
type Role = 'job_seeker' | 'employer';

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { settings, speak, toggleTTS } = useAccessibility();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('job_seeker');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVoiceLogin, setShowVoiceLogin] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '',
    disabilityType: '', companyName: '', companySize: '', location: '',
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password);
        if (error) { setError('Email atau password salah.'); }
        else { speak('Login berhasil! Selamat datang kembali.', true); onSuccess(); }
      } else {
        if (!form.fullName.trim()) { setError('Nama lengkap wajib diisi.'); return; }
        if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
        const extra: Record<string, string> = { location: form.location };
        if (role === 'job_seeker') extra.disability_type = form.disabilityType;
        if (role === 'employer') { extra.company_name = form.companyName; extra.company_size = form.companySize; }
        const { error } = await signUp(form.email, form.password, form.fullName, role, extra);
        if (error) {
          setError(error.message?.includes('already') ? 'Email sudah terdaftar.' : (error.message || 'Terjadi kesalahan.'));
        } else {
          speak('Akun berhasil dibuat! Selamat bergabung.', true);
          onSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError('Gagal login dengan Google. Coba lagi.'); setGoogleLoading(false); }
  };

  const handleVoiceLoginSuccess = useCallback(() => { onSuccess(); }, [onSuccess]);

  const inputCls = `w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2`;

  /* ─── LOGIN MODE (reference-style) ─── */
  if (mode === 'login') {
    return (
      <div className="app-screen flex flex-col overflow-y-auto" style={{ background: C.bg }}>
        {/* Hero Section */}
        <div className="relative flex-shrink-0 overflow-hidden flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #1F3A60 0%, #3582B8 55%, #85B6D6 100%)', minHeight: 280, paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10 animate-fade-in">
            <Logo size="xl" className="mx-auto" transparent wordmarkScale={1.6} />
            <p className="text-xs font-medium mt-3 text-center text-white/80">Empowering Abilities, Connecting Opportunities</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="flex-1 bg-white px-6 pt-6 pb-4">
          <h1 className="text-2xl font-black text-center mb-1" style={{ color: C.navy }}>Welcome Back!</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Login to Your Account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={update('email')}
                placeholder="Email or Username" required
                className={inputCls}
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                onFocus={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.lightBlue}33`; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                placeholder="Password" required
                className={`${inputCls} pr-28`}
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}
                onFocus={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.lightBlue}33`; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button type="button" className="absolute right-9 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: C.blue }}>
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold text-base rounded-2xl active:scale-95 disabled:opacity-60 transition-all shadow-md mt-2"
              style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)` }}>
              {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Login'}
            </button>
          </form>

          {/* Or divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">Or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Login with Voice */}
          <button onClick={() => setShowVoiceLogin(true)}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-white font-bold text-sm active:scale-95 transition-all shadow-sm mb-4"
            style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)` }}>
            <Mic size={18} /> Login with Voice
          </button>

          {/* Or sign in with */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">Or sign in with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 font-bold text-sm active:scale-95 disabled:opacity-60 transition-all mb-3 bg-white"
            style={{ borderColor: '#e2e8f0', color: '#3c4043' }}>
            {googleLoading ? <Loader2 size={18} className="text-slate-400 animate-spin" /> : <GoogleLogo size={20} />}
            Sign in with <strong>Google</strong>
          </button>

          {/* LinkedIn */}
          <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all mb-4"
            style={{ background: '#0A66C2' }}>
            <LinkedInLogo size={20} />
            Sign in with <strong>Linkedin</strong>
          </button>

          <div className="h-px bg-slate-100 mb-4" />

          <p className="text-center text-sm text-slate-500 pb-2">
            Don't have an account?{' '}
            <button onClick={() => { setMode('register'); setError(''); }}
              className="font-black" style={{ color: C.navy }}>
              Sign Up
            </button>
          </p>
        </div>

        {/* Accessible Login FAB */}
        <div className="fixed bottom-6 left-4 z-40">
          <button onClick={() => setShowVoiceLogin(true)}
            className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2.5 border border-slate-100 active:scale-95 transition-transform">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: C.blue }}>
              <span className="text-sm font-black">i</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">Accessible Login</span>
          </button>
        </div>

        <VoiceLoginModal isOpen={showVoiceLogin} onClose={() => setShowVoiceLogin(false)} onSuccess={handleVoiceLoginSuccess} speak={speak} />
      </div>
    );
  }

  /* ─── REGISTER MODE ─── */
  return (
    <div className="app-screen flex flex-col overflow-y-auto" style={{ background: C.bg }}>
      {/* Register Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.blue} 100%)` }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button onClick={() => { setMode('login'); setError(''); }}
            className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
            ← Kembali
          </button>
          <div className="flex items-center gap-2">
            {settings.ttsEnabled && (
              <button onClick={toggleTTS}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <VolumeX size={16} className="text-white/60" />
              </button>
            )}
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white">Buat Akun Gratis</h1>
          <p className="text-sm mt-1" style={{ color: C.lightBlue }}>Bergabung & temukan peluang inklusif</p>
        </div>
      </div>

      <div className="flex-1 bg-white px-5 py-5 space-y-4">
        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { v: 'job_seeker' as Role, icon: Briefcase, label: 'Pencari Kerja', desc: 'Cari kerja inklusif' },
            { v: 'employer' as Role, icon: Building2, label: 'Perusahaan', desc: 'Post lowongan kerja' },
          ]).map(({ v, icon: Icon, label, desc }) => (
            <button key={v} onClick={() => setRole(v)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95`}
              style={{ borderColor: role === v ? C.blue : '#e2e8f0', background: role === v ? `${C.blue}12` : 'white' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: role === v ? C.blue : '#f1f5f9' }}>
                <Icon size={18} className={role === v ? 'text-white' : 'text-slate-400'} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color: role === v ? C.navy : '#64748b' }}>{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
            <input type="text" value={form.fullName} onChange={update('fullName')}
              placeholder={role === 'employer' ? 'Nama Kontak PIC' : 'Nama lengkapmu'} required
              className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
          </div>

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" value={form.email} onChange={update('email')} placeholder="nama@email.com" required
              className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
              placeholder="Min. 6 karakter" required className={`${inputCls} pr-12`}
              style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {role === 'job_seeker' && (
            <select value={form.disabilityType} onChange={update('disabilityType')}
              className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
              <option value="">Jenis Disabilitas (opsional)</option>
              <option value="Disabilitas Netra">Disabilitas Netra</option>
              <option value="Disabilitas Rungu">Disabilitas Rungu/Tuli</option>
              <option value="Disabilitas Fisik">Disabilitas Fisik/Motorik</option>
              <option value="Disabilitas Intelektual">Disabilitas Intelektual</option>
              <option value="Disabilitas Mental">Disabilitas Psikososial/Mental</option>
              <option value="Disabilitas Ganda">Disabilitas Ganda</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          )}

          {role === 'employer' && (
            <>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.companyName} onChange={update('companyName')} placeholder="PT. Nama Perusahaan" required
                  className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
              </div>
              <select value={form.companySize} onChange={update('companySize')}
                className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <option value="">Ukuran Perusahaan</option>
                <option value="1-10">1–10 karyawan</option>
                <option value="11-50">11–50 karyawan</option>
                <option value="51-200">51–200 karyawan</option>
                <option value="201-1000">201–1000 karyawan</option>
                <option value="1000+">1000+ karyawan</option>
              </select>
            </>
          )}

          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={form.location} onChange={update('location')} placeholder="Kota (Jakarta, Bandung, dll.)"
              className={inputCls} style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 text-white font-bold text-base rounded-2xl active:scale-95 disabled:opacity-60 transition-all shadow-md mt-2"
            style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)` }}>
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Buat Akun Gratis'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pb-4">
          Sudah punya akun?{' '}
          <button onClick={() => { setMode('login'); setError(''); }}
            className="font-black" style={{ color: C.navy }}>
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  );
}
