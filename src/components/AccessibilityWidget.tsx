import { useState } from 'react';
import { Accessibility, Sun, Type, Volume2, VolumeX, Eye, EyeOff, X, Minus, Plus } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const { settings, toggleHighContrast, setFontSize, toggleTTS, speak } = useAccessibility();

  const handleTTS = () => {
    toggleTTS();
    if (!settings.ttsEnabled) {
      setTimeout(() => speak('Mode Text to Speech diaktifkan. Saya akan membacakan teks untuk Anda.'), 100);
    }
  };

  const fontSizeLabel = { normal: 'Normal', large: 'Besar', xl: 'Sangat Besar' }[settings.fontSize];
  const fontSizes: Array<'normal' | 'large' | 'xl'> = ['normal', 'large', 'xl'];
  const currentIdx = fontSizes.indexOf(settings.fontSize);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Panel */}
      {open && (
        <div className="bg-white rounded-2xl shadow-modal border border-slate-100 w-72 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}>
            <div className="flex items-center gap-2">
              <Accessibility size={16} className="text-white" />
              <span className="text-sm font-semibold text-white">Pengaturan Aksesibilitas</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${settings.highContrast ? 'bg-blue-900' : 'bg-slate-100'}`}>
                  {settings.highContrast ? <EyeOff size={16} className="text-white" /> : <Eye size={16} className="text-slate-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Kontras Tinggi</p>
                  <p className="text-xs text-slate-500">{settings.highContrast ? 'Aktif' : 'Nonaktif'}</p>
                </div>
              </div>
              <button
                onClick={() => { toggleHighContrast(); speak(settings.highContrast ? 'Kontras tinggi dinonaktifkan' : 'Kontras tinggi diaktifkan'); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.highContrast ? 'bg-blue-700' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.highContrast ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100">
                  <Type size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Ukuran Teks</p>
                  <p className="text-xs text-slate-500">{fontSizeLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-12">
                <button
                  onClick={() => { const idx = Math.max(0, currentIdx - 1); setFontSize(fontSizes[idx]); speak(`Ukuran teks ${fontSizes[idx]}`); }}
                  disabled={currentIdx === 0}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <div className="flex gap-1 flex-1">
                  {fontSizes.map((fs, i) => (
                    <button
                      key={fs}
                      onClick={() => { setFontSize(fs); speak(`Ukuran teks ${fontSizeLabel}`); }}
                      className={`flex-1 h-2 rounded-full transition-colors ${i <= currentIdx ? 'bg-blue-600' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { const idx = Math.min(fontSizes.length - 1, currentIdx + 1); setFontSize(fontSizes[idx]); speak(`Ukuran teks ${fontSizes[idx]}`); }}
                  disabled={currentIdx === fontSizes.length - 1}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Text to Speech */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${settings.ttsEnabled ? 'bg-cyan-100' : 'bg-slate-100'}`}>
                  {settings.ttsEnabled ? <Volume2 size={16} className="text-cyan-700" /> : <VolumeX size={16} className="text-slate-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Text-to-Speech</p>
                  <p className="text-xs text-slate-500">{settings.ttsEnabled ? 'Aktif' : 'Nonaktif'}</p>
                </div>
              </div>
              <button
                onClick={handleTTS}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.ttsEnabled ? 'bg-cyan-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.ttsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Quick tip */}
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Sun size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Aktifkan Text-to-Speech untuk mendengarkan konten halaman saat kursor diarahkan ke teks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center group"
        style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0097a7 100%)' }}
        aria-label="Buka pengaturan aksesibilitas"
        title="Aksesibilitas"
      >
        <Accessibility size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
