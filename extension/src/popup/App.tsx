import { useEffect } from 'react';
import { useAppStore } from '../shared/store';
import { 
  RefreshCw, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Globe
} from 'lucide-react';

const DEFAULT_CLIENT_ID = 'Ov23lixUODKMEAN667yX';
const DEFAULT_PROXY_URL = 'http://localhost:3000';

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

export default function App() {
  const { 
    settings, 
    history, 
    queue, 
    githubUser, 
    initialize,
    loginOAuth,
    error
  } = useAppStore();

  useEffect(() => {
    initialize();
  }, []);

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  };

  const forceRetryQueue = () => {
    chrome.runtime.sendMessage({ action: 'RETRY_QUEUE' });
  };

  const handleDirectOAuth = async () => {
    const cid = settings?.clientId || DEFAULT_CLIENT_ID;
    const csecret = settings?.clientSecret || '';
    const purl = settings?.proxyUrl || DEFAULT_PROXY_URL;
    if (!cid || cid === 'your_client_id_here') {
      alert('OAuth Client ID is not configured. Please open the settings page to enter your Client ID.');
      chrome.runtime.openOptionsPage();
      return;
    }
    try {
      const success = await loginOAuth(cid, csecret, purl);
      if (!success) {
        const currentError = useAppStore.getState().error;
        alert(`Authentication failed: ${currentError || 'Unknown error. Check if your backend proxy server is running at ' + purl}`);
      }
    } catch (err) {
      alert(`OAuth Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (error && !settings) {
    return (
      <div className="w-[380px] h-[520px] bg-[#c5d5c0] text-[#3d5438] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-red-600 animate-pulse" />
          <p className="text-sm text-red-755 font-extrabold uppercase tracking-wider">Initialization Error</p>
          <p className="text-xs text-[#3d5438]/90 leading-relaxed font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="w-[380px] h-[520px] bg-[#c5d5c0] text-[#3d5438] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#3d5438]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#3d5438]/80">Loading CP Vault...</p>
        </div>
      </div>
    );
  }

  const isConnected = !!settings.githubToken && !!githubUser;
  const totalSolved = history?.logs?.length || 0;
  const streak = history?.streak?.currentStreak || 0;

  // Platform counters
  const platformCounts: Record<string, number> = {
    LeetCode: 0,
    Codeforces: 0,
    CodeChef: 0,
    HackerRank: 0,
    'Coding Ninjas': 0,
    GeeksforGeeks: 0,
    WorldQuant: 0
  };
  history?.logs?.forEach(log => {
    const platform = log.platform;
    if (platform in platformCounts) {
      platformCounts[platform]++;
    }
  });

  return (
    <div className="w-[380px] h-[520px] bg-[#c5d5c0] text-white flex flex-col justify-between overflow-hidden font-sans" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header className="px-4 py-3 bg-[#a2b49c]/20 border-b border-[#3d5438]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-extrabold text-[#3d5438] tracking-widest leading-none">CP VAULT</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={openSettings} 
            title="Open Dashboard"
            className="p-1.5 rounded-xl hover:bg-[#3d5438]/10 text-[#3d5438] hover:text-[#1d331f] transition-all duration-300 flex items-center justify-center"
          >
            <Globe className="h-4 w-4" />
          </button>
          <a 
            href="https://github.com/ankitpaul6201/CP-VAULT" 
            target="_blank" 
            rel="noreferrer"
            title="GitHub Repository"
            className="p-1.5 rounded-xl hover:bg-[#3d5438]/10 text-[#3d5438] hover:text-[#1d331f] transition-all duration-300 flex items-center justify-center"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a 
            href="https://linkedin.com/in/ankitpaul007" 
            target="_blank" 
            rel="noreferrer"
            title="LinkedIn Profile"
            className="p-1.5 rounded-xl hover:bg-[#3d5438]/10 text-[#3d5438] hover:text-[#1d331f] transition-all duration-300 flex items-center justify-center"
          >
            <LinkedInIcon className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-red-600/20 border border-red-600/30 rounded-xl text-[10px] text-white font-semibold leading-relaxed">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Status */}
        <section className="glass rounded-xl p-3.5 space-y-3 relative overflow-hidden">
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={githubUser.avatarUrl} 
                    alt={githubUser.login} 
                    className="h-8 w-8 rounded-full border border-white/30"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">{githubUser.login}</h3>
                    <p className="text-[10px] text-white/80 font-medium">Connected to GitHub</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-white px-2.5 py-0.5 rounded-full border border-emerald-600/30">
                  <CheckCircle2 className="h-3 w-3" stroke="#22c55e" />
                  Active
                </div>
              </div>

              {settings.repoName ? (
                <div className="bg-black/15 border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookmarkIcon className="h-3.5 w-3.5 text-white flex-shrink-0" />
                    <span className="text-[10px] font-bold font-mono truncate text-white">
                      {settings.repoOwner}/{settings.repoName}
                    </span>
                  </div>
                  <a 
                    href={`https://github.com/${settings.repoOwner}/${settings.repoName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-white bg-amber-600/20 border border-amber-600/30 p-2 rounded-lg font-normal leading-normal">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                  <span>
                    Repository not selected. Configure in{' '}
                    <button 
                      onClick={openSettings} 
                      className="underline font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      settings
                    </button>
                    .
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
              <GithubIcon className="h-10 w-10 text-white/60" />
              <div>
                <p className="text-xs font-bold text-white">GitHub account not connected</p>
                <p className="text-[10px] text-white/80 max-w-[260px] mt-1 leading-relaxed">Please connect your account to start syncing your competitive programming solutions.</p>
              </div>
              <button 
                onClick={handleDirectOAuth}
                className="text-[10px] px-5 py-2.5 bg-[#3d5438] hover:bg-[#1d331f] text-white font-extrabold rounded-full shadow-md btn-flip-trigger flex items-center justify-center gap-2 transition-all duration-300"
              >
                <span className="text-flip-container">
                  <span className="text-flip-inner">
                    <span className="text-flip-item gap-2">
                      AUTHENTICATE NOW
                    </span>
                    <span className="text-flip-item gap-2">
                      AUTHENTICATE NOW
                    </span>
                  </span>
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Sync Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Total Solved</p>
              <h4 className="text-lg font-black text-white mt-0.5">{totalSolved}</h4>
            </div>
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="h-4.5 w-4.5" stroke="#22c55e" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' }} />
            </div>
          </div>

          <div className="glass rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Streak</p>
              <h4 className="text-lg font-black text-white mt-0.5">{streak} Days</h4>
            </div>
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Flame className="h-4.5 w-4.5" stroke="#ea580c" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(234, 88, 12, 0.4))' }} />
            </div>
          </div>
        </section>

        {/* Platform breakdown */}
        <section className="glass rounded-xl p-3.5 space-y-2.5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/80">Platform Breakdown</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(() => {
              const items = [
                { name: 'LeetCode', count: platformCounts.LeetCode },
                { name: 'Codeforces', count: platformCounts.Codeforces },
                { name: 'CodeChef', count: platformCounts.CodeChef },
                { name: 'HackerRank', count: platformCounts.HackerRank },
                { name: 'Coding Ninjas', count: platformCounts['Coding Ninjas'] },
                { name: 'GeeksforGeeks', count: platformCounts.GeeksforGeeks },
                { name: 'WorldQuant', count: platformCounts.WorldQuant },
              ].filter(p => settings.platforms[p.name] !== false);

              if (items.length === 0) {
                return (
                  <p className="text-[10px] text-white/50 italic col-span-2 text-center py-1">
                    No platforms enabled.
                  </p>
                );
              }

              return items.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-white/90 font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    {p.name}
                  </span>
                  <span className="font-extrabold text-white">{p.count}</span>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* Queue / Sync status */}
        {queue.length > 0 && (
          <section className="bg-amber-600/20 border border-amber-600/30 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
              <div>
                <h4 className="text-[11px] font-bold text-white">Pending Sync Queue</h4>
                <p className="text-[9px] text-white/80 font-medium">{queue.length} solutions failed, retrying...</p>
              </div>
            </div>
            <button 
              onClick={forceRetryQueue}
              className="p-1 px-2.5 bg-amber-600/30 hover:bg-amber-600/40 text-white text-[10px] font-bold rounded border border-amber-600/40 transition flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-2.5 bg-[#a2b49c]/20 border-t border-[#3d5438]/20 text-[9px] text-[#3d5438] font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>V1.0.0</span>
          <span className="text-[#3d5438]/30">|</span>
          <div className="flex items-center gap-1 text-[#3d5438]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block"></span>
            Sync: <span className="font-extrabold text-[#1d331f]">{settings.autoSync ? 'ON' : 'OFF'}</span>
          </div>
        </div>
        <span className="text-[8px] text-[#3d5438]/60 uppercase tracking-widest font-extrabold">Engineered by Ankit Paul</span>
      </footer>
    </div>
  );
}
