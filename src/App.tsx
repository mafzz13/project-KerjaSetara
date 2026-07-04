import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import BottomTabBar, { EmployerMoreMenu } from './components/BottomTabBar';
import AccessibilityWidget from './components/AccessibilityWidget';
import OnboardingScreen from './pages/OnboardingScreen';
import AuthScreen from './pages/AuthScreen';
import JobSeekerApp from './pages/JobSeekerApp';
import EmployerApp from './pages/EmployerApp';
import Logo from './components/Logo';

function SplashScreen() {
  return (
    <div className="app-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg, #0B1B6B 0%, #1565c0 55%, #0097a7 100%)' }}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Logo size="xl" className="opacity-0 animate-fade-in" transparent wordmarkScale={1.6} />
        <div className="flex gap-1.5 mt-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
              style={{ animationDelay: `${i * 180}ms`, animationDuration: '900ms' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

type AppScreen = 'onboarding' | 'auth' | 'app';

function AppShell() {
  const { user, profile, loading } = useAuth();
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [splash, setSplash] = useState(true);
  const [employerTab, setEmployerTab] = useState('home');
  const [jobSeekerTab, setJobSeekerTab] = useState('home');
  const [postJobTrigger, setPostJobTrigger] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || splash) return;
    if (user && profile) {
      setScreen('app');
    } else if (!user) {
      const seen = localStorage.getItem('ks_onboarding_seen');
      setScreen(seen ? 'auth' : 'onboarding');
    }
  }, [user, profile, loading, splash]);

  const handleOnboardingDone = () => {
    localStorage.setItem('ks_onboarding_seen', '1');
    setScreen('auth');
  };

  const handleTabChange = (tab: string) => {
    if (profile?.role === 'employer') {
      if (tab === 'post') {
        setPostJobTrigger(t => t + 1);
        return;
      }
      if (tab === 'more') {
        setShowMoreMenu(true);
        return;
      }
      setEmployerTab(tab);
    } else {
      setJobSeekerTab(tab);
    }
  };

  const handleSignOut = () => {
    setScreen('onboarding');
    setJobSeekerTab('home');
    setEmployerTab('home');
  };

  if (splash || loading) return <SplashScreen />;

  return (
    <div className="app-root">
      <div className="app-container">
        {screen === 'onboarding' && (
          <OnboardingScreen onDone={handleOnboardingDone} onLogin={() => setScreen('auth')} />
        )}
        {screen === 'auth' && (
          <AuthScreen onSuccess={() => setScreen('app')} onBack={() => setScreen('onboarding')} />
        )}
        {screen === 'app' && profile && (
          <>
            <div className="app-screen" style={{ paddingBottom: 64 }}>
              {profile.role === 'employer' ? (
                <EmployerApp
                  activeTab={employerTab}
                  onTabChange={setEmployerTab}
                  postJobTrigger={postJobTrigger}
                  onSignOut={handleSignOut}
                />
              ) : (
                <JobSeekerApp
                  activeTab={jobSeekerTab}
                  onTabChange={setJobSeekerTab}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
            <BottomTabBar
              role={profile.role}
              activeTab={profile.role === 'employer' ? employerTab : jobSeekerTab}
              onTabChange={handleTabChange}
            />
            {profile.role === 'employer' && (
              <EmployerMoreMenu
                isOpen={showMoreMenu}
                onClose={() => setShowMoreMenu(false)}
                onNavigate={(tab) => setEmployerTab(tab)}
              />
            )}
          </>
        )}
        {(screen === 'app' || screen === 'auth') && <AccessibilityWidget />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
