import { Home, Briefcase, BookOpen, ShoppingBag, User, Users, PlusSquare, BarChart3, HandHeart, Shield, ChevronLeft } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  special?: boolean;
}

interface BottomTabBarProps {
  role: 'job_seeker' | 'employer';
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, number>;
}

export default function BottomTabBar({ role, activeTab, onTabChange, badges = {} }: BottomTabBarProps) {
  const jobSeekerTabs: TabItem[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'jobs', label: 'Lowongan', icon: Briefcase },
    { id: 'training', label: 'Latihan', icon: BookOpen },
    { id: 'market', label: 'Pasar', icon: ShoppingBag },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const employerTabs: TabItem[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'my-jobs', label: 'Lowongan', icon: Briefcase },
    { id: 'post', label: 'Posting', icon: PlusSquare, special: true },
    { id: 'applicants', label: 'Pelamar', icon: Users, badge: badges.applicants },
    { id: 'more', label: 'Menu', icon: BarChart3 },
  ];

  const tabs = role === 'employer' ? employerTabs : jobSeekerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch max-w-5xl mx-auto">
        {tabs.map(tab => {          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.special) {
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 relative"
                style={{ minHeight: 56 }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-6 shadow-lg active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{tab.label}</span>
              </button>
            );
          }

          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 relative transition-all duration-200 ${isActive ? 'text-blue-700' : 'text-slate-400'}`}
              style={{ minHeight: 56 }}>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600" />
              )}
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── EMPLOYER MORE MENU SHEET ─── */
export function EmployerMoreMenu({ isOpen, onClose, onNavigate, badges = {} }: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  badges?: Record<string, number>;
}) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'analytics', label: 'Analitik Inklusi', desc: 'Dashboard KPI rekrutmen', icon: BarChart3, color: '#3b82f6' },
    { id: 'csr', label: 'Program CSR', desc: 'Kelola dana & dampak', icon: HandHeart, color: '#059669' },
    { id: 'assessment', label: 'Audit Aksesibilitas', desc: 'Nilai infrastruktur kantor', icon: Shield, color: '#7c3aed' },
    { id: 'profile', label: 'Profil Perusahaan', desc: 'Informasi bisnis', icon: User, color: '#d97706' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Menu Lainnya</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="px-4 py-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 active:bg-slate-100 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ChevronLeft size={16} className="text-slate-300 rotate-180" />
              </button>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
