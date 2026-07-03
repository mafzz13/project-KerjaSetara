import React, { createContext, useContext, useEffect, useState } from 'react';

export type DisabilityProfile = 'netra' | 'tuli' | 'fisik' | 'intelektual' | 'mental' | 'ganda' | 'lainnya' | null;

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xl';
  ttsEnabled: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  signLanguageAvatar: boolean;
  disabilityProfile: DisabilityProfile;
  voiceGuideEnabled: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  toggleTTS: () => void;
  toggleReducedMotion: () => void;
  toggleDyslexiaFont: () => void;
  toggleSignLanguage: () => void;
  toggleVoiceGuide: () => void;
  setDisabilityProfile: (profile: DisabilityProfile) => void;
  applyDisabilityPreset: (profile: DisabilityProfile) => void;
  speak: (text: string, priority?: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'normal',
  ttsEnabled: false,
  reducedMotion: false,
  dyslexiaFont: false,
  signLanguageAvatar: false,
  disabilityProfile: null,
  voiceGuideEnabled: false,
};

// Disability-adaptive UI presets
const disabilityPresets: Record<NonNullable<DisabilityProfile>, Partial<AccessibilitySettings>> = {
  netra: { ttsEnabled: true, voiceGuideEnabled: true, highContrast: true, fontSize: 'large', signLanguageAvatar: false },
  tuli: { signLanguageAvatar: true, ttsEnabled: false, voiceGuideEnabled: false },
  fisik: { fontSize: 'large', reducedMotion: true },
  intelektual: { fontSize: 'large', dyslexiaFont: true, reducedMotion: true },
  mental: { reducedMotion: true, fontSize: 'normal' },
  ganda: { ttsEnabled: true, highContrast: true, fontSize: 'large', signLanguageAvatar: true },
  lainnya: {},
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem('kerja_setara_a11y');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('kerja_setara_a11y', JSON.stringify(settings));
    const root = document.documentElement;

    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('dyslexia-font', settings.dyslexiaFont);

    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xl');
    root.classList.add(`text-size-${settings.fontSize}`);

    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  }, [settings]);

  const applyDisabilityPreset = (profile: DisabilityProfile) => {
    if (!profile) return;
    const preset = disabilityPresets[profile];
    setSettings(s => ({ ...s, disabilityProfile: profile, ...preset }));
  };

  const toggleHighContrast = () => setSettings(s => ({ ...s, highContrast: !s.highContrast }));
  const setFontSize = (fontSize: AccessibilitySettings['fontSize']) => setSettings(s => ({ ...s, fontSize }));
  const toggleTTS = () => setSettings(s => ({ ...s, ttsEnabled: !s.ttsEnabled }));
  const toggleReducedMotion = () => setSettings(s => ({ ...s, reducedMotion: !s.reducedMotion }));
  const toggleDyslexiaFont = () => setSettings(s => ({ ...s, dyslexiaFont: !s.dyslexiaFont }));
  const toggleSignLanguage = () => setSettings(s => ({ ...s, signLanguageAvatar: !s.signLanguageAvatar }));
  const toggleVoiceGuide = () => setSettings(s => ({ ...s, voiceGuideEnabled: !s.voiceGuideEnabled }));
  const setDisabilityProfile = (disabilityProfile: DisabilityProfile) => setSettings(s => ({ ...s, disabilityProfile }));

  const speak = (text: string, priority = false) => {
    if (!settings.ttsEnabled || !window.speechSynthesis) return;
    if (priority) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AccessibilityContext.Provider value={{
      settings, toggleHighContrast, setFontSize, toggleTTS, toggleReducedMotion,
      toggleDyslexiaFont, toggleSignLanguage, toggleVoiceGuide,
      setDisabilityProfile, applyDisabilityPreset, speak,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
