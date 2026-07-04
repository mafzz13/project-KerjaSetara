import { useState, useEffect } from 'react';
import { ChevronRight, Check, Mic, Eye, Volume2, Type, Zap, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { useAccessibility, DisabilityProfile } from '../contexts/AccessibilityContext';

interface OnboardingScreenProps {
  onDone: () => void;
  onLogin: () => void;
}

type OStep = 'welcome' | 'disability' | 'configure' | 'ready';

const disabilityOptions: { value: DisabilityProfile; label: string; emoji: string; desc: string; color: string }[] = [
  { value: 'netra', label: 'Disabilitas Netra', emoji: '👁', desc: 'Tunanetra atau low vision', color: '#3b82f6' },
  { value: 'tuli', label: 'Disabilitas Rungu/Tuli', emoji: '👂', desc: 'Tunarungu atau hard of hearing', color: '#06b6d4' },
  { value: 'fisik', label: 'Disabilitas Fisik', emoji: '♿', desc: 'Mobilitas terbatas atau tunadaksa', color: '#7c3aed' },
  { value: 'intelektual', label: 'Disabilitas Intelektual', emoji: '🧠', desc: 'Kesulitan belajar atau kognitif', color: '#d97706' },
  { value: 'mental', label: 'Disabilitas Mental', emoji: '💙', desc: 'Psikososial atau kesehatan mental', color: '#059669' },
  { value: 'ganda', label: 'Disabilitas Ganda', emoji: '🌟', desc: 'Kombinasi lebih dari satu disabilitas', color: '#dc2626' },
  { value: 'lainnya', label: 'Lainnya / Tidak Menyebutkan', emoji: '✨', desc: 'Preferensi pribadi', color: '#64748b' },
];

const configLabels: Record<NonNullable<DisabilityProfile>, { features: string[]; desc: string }> = {
  netra: {
    desc: 'Antarmuka dioptimalkan untuk pembaca layar & navigasi suara',
    features: ['Text-to-Speech diaktifkan', 'Kontras tinggi dinyalakan', 'Panduan suara aktif', 'Teks diperbesar'],
  },
  tuli: {
    desc: 'Antarmuka dengan dukungan visual penuh & penerjemah isyarat',
    features: ['Avatar Bahasa Isyarat aktif', 'Caption otomatis tersedia', 'Notifikasi visual', 'Mode tanpa suara'],
  },
  fisik: {
    desc: 'Kontrol yang dioptimalkan & tombol dengan target sentuh lebih besar',
    features: ['Target sentuh diperbesar', 'Animasi dikurangi', 'Teks diperbesar', 'Navigasi disederhanakan'],
  },
  intelektual: {
    desc: 'Tampilan lebih sederhana dengan bahasa yang jelas dan mudah dipahami',
    features: ['Font ramah disleksia', 'Bahasa disederhanakan', 'Animasi dikurangi', 'Teks diperbesar'],
  },
  mental: {
    desc: 'Antarmuka tenang dengan animasi minimal untuk kenyamanan optimal',
    features: ['Animasi diminimalkan', 'Warna menenangkan', 'Konten bertahap', 'Mode fokus tersedia'],
  },
  ganda: {
    desc: 'Konfigurasi aksesibilitas lengkap untuk kebutuhan kompleks',
    features: ['TTS & Avatar Isyarat aktif', 'Kontras tinggi', 'Panduan suara', 'Semua fitur aksesibel'],
  },
  lainnya: {
    desc: 'Pengaturan standar — kamu bisa menyesuaikan kapan saja',
    features: ['Pengaturan dasar aktif', 'Sesuaikan di Profil', 'Semua fitur tersedia', 'Widget aksesibilitas ada'],
  },
};

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 60%, #06b6d4 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 animate-slide-up">
          <Logo size="xl" className="mb-6 mx-auto" transparent />
          <h1 className="text-2xl font-bold text-white leading-tight mb-3">Selamat Datang!</h1>
          <p className="text-blue-100 leading-relaxed text-base mb-2">Platform inklusif #1 untuk<br />penyandang disabilitas Indonesia</p>
        </div>

        <div className="relative z-10 absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Mic, label: 'Panduan Suara' },
              { icon: Eye, label: 'Layar Adaptif' },
              { icon: Volume2, label: 'Text-to-Speech' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center">
                <Icon size={18} className="text-white mx-auto mb-1" />
                <p className="text-[10px] text-white/80 font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-6 flex-shrink-0">
        <button onClick={onNext}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-white transition-all active:scale-95 shadow-lg text-base"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
          Mulai Setup Aksesibilitas <ArrowRight size={18} />
        </button>
        <p className="text-center text-slate-400 text-xs mt-3">
          Proses ini hanya 2 menit & bisa diubah kapan saja
        </p>
      </div>
    </div>
  );
}

function DisabilityStep({ selected, onSelect, onNext, onSkip }: {
  selected: DisabilityProfile; onSelect: (d: DisabilityProfile) => void;
  onNext: () => void; onSkip: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 pt-12 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          <div className="w-2 h-2 rounded-full bg-slate-200" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-3">Profil Aksesibilitas</h2>
        <p className="text-sm text-slate-500 mt-1">Pilih untuk menyesuaikan tampilan & fitur secara otomatis</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        {disabilityOptions.map(opt => (
          <button key={opt.value} onClick={() => onSelect(opt.value)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
              selected === opt.value ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'
            }`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: selected === opt.value ? opt.color + '20' : '#f8fafc' }}>
              {opt.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${selected === opt.value ? 'text-blue-800' : 'text-slate-800'}`}>{opt.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
            </div>
            {selected === opt.value && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Check size={13} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 space-y-2.5 flex-shrink-0">
        <button onClick={onNext} disabled={!selected}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-40 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
          Konfigurasi Otomatis <ChevronRight size={18} />
        </button>
        <button onClick={onSkip} className="w-full py-2.5 text-sm text-slate-400 font-medium">
          Lewati, atur manual nanti
        </button>
      </div>
    </div>
  );
}

function ConfigureStep({ profile, onNext }: { profile: NonNullable<DisabilityProfile>; onNext: () => void }) {
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [visibleItems, setVisibleItems] = useState(0);
  const config = configLabels[profile];
  const opt = disabilityOptions.find(o => o.value === profile)!;

  useEffect(() => {
    const t = setTimeout(() => { setApplying(true); }, 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!applying) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleItems(count);
      if (count >= config.features.length) {
        clearInterval(interval);
        setTimeout(() => setApplied(true), 600);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [applying, config.features.length]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 pt-12 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <div className="w-2 h-2 rounded-full bg-slate-200" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-3">Mengonfigurasi UI</h2>
        <p className="text-sm text-slate-500 mt-1">Menyesuaikan tampilan untuk {opt.label}</p>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col">
        {/* Profile badge */}
        <div className="flex items-center gap-4 p-5 rounded-3xl mb-6 border-2 border-blue-100" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f7fa 100%)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: opt.color + '20' }}>
            {opt.emoji}
          </div>
          <div>
            <p className="font-bold text-slate-900">{opt.label}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{config.desc}</p>
          </div>
        </div>

        {/* AI Configuring animation */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full animate-bounce ${applying && !applied ? 'bg-blue-500' : 'bg-slate-200'}`}
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {applied ? '✓ Konfigurasi selesai!' : 'AI sedang mengkonfigurasi...'}
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-2 flex-1">
          {config.features.map((feature, i) => (
            <div key={i}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                i < visibleItems ? 'opacity-100 border-green-200 bg-green-50' : 'opacity-30 border-slate-100 bg-white'
              }`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                i < visibleItems ? 'bg-green-500' : 'bg-slate-200'
              }`}>
                {i < visibleItems ? <Check size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-white/50" />}
              </div>
              <p className={`text-sm font-semibold ${i < visibleItems ? 'text-green-800' : 'text-slate-400'}`}>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
        <button onClick={onNext} disabled={!applied}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-white transition-all active:scale-95 disabled:opacity-40 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
          Lanjut <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ReadyStep({ onDone, onLogin }: { onDone: () => void; onLogin: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        style={{ background: 'linear-gradient(160deg, #1e40af 0%, #3b82f6 60%, #06b6d4 100%)' }}>
        <div className="text-6xl mb-6 animate-slide-up">🎉</div>
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-3">Platform Siap Untukmu!</h2>
          <p className="text-blue-100 leading-relaxed text-sm mb-8 max-w-xs">
            Aksesibilitas telah dikonfigurasi. Kamu bisa mengubahnya kapan saja melalui widget aksesibilitas.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Zap, label: 'AI Job Matching', desc: 'Cocok dengan profilmu' },
              { icon: Type, label: 'Gamified Training', desc: 'Belajar sambil main' },
              { icon: Mic, label: 'Voice Guidance', desc: 'Navigasi dengan suara' },
              { icon: Eye, label: 'Smart UI', desc: 'Tampilan adaptif' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                <Icon size={18} className="text-cyan-300 mb-2" />
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-6 space-y-3 flex-shrink-0">
        <button onClick={onDone}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-white active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
          Buat Akun Gratis <ArrowRight size={18} />
        </button>
        <button onClick={onLogin} className="w-full py-3 text-sm font-semibold text-blue-600 rounded-2xl border-2 border-blue-100 active:scale-95 transition-all">
          Sudah punya akun? Masuk
        </button>
      </div>
    </div>
  );
}

export default function OnboardingScreen({ onDone, onLogin }: OnboardingScreenProps) {
  const [step, setStep] = useState<OStep>('welcome');
  const [selectedDisability, setSelectedDisability] = useState<DisabilityProfile>(null);
  const { applyDisabilityPreset } = useAccessibility();

  const handleDisabilityNext = () => {
    if (selectedDisability) {
      applyDisabilityPreset(selectedDisability);
      setStep('configure');
    }
  };

  const handleConfigDone = () => setStep('ready');
  const handleSkip = () => { setStep('ready'); };

  return (
    <div className="app-screen">
      {step === 'welcome' && <WelcomeStep onNext={() => setStep('disability')} />}
      {step === 'disability' && (
        <DisabilityStep selected={selectedDisability} onSelect={setSelectedDisability}
          onNext={handleDisabilityNext} onSkip={handleSkip} />
      )}
      {step === 'configure' && selectedDisability && (
        <ConfigureStep profile={selectedDisability} onNext={handleConfigDone} />
      )}
      {step === 'ready' && <ReadyStep onDone={onDone} onLogin={onLogin} />}
    </div>
  );
}
