import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  Layout,
  Shield,
  Plus,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    width="24"
    height="24"
    fill="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g data-name="Layer 2">
      <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/>
      <path d="M12 1A10.89 10.89 0 0 0 1 11.77 10.79 10.79 0 0 0 8.52 22c.55.1.75-.23.75-.52v-1.83c-3.06.65-3.71-1.44-3.71-1.44a2.86 2.86 0 0 0-1.22-1.58c-1-.66.08-.65.08-.65a2.31 2.31 0 0 1 1.68 1.11 2.37 2.37 0 0 0 3.2.89 2.33 2.33 0 0 1 .7-1.44c-2.44-.27-5-1.19-5-5.32a4.15 4.15 0 0 1 1.11-2.91 3.78 3.78 0 0 1 .11-2.84s.93-.29 3 1.1a10.68 10.68 0 0 1 5.5 0c2.1-1.39 3-1.1 3-1.1a3.78 3.78 0 0 1 .11 2.84A4.15 4.15 0 0 1 19 11.2c0 4.14-2.58 5.05-5 5.32a2.5 2.5 0 0 1 .75 2v2.95c0 .35.2.63.75.52A10.8 10.8 0 0 0 23 11.77 10.89 10.89 0 0 0 12 1" data-name="github"/>
    </g>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg 
    width="24"
    height="24"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M7.84308 20.1979C9.8718 21.3993 10.8862 22 12 22C13.1138 22 14.1282 21.3993 16.1569 20.1979L16.8431 19.7915C18.8718 18.5901 19.8862 17.9894 20.4431 17C21 16.0106 21 14.8092 21 12.4063M20.8147 8C20.7326 7.62759 20.6141 7.3038 20.4431 7C19.8862 6.01057 18.8718 5.40987 16.8431 4.20846L16.1569 3.80211C14.1282 2.6007 13.1138 2 12 2C10.8862 2 9.8718 2.6007 7.84308 3.80211L7.15692 4.20846C5.1282 5.40987 4.11384 6.01057 3.55692 7C3 7.98943 3 9.19084 3 11.5937V12.4063C3 14.8092 3 16.0106 3.55692 17C3.78326 17.4021 4.08516 17.74 4.5 18.0802" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg 
    width="24"
    height="24"
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M21.42,21.42h0a2,2,0,0,1-2.82,0l-7.18-7.18A6.48,6.48,0,0,1,2,9.05a7.07,7.07,0,0,1,.1-1.85A1,1,0,0,1,3.8,6.74L7,10l2.49-.5L10,7,6.74,3.8A1,1,0,0,1,7.2,2.12,7.07,7.07,0,0,1,9.05,2a6.48,6.48,0,0,1,5.19,9.4l7.18,7.18A2,2,0,0,1,21.42,21.42Z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(4, 1.5) scale(0.8)">
      <g transform="translate(-180.000000, -7479.000000)" fill="currentColor">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M144,7339 L140,7339 L140,7332.001 C140,7330.081 139.153,7329.01 137.634,7329.01 C135.981,7329.01 135,7330.126 135,7332.001 L135,7339 L131,7339 L131,7326 L135,7326 L135,7327.462 C135,7327.462 136.255,7325.26 139.083,7325.26 C141.912,7325.26 144,7326.986 144,7330.558 L144,7339 L144,7339 Z M126.442,7323.921 C125.093,7323.921 124,7322.819 124,7321.46 C124,7320.102 125.093,7319 126.442,7319 C127.79,7319 128.883,7320.102 128.883,7321.46 C128.884,7322.819 127.79,7323.921 126.442,7323.921 L126.442,7323.921 Z M124,7339 L129,7339 L129,7326 L124,7326 L124,7339 Z" />
        </g>
      </g>
    </g>
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 512 512" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g>
      <path d="M141.18,56.938l30.484,33.531v157.594c0,2.563,1.422,4.938,3.688,6.141c2.281,1.203,5.031,1.063,7.156-0.391 l36.406-24.656l36.391,24.656c2.141,1.453,4.891,1.594,7.172,0.391c2.25-1.203,3.688-3.578,3.688-6.141V90.469l-30.5-33.531H141.18 z"/>
      <path d="M436.008,93.344l-25.875-62.563c9.188-0.563,14.719-8.156,14.719-14.078C424.852,7.469,417.383,0,408.164,0 H109.477C92.086,0,76.195,7.094,64.836,18.5C53.43,29.859,46.32,45.75,46.336,63.125V470.75c0,22.781,18.469,41.25,41.25,41.25 h343.359c19.188,0,34.719-15.547,34.719-34.734V127.578C465.664,110.125,452.789,95.844,436.008,93.344z M290.664,92.844v155.219 c0,11.672-6.406,22.328-16.719,27.797c-4.531,2.391-9.625,3.672-14.75,3.672c-6.313,0-12.422-1.875-17.641-5.438l-22.641-15.344 l-22.656,15.344c-5.219,3.563-11.313,5.438-17.641,5.438c-5.109,0-10.219-1.281-14.75-3.688 c-10.297-5.453-16.703-16.109-16.703-27.781V99.938l-6.469-7.094h-31.219c-8.266,0-15.594-3.313-21.016-8.703 c-5.406-5.453-8.719-12.766-8.719-21.016s3.313-15.578,8.719-21c5.422-5.406,12.75-8.719,21.016-8.719H383.57l26.688,59.438 H290.664z"/>
    </g>
  </svg>
);

const DEFAULT_CLIENT_ID = 'Ov23lixUODKMEAN667yX';
const DEFAULT_PROXY_URL = 'http://localhost:3000';

export default function App() {
  const { 
    settings, 
    initialize, 
    loginOAuth, 
    githubUser, 
    repositories,
    createRepository,
    updateSettings,
    rebuildHistoryFromGitHub,
    isLoading,
    logout,
    error 
  } = useAppStore();

  const isConnected = !!githubUser;

  // Unified view state (either welcome panel or settings dashboard)
  const initialView = window.location.pathname.includes('settings') ? 'settings' : 'welcome';
  const [view, setView] = useState<'welcome' | 'settings'>(initialView);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [time, setTime] = useState(new Date());

  // Settings specific states
  const [newRepoName, setNewRepoName] = useState('Coding-Solutions');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [activeTab, setActiveTab] = useState<'repo' | 'platforms' | 'preferences'>('repo');

  // Custom notification toast and confirm states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  // Sync state between path changes & popstate events
  useEffect(() => {
    initialize();
    
    // Live Clock timer
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handlePopState = () => {
      const pathView = window.location.pathname.includes('settings') ? 'settings' : 'welcome';
      setView(pathView);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      clearInterval(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = (targetView: 'welcome' | 'settings') => {
    setView(targetView);
    // Push the state into browser address bar without forcing page reload
    window.history.pushState({}, '', targetView === 'welcome' ? '/welcome.html' : '/settings.html');
  };

  const handleGetStarted = async () => {
    if (githubUser) {
      handleNavigate('settings');
      return;
    }
    const cid = settings?.clientId || DEFAULT_CLIENT_ID;
    const csecret = settings?.clientSecret || '';
    const purl = settings?.proxyUrl || DEFAULT_PROXY_URL;
    
    try {
      const success = await loginOAuth(cid, csecret, purl);
      if (success) {
        setAuthSuccess(true);
        showToast('Successfully Connected! Taking you to settings...', 'success');
        setTimeout(() => {
          handleNavigate('settings');
        }, 1800);
      }
    } catch (err) {
      showToast(`OAuth Error: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const handleOpenSettings = () => {
    handleNavigate('settings');
  };

  const handleRepoSelect = (repoFullName: string) => {
    const [owner, name] = repoFullName.split('/');
    updateSettings({
      repoOwner: owner,
      repoName: name,
    });
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName) return;
    const success = await createRepository(newRepoName, newRepoPrivate);
    if (success) {
      setNewRepoName('');
      showToast(`Repository '${newRepoName}' created and configured successfully!`, 'success');
    } else {
      showToast('Failed to create repository.', 'error');
    }
  };

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const pad = (num: number) => String(num).padStart(2, '0');
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Determine Time of Day State
  // Sunrise (5 AM to 8 AM): sunset dark/rose theme
  // Midday (8 AM to 5 PM): light sage theme
  // Sunset (5 PM to 7 PM): sunset dark/orange theme
  // Night (7 PM to 5 AM): night dark/sky theme
  const useLightTheme = hours >= 8 && hours < 17;
  const isNightTheme = !useLightTheme;
  const isDay = hours >= 5 && hours < 19;
  
  // Calculate Progress (0 to 1) for Sun or Moon position
  let progress = 0;
  if (isDay) {
    progress = (hours - 5 + minutes / 60 + seconds / 3600) / 14;
  } else {
    const nightHours = hours >= 19 ? hours - 19 : hours + 5;
    progress = (nightHours + minutes / 60 + seconds / 3600) / 10;
  }

  // Calculate coordinates
  const x = 5 + progress * 90;
  const y = 65 - Math.sin(progress * Math.PI) * 45;

  // Toggle body tag for global styles
  useEffect(() => {
    if (useLightTheme) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [useLightTheme]);

  // Configure sky theme based on hour range
  let skyGradient = 'from-[#030712] via-[#0b132b] to-[#1c2541]';
  let mountainColors = {
    layer1: '#182740',
    layer2: '#121e33',
    layer3: '#0c1626',
    layer4: '#070e1b',
    layer5: '#040710',
    layer6: '#010206'
  };
  let activeLogoTheme: 'sunrise' | 'midday' | 'sunset' | 'night' = 'night';

  if (hours >= 5 && hours < 8) {
    skyGradient = 'from-[#fbcfe8] via-[#fdba74] to-[#f43f5e]';
    mountainColors = {
      layer1: '#483c4a',
      layer2: '#3d3040',
      layer3: '#322536',
      layer4: '#281b2c',
      layer5: '#1e1222',
      layer6: '#140919'
    };
    activeLogoTheme = 'sunrise';
  } else if (hours >= 8 && hours < 17) {
    skyGradient = 'from-[#eef3e9] via-[#e2ebd9] to-[#d7dfd1]';
    mountainColors = {
      layer1: '#c5d5c0',
      layer2: '#abc0a5',
      layer3: '#91a78a',
      layer4: '#768e70',
      layer5: '#5c7756',
      layer6: '#3d5438'
    };
    activeLogoTheme = 'midday';
  } else if (hours >= 17 && hours < 19) {
    skyGradient = 'from-[#311042] via-[#7c2d12] to-[#f97316]';
    mountainColors = {
      layer1: '#3d1a2c',
      layer2: '#311221',
      layer3: '#270b17',
      layer4: '#1d040e',
      layer5: '#130006',
      layer6: '#0a0003'
    };
    activeLogoTheme = 'sunset';
  }

  // Star counts based on phase
  const starCount = isNightTheme ? 80 : (hours === 5 || hours === 18) ? 20 : 0;

  // Dynamic color classes based on theme (Light vs Dark background)
  const textPrimary = useLightTheme ? 'text-[#1d331f]' : 'text-white';
  const textSecondary = useLightTheme ? 'text-[#3d5438]' : 'text-slate-300';
  const textMuted = useLightTheme ? 'text-[#5c7756]' : 'text-slate-500';
  const textBrand = useLightTheme ? 'text-[#1d331f]' : 'text-white';
  
  const primaryButtonClass = useLightTheme 
    ? 'bg-[#2d4d30] text-white hover:bg-[#1d331f] shadow-lg shadow-[#2d4d30]/20' 
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20'
    : 'bg-white text-[#030e21] hover:bg-sky-100 shadow-xl shadow-white/5';


  const navToggleClass = useLightTheme
    ? 'bg-white/70 border-[#ccd4c3] text-[#2d4d30] hover:text-[#1d331f]'
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-950/20 border border-rose-900/30 text-rose-300 hover:text-rose-450'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-950/20 border border-orange-900/30 text-orange-300 hover:text-orange-450'
    : 'bg-slate-900/60 border border-slate-800 hover:text-sky-400';

  const clockWidgetClass = useLightTheme
    ? 'bg-white/80 border-[#b7c7b2] text-[#1d331f] shadow-lg shadow-[#1d331f]/5'
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-955/20 border border-rose-900/40 text-slate-100 shadow-2xl'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-955/20 border border-orange-900/40 text-slate-100 shadow-2xl'
    : 'bg-black/90 border-slate-800/60 text-slate-100 shadow-2xl';

  const clockDigitsClass = useLightTheme
    ? 'text-[#2d4d30]'
    : activeLogoTheme === 'sunrise' ? 'text-rose-450' :
      activeLogoTheme === 'midday' ? 'text-sky-400' :
      activeLogoTheme === 'sunset' ? 'text-orange-450' :
      'text-emerald-400';

  const inputClass = useLightTheme 
    ? 'bg-white/80 border-[#ccd4c3] text-[#1d331f] focus:border-[#2d4d30] focus:ring-[#2d4d30]' 
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-950/10 border-rose-900/30 text-white focus:border-rose-500 focus:ring-rose-500'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-950/10 border-orange-900/30 text-white focus:border-orange-500 focus:ring-orange-500'
    : 'bg-slate-900/60 border-slate-800 text-white focus:border-sky-500 focus:ring-sky-500';

  const activeTabClass = useLightTheme 
    ? 'bg-[#2d4d30]/10 border-[#2d4d30]/20 text-[#1d331f]' 
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-600/10 border-rose-500/20 text-rose-400'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-600/10 border-orange-500/20 text-orange-400'
    : 'bg-sky-600/10 border-sky-500/20 text-sky-400';

  const inactiveTabClass = useLightTheme 
    ? 'text-[#3d5438] hover:bg-[#2d4d30]/5 hover:text-[#1d331f] border-transparent' 
    : activeLogoTheme === 'sunrise'
    ? 'text-rose-300/70 hover:bg-rose-950/20 hover:text-rose-300 border-transparent'
    : activeLogoTheme === 'sunset'
    ? 'text-orange-300/70 hover:bg-orange-950/20 hover:text-orange-300 border-transparent'
    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent';

  const primaryBtnClass = useLightTheme 
    ? 'bg-[#2d4d30] hover:bg-[#1d331f] text-white shadow-lg shadow-[#2d4d30]/20' 
    : activeLogoTheme === 'sunrise'
    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25'
    : activeLogoTheme === 'sunset'
    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20';

  const secondaryBtnClass = useLightTheme 
    ? 'border-[#ccd4c3] bg-white/40 hover:bg-[#2d4d30]/5 text-[#2d4d30]' 
    : activeLogoTheme === 'sunrise'
    ? 'border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/25 text-rose-300'
    : activeLogoTheme === 'sunset'
    ? 'border-orange-900/30 bg-orange-950/20 hover:bg-orange-900/25 text-orange-300'
    : 'border-slate-850 bg-slate-900/40 hover:bg-slate-850 text-slate-300';

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#030e21] flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-sky-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative flex flex-col justify-between ${textPrimary} select-none overflow-hidden font-sans transition-colors duration-1000`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Webpage Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto"
          >
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md min-w-[280px] max-w-md ${
              toast.type === 'success'
                ? (useLightTheme ? 'bg-[#e2ebd9]/95 border-[#b7c7b2] text-[#1d331f]' : 'bg-[#0f1d12]/95 border-emerald-905/80 text-emerald-300')
                : toast.type === 'error'
                ? (useLightTheme ? 'bg-red-50/95 border-red-200 text-red-700' : 'bg-red-950/90 border-red-900/60 text-red-300')
                : (useLightTheme ? 'bg-blue-50/95 border-blue-200 text-blue-700' : 'bg-slate-900/90 border-slate-800 text-sky-400')
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 animate-bounce" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 animate-pulse" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-sky-500 flex-shrink-0" />}
              
              <span className="text-xs font-bold tracking-wide leading-relaxed">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webpage Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutConfirmOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative z-10 w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
                useLightTheme 
                  ? 'bg-white/95 border-[#ccd4c3] text-[#1d331f]' 
                  : 'bg-slate-950/95 border-slate-850 text-slate-100'
              }`}
            >
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">Log Out</h3>
              <p className={`text-xs ${useLightTheme ? 'text-[#3d5438]' : 'text-slate-400'} leading-relaxed mb-6 font-medium`}>
                Are you sure you want to log out from GitHub? You will need to re-authenticate to sync your solutions.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${secondaryBtnClass}`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setLogoutConfirmOpen(false);
                    await logout();
                    handleNavigate('welcome');
                    showToast('Logged out successfully', 'info');
                  }}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg transition-colors cursor-pointer"
                >
                  Confirm Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Webpage Repository Disconnect Confirmation Modal */}
      <AnimatePresence>
        {disconnectConfirmOpen && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisconnectConfirmOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative z-10 w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
                useLightTheme 
                  ? 'bg-white/95 border-[#ccd4c3] text-[#1d331f]' 
                  : 'bg-slate-950/95 border-slate-850 text-slate-100'
              }`}
            >
              <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-red-600 dark:text-red-400">Disconnect Repository</h3>
              <p className={`text-xs ${useLightTheme ? 'text-[#3d5438]' : 'text-slate-400'} leading-relaxed mb-6 font-medium`}>
                Are you sure you want to disconnect this repository? CP Vault will stop syncing your competitive programming solutions.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDisconnectConfirmOpen(false)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${secondaryBtnClass}`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDisconnectConfirmOpen(false);
                    await updateSettings({
                      repoOwner: null,
                      repoName: null
                    });
                    showToast('Repository disconnected successfully', 'info');
                  }}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Sky Background */}
      <div className="absolute inset-0 z-0 transition-colors duration-1000">
        <div className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-all duration-1000`} />

        {/* Stars */}
        {starCount > 0 && (
          <div className="absolute inset-0">
            {[...Array(starCount)].map((_, i) => {
              const starTop = (i * 7.7) % 85;
              const starLeft = (i * 13.3) % 100;
              const size = ((i % 3) + 1) * 0.75;
              const delay = (i % 7) * 0.8;
              const duration = 2.5 + (i % 4) * 0.8;
              return (
                <div 
                  key={i} 
                  className="absolute bg-white rounded-full animate-twinkle"
                  style={{
                    top: `${starTop}%`,
                    left: `${starLeft}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: isNightTheme ? 1 : 0.25,
                    '--twinkle-duration': `${duration}s`,
                    animationDelay: `${delay}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}

        {/* Shooting Stars */}
        {isNightTheme && (
          <div className="absolute inset-0">
            {[...Array(4)].map((_, i) => {
              const topVal = 5 + (i * 18) % 40;
              const leftVal = 10 + (i * 22) % 70;
              const duration = 3.5 + (i % 3) * 1.5;
              const delay = 1 + i * 6;
              return (
                <div 
                  key={i} 
                  className="absolute h-[1px] bg-gradient-to-r from-white to-transparent transform -rotate-45 origin-left opacity-0 animate-shooting-star"
                  style={{
                    top: `${topVal}%`,
                    left: `${leftVal}%`,
                    width: `${60 + (i % 3) * 30}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Sun or Moon */}
        <div 
          className="absolute z-10 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2" 
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {isDay ? (
            <div className="relative">
              <div className="absolute inset-0 bg-[#fef08a] rounded-full blur-3xl opacity-50 scale-250 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
                <div className="absolute inset-0 animate-spin-slow opacity-25">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 left-0 w-[450px] h-[30px] bg-gradient-to-r from-yellow-100/50 via-yellow-100/10 to-transparent origin-left -translate-y-1/2"
                      style={{
                        transform: `rotate(${i * 30}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="h-24 w-24 bg-gradient-to-br from-yellow-100 via-amber-200 to-orange-400 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.5)]" />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-[#e0f2fe] rounded-full blur-3xl opacity-20 scale-150 animate-pulse" />
              <div className="h-20 w-20 bg-[#f8fafc] rounded-full shadow-[0_0_40px_rgba(224,242,254,0.4),inset_-12px_-12px_24px_rgba(148,163,184,0.3)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full rounded-full shadow-[inset_10px_10px_20px_rgba(0,0,0,0.15)] pointer-events-none" />
                <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-slate-200/50" />
                <div className="absolute top-10 left-3 w-4 h-4 rounded-full bg-slate-200/50" />
                <div className="absolute top-8 left-10 w-2.5 h-2.5 rounded-full bg-slate-200/50" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layered Mountains */}
      <div className="absolute bottom-0 left-0 w-full h-[60vh] z-10 pointer-events-none select-none">
        <svg 
          viewBox="0 0 1440 800" 
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="transition-colors duration-1000" fill={mountainColors.layer1} d="M0 480 C 150 450 250 430 400 430 C 600 430 800 400 950 400 C 1100 400 1300 430 1440 450 L 1440 800 L 0 800 Z" />
          <path className="transition-colors duration-1000" fill={mountainColors.layer2} d="M0 520 C 250 480 500 320 680 280 C 740 260 760 240 800 240 C 840 240 860 260 920 280 C 1050 320 1250 460 1440 500 L 1440 800 L 0 800 Z" />
          <path className="transition-colors duration-1000" fill={mountainColors.layer3} d="M0 560 C 100 520 250 360 450 360 C 600 360 750 540 900 580 C 1100 600 1300 550 1440 530 L 1440 800 L 0 800 Z" />
          <path className="transition-colors duration-1000" fill={mountainColors.layer4} d="M0 460 C 100 460 250 560 400 580 C 600 600 900 520 1150 490 C 1280 470 1380 540 1440 580 L 1440 800 L 0 800 Z" />
          <path className="transition-colors duration-1000" fill={mountainColors.layer5} d="M0 620 C 200 620 400 680 600 680 C 800 680 950 580 1050 560 C 1200 540 1350 620 1440 640 L 1440 800 L 0 800 Z" />
          <path className="transition-colors duration-1000" fill={mountainColors.layer6} d="M0 700 C 300 750 600 780 900 770 C 1100 760 1300 730 1440 730 L 1440 800 L 0 800 Z" />
        </svg>
      </div>

      {/* View switching router with AnimatePresence */}
      <AnimatePresence mode="wait">
        {view === 'welcome' ? (
          <motion.div
            key="welcome"
            className="relative z-20 flex-1 flex flex-col justify-between h-screen overflow-hidden"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -35 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header Panel */}
            <header className="max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={`text-xl font-extrabold ${textBrand} tracking-wide leading-none transition-colors duration-1000`}>CP VAULT</h1>
                </div>
              </div>

              <nav className={`hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide ${textSecondary} transition-colors duration-1000`}>
                <button onClick={handleOpenSettings} className={`hover:${textPrimary} transition-colors flex items-center gap-1.5 font-semibold`}>
                  <SettingsIcon className="h-4 w-4" /> Settings
                </button>
              </nav>

              <button 
                onClick={handleOpenSettings}
                className={`md:hidden flex items-center justify-center p-2 rounded-xl ${navToggleClass} border transition-all duration-1000`}
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </header>

            {/* Hero Welcome Container */}
            <main className="relative z-20 max-w-5xl mx-auto w-full px-8 py-16 flex-1 flex flex-col items-center justify-start pt-44 text-center space-y-8">
              {error && (
                <div className="max-w-md p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium leading-relaxed">
                  {error}
                </div>
              )}



              <div className="space-y-4">
                <h2 className={`text-6xl md:text-8xl font-black ${textPrimary} tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-colors duration-1000`}>
                  WELCOME
                </h2>
                <p className={`max-w-xl mx-auto text-xs md:text-sm ${textSecondary} leading-relaxed font-light drop-shadow-sm transition-colors duration-1000`}>
                  Automatically sync accepted competitive programming solutions from LeetCode, Codeforces, CodeChef, and HackerRank directly into your GitHub repository with stunning layouts.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                <div className={`flex items-center justify-center gap-8 md:gap-12 text-xs tracking-widest ${useLightTheme ? 'text-[#2d4d30]' : 'text-sky-400/80'} font-bold uppercase transition-colors duration-1000`}>
                  <span>Solve</span>
                  <span className="opacity-30">|</span>
                  <span>Sync</span>
                  <span className="opacity-30">|</span>
                  <span>Showcase</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <button 
                    onClick={handleGetStarted}
                    disabled={isLoading || authSuccess}
                    className={`px-8 py-3.5 ${primaryButtonClass} disabled:opacity-50 text-xs font-extrabold rounded-full tracking-widest btn-flip-trigger flex items-center justify-center gap-2 transition-all duration-300`}
                  >
                    <span className="text-flip-container">
                      <span className="text-flip-inner">
                        <span className="text-flip-item gap-2">
                          {isLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            !githubUser && <GithubIcon className="h-4 w-4" />
                          )}
                          {githubUser ? 'DASHBOARD' : 'CONNECT WITH GITHUB'}
                        </span>
                        <span className="text-flip-item gap-2">
                          {isLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            !githubUser && <GithubIcon className="h-4 w-4" />
                          )}
                          {githubUser ? 'DASHBOARD' : 'CONNECT WITH GITHUB'}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </main>

            {/* Footer Branding & Clock */}
            <footer className="relative z-20 w-full px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
              <div className="flex flex-col items-start gap-2.5 text-white/50 transition-colors duration-1000 pb-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase">Engineered by Ankit Paul</span>
                <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
                  <a href="https://ankitxdev.vercel.app" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Portfolio</span>
                  </a>
                  <a href="https://github.com/ankitpaul6201" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                  <a href="https://linkedin.com/in/ankitpaul007" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className={`flex items-center justify-between gap-3.5 px-4 py-2 ${clockWidgetClass} border rounded-xl transition-all duration-1000 min-w-[170px] h-[58px]`}>
                <div className={`font-semibold text-2xl tracking-tighter leading-none transition-colors duration-1000 ${clockDigitsClass}`}>
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </div>
                <div className={`h-6 w-[1px] ${useLightTheme ? 'bg-[#b7c7b2]' : 'bg-slate-800'} transition-colors duration-1000`} />
                <div className={`flex flex-col text-[9px] text-right font-bold tracking-wider leading-tight ${useLightTheme ? 'text-[#3d5438]' : 'text-slate-400'} justify-center transition-colors duration-1000`}>
                  <span className={useLightTheme ? 'text-[#1d331f]' : 'text-slate-200'}>{days[time.getDay()]}</span>
                  <span className={useLightTheme ? 'text-[#5c7756]' : 'text-slate-400'}>{time.getDate()}</span>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            className="relative z-20 flex-1 flex flex-col justify-between h-screen overflow-hidden"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -35 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Settings Header Panel */}
            <header className="relative z-20 max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between transition-colors duration-1000">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleNavigate('welcome')}
                  className={`p-2.5 rounded-xl border ${secondaryBtnClass} transition-all duration-300 hover:scale-105 flex items-center justify-center`}
                  title="Back to Welcome Page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <h1 className={`text-xl font-extrabold ${textBrand} tracking-wide leading-none transition-colors duration-1000`}>SETTINGS</h1>
              </div>

              <div className="relative group">
                {isConnected && (
                  <>
                    {/* Original Profile Viewer */}
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${useLightTheme ? 'bg-white/80 border-[#ccd4c3]/80' : 'bg-slate-900/60 border-slate-800'} transition-all cursor-pointer`}>
                      <img src={githubUser.avatarUrl} alt={githubUser.login} className="h-5 w-5 rounded-full border border-sky-400/50" />
                      <span className={`text-xs font-semibold ${textPrimary}`}>{githubUser.login}</span>
                    </div>

                    {/* Dropdown Log Out Option */}
                    <div className="absolute right-0 top-full pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                      <button 
                        onClick={() => {
                          setLogoutConfirmOpen(true);
                        }}
                        className={`w-[120px] flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md ${
                          useLightTheme 
                            ? 'bg-white border-[#ccd4c3]/85 text-red-600 hover:bg-red-50 hover:border-red-200' 
                            : 'bg-slate-950 border-slate-800 text-red-400 hover:bg-red-950/20 hover:border-red-900/50'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* Main Grid for Settings */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-170px)] min-h-0">
              {/* Sidebar */}
              <nav className="space-y-1.5 relative z-20">
                {[
                  { id: 'repo', label: 'Repository Target', icon: BookmarkIcon },
                  { id: 'platforms', label: 'Competitive Platforms', icon: Layout },
                  { id: 'preferences', label: 'Preferences', icon: WrenchIcon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 ${isActive ? activeTabClass : inactiveTabClass}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Content Pane */}
              <main className="glass rounded-2xl p-6 relative z-20 h-full flex flex-col min-h-0 overflow-hidden">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-300">Authentication / Configuration Error</h4>
                      <p className="text-xs text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Repository Target Tab */}
                {activeTab === 'repo' && (
                  <section className="space-y-6 flex-1 overflow-y-auto pr-1">
                    <div>
                      <h2 className={`text-xl font-black uppercase tracking-wide ${textPrimary}`}>Repository Target</h2>
                      <p className={`text-xs ${textSecondary} mt-1`}>Select the repository where solutions should be stored, or create a new one.</p>
                    </div>

                    {!isConnected ? (
                      <div className={`flex items-center gap-2.5 p-4 border rounded-xl text-xs ${useLightTheme ? 'bg-white/40 border-[#ccd4c3] text-[#3d5438]' : 'bg-[#0a2246]/10 border-slate-800 text-slate-400'}`}>
                        <Info className="h-4.5 w-4.5 text-sky-400 flex-shrink-0" />
                        Please connect your GitHub account via the welcome screen first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Select Existing Repository</h3>
                          {repositories.length === 0 ? (
                            <p className="text-xs text-slate-500">No repositories found or still fetching...</p>
                          ) : (
                            <div className={`max-h-[300px] overflow-y-auto border rounded-xl divide-y transition-colors duration-1000 ${useLightTheme ? 'border-[#ccd4c3] divide-[#ccd4c3]/60 bg-white/40' : 'border-slate-800 divide-slate-800/60 bg-slate-950/20'}`}>
                              {repositories.map((repo) => {
                                const isSelected = settings.repoName === repo.name;
                                return (
                                  <button
                                    key={repo.fullName}
                                    onClick={() => handleRepoSelect(repo.fullName)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition text-xs ${isSelected ? (useLightTheme ? 'bg-[#2d4d30]/10 font-bold' : 'bg-sky-600/10 font-bold') : 'hover:bg-slate-400/5'}`}
                                  >
                                    <div>
                                      <span className={`font-semibold ${textPrimary}`}>{repo.name}</span>
                                      <span className={`text-[10px] ${textMuted} ml-1.5`}>{repo.private ? '(Private)' : '(Public)'}</span>
                                    </div>
                                    {isSelected && <Check className={`h-4 w-4 ${useLightTheme ? 'text-[#2d4d30]' : 'text-sky-400'}`} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {settings.repoName ? (
                            <>
                              <h3 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Active Repository</h3>
                              <div className={`border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 ${
                                useLightTheme ? 'bg-white/40 border-[#ccd4c3]' : 'bg-slate-900/40 border-slate-800/80'
                              }`}>
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-md">
                                  <CheckCircle2 className="h-6 w-6 animate-pulse" />
                                </div>
                                <div>
                                  <h4 className={`text-sm font-black ${textPrimary} truncate max-w-[280px] font-mono`}>
                                    {settings.repoOwner}/{settings.repoName}
                                  </h4>
                                  <p className={`text-[10px] ${textSecondary} mt-1.5 font-semibold`}>
                                    CP Vault is actively syncing solutions to this repository.
                                  </p>
                                </div>
                                
                                <div className="flex flex-col gap-2 w-full pt-2">
                                  <button
                                    onClick={async () => {
                                      showToast('Rebuilding stats... This may take a moment.', 'info');
                                      const success = await rebuildHistoryFromGitHub();
                                      if (success) {
                                        showToast('Successfully rebuilt statistics from GitHub!', 'success');
                                      } else {
                                        showToast('Failed to rebuild statistics', 'error');
                                      }
                                    }}
                                    disabled={isLoading}
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition ${primaryBtnClass}`}
                                  >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                    Rebuild Stats from Repo
                                  </button>
                                  <a
                                    href={`https://github.com/${settings.repoOwner}/${settings.repoName}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition ${secondaryBtnClass}`}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View on GitHub
                                  </a>
                                  <button
                                    onClick={() => {
                                      setDisconnectConfirmOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-red-500/20 hover:bg-red-500/5 text-red-500 dark:text-red-400 transition cursor-pointer"
                                  >
                                    Disconnect Repo
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Create New Repository</h3>
                              <form onSubmit={handleCreateRepo} className={`border rounded-xl p-5 space-y-4 ${useLightTheme ? 'bg-white/40 border-[#ccd4c3]' : 'bg-slate-900/40 border-slate-800/80'}`}>
                                <div className="space-y-2">
                                  <label className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Repository Name</label>
                                  <input
                                    type="text"
                                    value={newRepoName}
                                    onChange={(e) => setNewRepoName(e.target.value)}
                                    placeholder="e.g. My-Coding-Solutions"
                                    className={`w-full rounded-lg px-4 py-2.5 text-xs outline-none transition ${inputClass}`}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="private-repo"
                                    checked={newRepoPrivate}
                                    onChange={(e) => setNewRepoPrivate(e.target.checked)}
                                    className="h-4.5 w-4.5 text-[#2d4d30] focus:ring-[#2d4d30] border-slate-800 bg-slate-900 rounded"
                                  />
                                  <label htmlFor="private-repo" className={`text-xs ${textSecondary}`}>Make this repository private</label>
                                </div>
                                <button
                                  type="submit"
                                  disabled={isLoading || !newRepoName}
                                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 transition duration-300 ${primaryBtnClass}`}
                                >
                                  <Plus className="h-4 w-4" />
                                  Create & Connect Repo
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Competitive Platforms Tab */}
                {activeTab === 'platforms' && (
                  <section className="space-y-6 flex-1 overflow-y-auto pr-1">
                    <div>
                      <h2 className={`text-xl font-black uppercase tracking-wide ${textPrimary}`}>Competitive Platforms</h2>
                      <p className={`text-xs ${textSecondary} mt-1`}>Enable or disable syncing for individual platforms.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'LeetCode', desc: 'Syncs LeetCode problems (Easy, Medium, Hard)' },
                        { id: 'Codeforces', desc: 'Syncs Codeforces gym and contest submissions' },
                        { id: 'CodeChef', desc: 'Syncs CodeChef problem solutions' },
                        { id: 'HackerRank', desc: 'Syncs HackerRank challenge submissions' },
                        { id: 'Coding Ninjas', desc: 'Syncs Coding Ninjas challenge solutions' },
                        { id: 'GeeksforGeeks', desc: 'Syncs GeeksforGeeks practice problem submissions' },
                        { id: 'WorldQuant', desc: 'Syncs WorldQuant Brain challenge submissions' },
                      ].map((plat) => {
                        const isEnabled = settings.platforms[plat.id] ?? true;
                        return (
                          <div 
                            key={plat.id}
                            className={`border rounded-xl p-5 flex items-center justify-between gap-4 transition-all duration-300 ${
                              isEnabled 
                                ? (useLightTheme ? 'bg-[#2d4d30]/5 border-[#2d4d30]/25' : 'bg-sky-600/5 border-sky-500/25') 
                                : (useLightTheme ? 'bg-white/40 border-[#ccd4c3]/60' : 'bg-slate-900/20 border-slate-805')
                            }`}
                          >
                            <div>
                              <h4 className={`text-sm font-bold ${textPrimary}`}>{plat.id}</h4>
                              <p className={`text-[11px] ${textSecondary} mt-0.5`}>{plat.desc}</p>
                            </div>
                            <button
                              onClick={() => {
                                const updated = { ...settings.platforms, [plat.id]: !isEnabled };
                                updateSettings({ platforms: updated });
                              }}
                              className={`text-xs px-3.5 py-1.5 font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${isEnabled ? primaryBtnClass : secondaryBtnClass}`}
                            >
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <section className="space-y-6 flex-1 overflow-y-auto pr-1">
                    <div>
                      <h2 className={`text-xl font-black uppercase tracking-wide ${textPrimary}`}>Preferences</h2>
                      <p className={`text-xs ${textSecondary} mt-1`}>Fine-tune the behavior of CP Vault sync engine.</p>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`flex items-center justify-between border rounded-xl p-4 transition-all ${useLightTheme ? 'border-[#ccd4c3] bg-white/40' : 'border-slate-800 bg-slate-900/20'}`}>
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>Auto Sync</h4>
                            <p className={`text-[10px] ${textSecondary}`}>Sync automatically on accepted verdict</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.autoSync}
                            onChange={(e) => updateSettings({ autoSync: e.target.checked })}
                            className="h-4.5 w-4.5 text-[#2d4d30] focus:ring-[#2d4d30] border-slate-800 bg-slate-900 rounded"
                          />
                        </div>

                        <div className={`flex items-center justify-between border rounded-xl p-4 transition-all ${useLightTheme ? 'border-[#ccd4c3] bg-white/40' : 'border-slate-800 bg-slate-900/20'}`}>
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${textPrimary}`}>Retry failed syncs</h4>
                            <p className={`text-[10px] ${textSecondary}`}>Enable automatic backoff retries</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.retryFailed}
                            onChange={(e) => updateSettings({ retryFailed: e.target.checked })}
                            className="h-4.5 w-4.5 text-[#2d4d30] focus:ring-[#2d4d30] border-slate-800 bg-slate-900 rounded"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Folder Naming Style</label>
                        <select
                          value={settings.folderNamingStyle}
                          onChange={(e) => updateSettings({ folderNamingStyle: e.target.value as any })}
                          className={`w-full rounded-lg px-4 py-2.5 text-xs outline-none transition ${inputClass}`}
                        >
                          <option value="number-name">ID - Title (e.g. "0001 - Two Sum")</option>
                          <option value="name-only">Title Only (e.g. "Two Sum")</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Commit Message Template</label>
                        <input
                          type="text"
                          value={settings.commitMessageTemplate}
                          onChange={(e) => updateSettings({ commitMessageTemplate: e.target.value })}
                          className={`w-full rounded-lg px-4 py-2.5 text-xs outline-none transition ${inputClass}`}
                        />
                        <p className={`text-[10px] ${textMuted}`}>
                          Placeholders available: <code className="text-sky-400 font-mono">{'{platform}'}</code>, <code className="text-sky-400 font-mono">{'{problemId}'}</code>, <code className="text-sky-400 font-mono">{'{problemName}'}</code>.
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </main>
            </div>

            {/* Settings Footer */}
            <footer className="relative z-20 w-full px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
              <div className="flex flex-col items-start gap-2.5 text-white/50 transition-colors duration-1000 pb-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase">Engineered by Ankit Paul</span>
                <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
                  <a href="https://ankitxdev.vercel.app" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Portfolio</span>
                  </a>
                  <a href="https://github.com/ankitpaul6201" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                  <a href="https://linkedin.com/in/ankitpaul007" target="_blank" rel="noreferrer" className="hover:text-white/90 transition-colors flex items-center gap-1.5">
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className={`flex items-center justify-between gap-3.5 px-4 py-2 ${clockWidgetClass} border rounded-xl transition-all duration-1000 min-w-[170px] h-[58px]`}>
                <div className={`font-semibold text-2xl tracking-tighter leading-none transition-colors duration-1000 ${clockDigitsClass}`}>
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </div>
                <div className={`h-6 w-[1px] ${useLightTheme ? 'bg-[#b7c7b2]' : 'bg-slate-800'} transition-colors duration-1000`} />
                <div className={`flex flex-col text-[9px] text-right font-bold tracking-wider leading-tight ${useLightTheme ? 'text-[#3d5438]' : 'text-slate-400'} justify-center transition-colors duration-1000`}>
                  <span className={useLightTheme ? 'text-[#1d331f]' : 'text-slate-200'}>{days[time.getDay()]}</span>
                  <span className={useLightTheme ? 'text-[#5c7756]' : 'text-slate-400'}>{time.getDate()}</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
