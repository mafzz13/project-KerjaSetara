import { useState, useEffect } from 'react';
import { Eye, EyeOff, Briefcase, Building2, Loader2, AlertCircle, ChevronLeft, Mic, MicOff, Fingerprint, Volume2, VolumeX } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';
type Role = 'job_seeker' | 'employer';

const voiceSteps = [
  'Selamat datang di Kerja Setara.',
  'Silakan masukkan email dan password kamu.',
  'Atau gunakan sidik jari untuk masuk lebih cepat.',
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

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const { settings, speak, toggleVoiceGuide, toggleTTS } = useAccessibility();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('job_seeker');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

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

  const handleBiometric = () => {
    setBiometricLoading(true);
    speak('Memverifikasi identitas biometrik...');
    setTimeout(() => {
      setBiometricLoading(false);
      setBiometricSuccess(true);
      speak('Verifikasi biometrik berhasil!', true);
      setTimeout(() => {
        setBiometricSuccess(false);
        setForm(f => ({ ...f, email: 'demo@kerjasetara.id', password: 'demo123' }));
      }, 1500);
    }, 2000);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      speak('Maaf, fitur pengenalan suara tidak tersedia di browser ini.');
      return;
    }
    setVoiceListening(true);
    speak('Silakan ucapkan email kamu...');
    setTimeout(() => {
      setVoiceListening(false);
      speak('Fitur suara sedang dikalibrasi. Silakan ketik manual untuk saat ini.');
    }, 3000);
  };

  const inputCls = 'w-full px-4 py-3.5 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';
  const showAccessibility = settings.voiceGuideEnabled || settings.ttsEnabled || settings.signLanguageAvatar;

  return (
    <div className="app-screen flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0B1B6B 0%, #1565c0 100%)' }}>
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
          <Logo size="sm" variant="icon" />
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
            <button onClick={handleVoiceInput}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${voiceListening ? 'bg-red-400 text-white animate-pulse' : 'bg-white/20 text-white'}`}>
              {voiceListening ? '● Mendengar...' : '🎙 Input Suara'}
            </button>
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
            style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun Gratis'}
          </button>
        </form>

        {/* Alternative login methods */}
        {mode === 'login' && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">atau</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Biometric */}
              <button onClick={handleBiometric} disabled={biometricLoading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                  biometricSuccess ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'
                }`}>
                {biometricLoading ? (
                  <Loader2 size={22} className="text-blue-500 animate-spin" />
                ) : biometricSuccess ? (
                  <span className="text-xl">✅</span>
                ) : (
                  <Fingerprint size={22} className="text-slate-500" />
                )}
                <span className={`text-[10px] font-bold ${biometricSuccess ? 'text-green-600' : 'text-slate-500'}`}>
                  {biometricSuccess ? 'Terverifikasi' : 'Biometrik'}
                </span>
              </button>

              {/* Voice */}
              <button onClick={handleVoiceInput}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 ${voiceListening ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
                {voiceListening ? (
                  <MicOff size={22} className="text-red-500 animate-pulse" />
                ) : (
                  <Mic size={22} className="text-slate-500" />
                )}
                <span className="text-[10px] font-bold text-slate-500">
                  {voiceListening ? 'Aktif...' : 'Perintah Suara'}
                </span>
              </button>

              {/* Google simulation */}
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 border-slate-200 bg-white active:scale-95 transition-all"
                onClick={() => speak('Masuk dengan Google sedang dalam pengembangan')}>
                <span className="text-xl">🔵</span>
                <span className="text-[10px] font-bold text-slate-500">Google</span>
              </button>
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
    </div>
  );
}
