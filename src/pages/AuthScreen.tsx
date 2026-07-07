import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Briefcase, Building2, Loader2, AlertCircle, ChevronLeft, Mic, Volume2, VolumeX, Fingerprint, Radio, Shield, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

function GoogleLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';
type Role = 'job_seeker' | 'employer';

const voiceSteps = [
  'Selamat datang di Kerja Setara.',
  'Silakan masukkan email dan password kamu.',
  'Atau gunakan login dengan suara untuk akses lebih mudah.',
];

function SignLanguageAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${speaking ? '' : 'opacity-60'}`}>
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
        speaking ? 'border-teal-400 bg-teal-50 scale-110' : 'border-slate-200 bg-slate-50'
      }`}>
        🤟
      </div>
      <span className="text-[9px] font-semibold text-teal-600">BISINDO</span>
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

    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Browser tidak mendukung voice recognition');
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;

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
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1500);
          } else {
            setErrorMsg('Perintah tidak dikenali. Coba ucapkan "login" atau email kamu.');
            setStatus('listening');
            speak('Perintah tidak dikenali. Silakan coba lagi.', true);
          }
        }, 1500);
      }
    };

    recognition.onerror = () => {
      setErrorMsg('Gagal mengenali suara. Silakan coba lagi.');
      setStatus('listening');
    };

    recognition.onend = () => {
      if (status === 'listening') {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    try {
      recognition.start();
    } catch {
      // Already started
    }

    return () => {
      try {
        recognition.stop();
      } catch {
        // Not started
      }
    };
  }, [isOpen, status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                <Mic size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Login dengan Suara</h3>
                <p className="text-xs text-slate-500">Ucapkan email atau kata kunci</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="text-slate-500 text-lg">✕</span>
            </button>
          </div>

          <div className="flex flex-col items-center py-6">
            {status === 'listening' && (
              <>
                <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
                  <div className="absolute inset-2 rounded-full bg-blue-200 animate-ping opacity-40" style={{ animationDelay: '200ms' }} />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1565c0, #0097a7)' }}>
                    <Mic size={36} className="text-white" />
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-medium">Mendengarkan...</p>
                <p className="text-xs text-slate-400 mt-1">Ucapkan "login" atau email kamu</p>
              </>
            )}

            {status === 'processing' && (
              <>
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-amber-100 mb-4">
                  <Loader2 size={36} className="text-amber-600 animate-spin" />
                </div>
                <p className="text-sm text-slate-700 font-medium">Memproses...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-green-100 mb-4">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
                <p className="text-sm text-green-700 font-medium">Login Berhasil!</p>
              </>
            )}

            {transcript && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl w-full">
                <p className="text-xs text-slate-500 mb-1">Yang terdengar:</p>
                <p className="text-sm text-slate-700">"{transcript}"</p>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl active:scale-95 transition-transform">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

function BiometricLoginModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [status, setStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      setErrorMsg('');

      const PublicKeyCredential = (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential;
      if (!PublicKeyCredential) {
        setErrorMsg('Biometrik tidak didukung di perangkat ini');
        setStatus('error');
        return;
      }

      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }, 2000);

      return () => clearTimeout(timer);
    }
    return;
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1565c0, #0097a7)' }}>
                <Fingerprint size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Login Biometrik</h3>
                <p className="text-xs text-slate-500">Pindai sidik jari atau Face ID</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-6">
            {status === 'scanning' && (
              <>
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Fingerprint size={64} className="text-blue-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-medium">Memindai...</p>
                <p className="text-xs text-slate-400 mt-1">Sentuh sensor sidik jari atau arahkan ke Face ID</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-green-100 mb-4">
                  <CheckCircle size={64} className="text-green-600" />
                </div>
                <p className="text-sm text-green-700 font-medium">Verifikasi Berhasil!</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-red-100 mb-4">
                  <AlertCircle size={64} className="text-red-500" />
                </div>
                <p className="text-sm text-red-600 font-medium mb-2">Gagal Memverifikasi</p>
                <p className="text-xs text-slate-500">{errorMsg}</p>
              </>
            )}
          </div>

          <button onClick={onClose} className="w-full py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl active:scale-95 transition-transform">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { settings, speak, toggleTTS } = useAccessibility();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('job_seeker');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [showVoiceLogin, setShowVoiceLogin] = useState(false);
  const [showBiometricLogin, setShowBiometricLogin] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '',
    disabilityType: '', companyName: '', companySize: '', location: '',
  });

  useEffect(() => {
    if (settings.voiceGuideEnabled || settings.ttsEnabled) {
      const t = setTimeout(() => speak(voiceSteps[0], true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if ((settings.voiceGuideEnabled || settings.ttsEnabled) && voiceIdx < voiceSteps.length) {
      speak(voiceSteps[voiceIdx]);
    }
  }, [voiceIdx]);

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
    if (error) {
      setError('Gagal login dengan Google. Coba lagi.');
      setGoogleLoading(false);
    }
  };

  const handleVoiceLoginSuccess = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  const handleBiometricSuccess = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  const inputCls = 'w-full px-4 py-3.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';
  const showAccessibility = settings.voiceGuideEnabled || settings.ttsEnabled || settings.signLanguageAvatar;

  return (
    <div className="app-screen flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Accessibility quick toggles */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTTS}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${settings.ttsEnabled ? 'bg-cyan-400/30 border border-cyan-400/50' : 'bg-white/10'}`}
              title="Text-to-Speech">
              {settings.ttsEnabled ? <Volume2 size={16} className="text-cyan-300" /> : <VolumeX size={16} className="text-white/60" />}
            </button>
            {settings.signLanguageAvatar && <SignLanguageAvatar speaking={loading} />}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Logo size="sm" variant="icon" transparent />
          <div>
            <h1 className="text-xl font-bold text-white leading-none">
              {mode === 'login' ? 'Selamat Datang!' : 'Buat Akun'}
            </h1>
            <p className="text-blue-200 text-xs mt-0.5">
              {mode === 'login' ? 'Platform inklusif #1 Indonesia' : 'Bergabung gratis sekarang'}
            </p>
          </div>
        </div>

        {/* Voice guide banner */}
        {showAccessibility && (
          <div className="relative z-10 mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
            <Mic size={14} className="text-cyan-300 flex-shrink-0" />
            <p className="text-xs text-white/80 flex-1">Panduan suara & aksesibilitas aktif</p>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1">
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === m ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>
              {m === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: 'job_seeker' as Role, icon: Briefcase, label: 'Pencari Kerja', desc: 'Cari kerja inklusif' },
              { v: 'employer' as Role, icon: Building2, label: 'Perusahaan', desc: 'Post lowongan' },
            ]).map(({ v, icon: Icon, label, desc }) => (
              <button key={v} onClick={() => setRole(v)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${role === v ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === v ? 'bg-blue-600' : 'bg-slate-100'}`}>
                  <Icon size={18} className={role === v ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${role === v ? 'text-blue-700' : 'text-slate-600'}`}>{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nama Lengkap</label>
              <input type="text" value={form.fullName} onChange={update('fullName')}
                placeholder={role === 'employer' ? 'Nama Kontak PIC' : 'Nama lengkapmu'} required className={inputCls} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Email</label>
            <input type="email" value={form.email} onChange={update('email')}
              placeholder="nama@email.com" required className={inputCls}
              onFocus={() => settings.ttsEnabled && speak('Masukkan alamat email kamu')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                placeholder={mode === 'register' ? 'Min. 6 karakter' : '••••••••'} required
                className={`${inputCls} pr-12`}
                onFocus={() => settings.ttsEnabled && speak('Masukkan password kamu')} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && role === 'job_seeker' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Jenis Disabilitas <span className="font-normal text-slate-400">(opsional)</span></label>
              <select value={form.disabilityType} onChange={update('disabilityType')} className={inputCls}>
                <option value="">Pilih jenis disabilitas</option>
                <option value="Disabilitas Netra">Disabilitas Netra</option>
                <option value="Disabilitas Rungu">Disabilitas Rungu/Tuli</option>
                <option value="Disabilitas Fisik">Disabilitas Fisik/Motorik</option>
                <option value="Disabilitas Intelektual">Disabilitas Intelektual</option>
                <option value="Disabilitas Mental">Disabilitas Psikososial/Mental</option>
                <option value="Disabilitas Ganda">Disabilitas Ganda</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}

          {mode === 'register' && role === 'employer' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Nama Perusahaan</label>
                <input type="text" value={form.companyName} onChange={update('companyName')} placeholder="PT. Nama Perusahaan" required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Ukuran Perusahaan</label>
                <select value={form.companySize} onChange={update('companySize')} className={inputCls}>
                  <option value="">Pilih ukuran perusahaan</option>
                  <option value="1-10">1–10 karyawan</option>
                  <option value="11-50">11–50 karyawan</option>
                  <option value="51-200">51–200 karyawan</option>
                  <option value="201-1000">201–1000 karyawan</option>
                  <option value="1000+">1000+ karyawan</option>
                </select>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Kota</label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="Jakarta, Bandung, dll." className={inputCls} />
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-lg mt-2"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun Gratis'}
          </button>
        </form>

        {mode === 'login' && (
          <>
            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">atau masuk dengan</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Alternative login methods */}
            <div className="grid grid-cols-3 gap-2">
              {/* Google Login */}
              <button onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 transition-all active:scale-95 disabled:opacity-60 bg-white">
                {googleLoading ? (
                  <Loader2 size={24} className="text-slate-400 animate-spin" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100">
                    <GoogleLogo size={22} />
                  </div>
                )}
                <span className="text-[10px] font-semibold text-slate-600">Google</span>
              </button>

              {/* Biometric Login */}
              <button onClick={() => setShowBiometricLogin(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 transition-all active:scale-95 bg-white">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500">
                  <Fingerprint size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Biometrik</span>
              </button>

              {/* Voice Login */}
              <button onClick={() => setShowVoiceLogin(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 transition-all active:scale-95 bg-white">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
                  <Mic size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Suara</span>
              </button>
            </div>

            {/* Accessibility tip */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 mt-2">
              <Shield size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-[11px] text-blue-700">
                <span className="font-bold">Login Biometrik & Suara</span> adalah fitur aksesibilitas untuk memudahkan login.
              </p>
            </div>
          </>
        )}

        <p className="text-center text-sm text-slate-500 pb-4">
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-blue-600 font-bold">
            {mode === 'login' ? 'Daftar gratis' : 'Masuk di sini'}
          </button>
        </p>
      </div>

      {/* Voice Login Modal */}
      <VoiceLoginModal
        isOpen={showVoiceLogin}
        onClose={() => setShowVoiceLogin(false)}
        onSuccess={handleVoiceLoginSuccess}
        speak={speak}
      />

      {/* Biometric Login Modal */}
      <BiometricLoginModal
        isOpen={showBiometricLogin}
        onClose={() => setShowBiometricLogin(false)}
        onSuccess={handleBiometricSuccess}
      />
    </div>
  );
}
