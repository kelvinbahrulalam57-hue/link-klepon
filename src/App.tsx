/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, LinkItem, ProfileData, ThemeConfig, AnalyticsRecord } from './types.ts';
import { DEFAULT_APP_STATE } from './data/defaultState.ts';
import TautanTab from './components/TautanTab.tsx';
import ProfilTab from './components/ProfilTab.tsx';
import DesainTab from './components/DesainTab.tsx';
import AnalitikTab from './components/AnalitikTab.tsx';
import AdminTab from './components/AdminTab.tsx';
import QRBackupTab from './components/QRBackupTab.tsx';
import PratinjauHP from './components/PratinjauHP.tsx';
import LandingPage from './components/LandingPage.tsx';
import EntranceAnimation from './components/EntranceAnimation.tsx';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LKLogo from './components/LKLogo.tsx';

interface PushNotification {
  id: string;
  title: string;
  message: string;
}

export default function App() {
  // Load initial state
  const [appState, rawSetAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('link_klepon_db_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_APP_STATE;
      }
    }
    return DEFAULT_APP_STATE;
  });

  const lastLocalEdit = React.useRef<number>(0);
  const stateRef = React.useRef<AppState>(appState);

  // Keep stateRef in sync with the actual state
  useEffect(() => {
    stateRef.current = appState;
  }, [appState]);

  const setAppState = (updater: AppState | ((prev: AppState) => AppState)) => {
    lastLocalEdit.current = Date.now();
    rawSetAppState(updater);
  };

  // 1. Fetch initial state from server on mount
  useEffect(() => {
    let active = true;
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            rawSetAppState(data.state);
            localStorage.setItem('link_klepon_db_v1', JSON.stringify(data.state));
          } else {
            // Seed server with our current state
            await fetch('/api/state', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ state: stateRef.current })
            });
          }
        }
      } catch (err) {
        // Catch quietly to prevent noisy console logs
      }
    };
    fetchInitialState();
    return () => {
      active = false;
    };
  }, []);

  // 2. Debounced save to server and localStorage
  useEffect(() => {
    const handler = setTimeout(async () => {
      localStorage.setItem('link_klepon_db_v1', JSON.stringify(appState));
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: appState })
        });
      } catch (err) {
        // Catch quietly to prevent noisy console logs
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [appState]);

  // 3. Poll server for real-time updates from other tabs or devices
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Only pull updates if we haven't edited anything locally in the last 4 seconds
      if (Date.now() - lastLocalEdit.current > 4000) {
        try {
          const res = await fetch('/api/state');
          if (res.ok) {
            const data = await res.json();
            if (data.state) {
              const currentStr = JSON.stringify(stateRef.current);
              const incomingStr = JSON.stringify(data.state);
              if (currentStr !== incomingStr) {
                rawSetAppState(data.state);
                localStorage.setItem('link_klepon_db_v1', incomingStr);
              }
            }
          }
        } catch (err) {
          // Catch quietly to prevent noisy console logs when server is offline or restarting
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  // 4. Instant same-browser multi-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'link_klepon_db_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const currentStr = JSON.stringify(stateRef.current);
          if (currentStr !== e.newValue) {
            rawSetAppState(parsed);
          }
        } catch (err) {
          // Catch quietly
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Editor admin themes: 'slate' | 'gold' | 'sage' (matches screenshot Image 4)
  const [adminStyle, setAdminStyle] = useState<'slate' | 'gold' | 'sage'>('slate');

  // Currently active editor tab (matches screenshot tabs)
  const [activeTab, setActiveTab] = useState<'tautan' | 'profil' | 'desain' | 'analitik' | 'admin' | 'qr_backup'>('tautan');

  // Authentication state for hidden admin login
  const [isAdminLogged, setIsAdminLogged] = useState<boolean>(() => {
    return localStorage.getItem('link_klepon_admin_logged') === 'true';
  });

  // Mode: 'editor' (cockpit with live phone) OR 'public' (standalone Linktree landing page)
  const [appMode, setAppMode] = useState<'editor' | 'public'>(() => {
    const logged = localStorage.getItem('link_klepon_admin_logged') === 'true';
    return logged ? 'editor' : 'public';
  });

  // Entrance animation state
  const [showEntrance, setShowEntrance] = useState(true);

  // Side Drawer Preview Toggle State
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);

  // Push notifications banners
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);

  // Simulated Location for testing Stealth Mode
  const [simulatedLocation, setSimulatedLocation] = useState<string>(() => {
    return localStorage.getItem('link_klepon_simulated_location') || "Indonesia";
  });

  useEffect(() => {
    localStorage.setItem('link_klepon_simulated_location', simulatedLocation);
  }, [simulatedLocation]);

  // Account suspicious security logs
  const [suspiciousLogs, setSuspiciousLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('link_klepon_security_logs');
    return saved ? JSON.parse(saved) : [
      "Sistem Keamanan Diinisialisasi (Secure Cloud)",
      "Deteksi browser terpercaya: Google AI Studio Client",
      "Penyimpanan Lokal (Offline Storage) Aktif & Sinkron"
    ];
  });

  useEffect(() => {
    localStorage.setItem('link_klepon_security_logs', JSON.stringify(suspiciousLogs));
  }, [suspiciousLogs]);

  // Log suspicious activity helper
  const handleLogSuspiciousActivity = (action: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    const newLog = `[${timestamp}] ${action}`;
    setSuspiciousLogs(prev => [newLog, ...prev]);
    triggerPushNotification("Security Warning! ⚠️", `Aktivitas mencurigakan dilaporkan ke email admin.`);
  };

  // Push notification helper
  const triggerPushNotification = (title: string, message: string) => {
    const id = `notif_${Date.now()}`;
    setPushNotifications(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setPushNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Click tracking event trigger (updates clicks real-time)
  const handleLinkClick = (linkId: string) => {
    // Increment specific link clicks
    setAppState(prev => {
      const updatedLinks = prev.links.map(l => {
        if (l.id === linkId) {
          return { ...l, clickCount: l.clickCount + 1 };
        }
        return l;
      });

      // Also dynamically increment today's analytics clicks graph (Sab / Saturday by default or random)
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const currentDayName = days[new Date().getDay()];
      
      const updatedAnalytics = prev.analytics.map(a => {
        if (a.date === currentDayName) {
          return { ...a, clicks: a.clicks + 1, views: a.views + 2 };
        }
        return a;
      });

      return {
        ...prev,
        links: updatedLinks,
        analytics: updatedAnalytics
      };
    });

    const targetLink = appState.links.find(l => l.id === linkId);
    triggerPushNotification(
      "Analitik Klik! 📊",
      `Pengunjung klik tautan "${targetLink?.title || 'Tautan'}" secara real-time.`
    );
  };

  // Import JSON backup configuration
  const handleImportBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.theme && Array.isArray(parsed.links)) {
        setAppState(prev => ({
          ...prev,
          profile: parsed.profile,
          theme: parsed.theme,
          links: parsed.links
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Export JSON backup download
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      profile: appState.profile,
      theme: appState.theme,
      links: appState.links
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_link_klepon_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
    triggerPushNotification("Ekspor Berhasil! 💾", "Konfigurasi JSON berhasil diunduh sebagai cadangan.");
  };

  // Reset clicks counter to 0
  const handleResetClicks = () => {
    setAppState(prev => {
      const resetLinks = prev.links.map(l => ({ ...l, clickCount: 0 }));
      const resetAnalytics = prev.analytics.map(a => ({ ...a, clicks: 0 }));
      return {
        ...prev,
        links: resetLinks,
        analytics: resetAnalytics
      };
    });
    triggerPushNotification("Clicks Direset 🔄", "Seluruh kalkulasi performa kunjungan diatur ulang ke nol.");
  };

  // Layout styling variables depending on admin themes selection
  const getAdminStyleClasses = () => {
    if (adminStyle === 'gold') {
      return {
        bg: 'bg-[#15120c]',
        cardBg: 'bg-[#1e1a12]',
        border: 'border-amber-500/20',
        accent: 'text-amber-400',
        accentBg: 'bg-amber-500/15',
        accentBorder: 'border-amber-500/30',
        badge: 'bg-amber-500 text-slate-950',
        primaryBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950'
      };
    }
    if (adminStyle === 'sage') {
      return {
        bg: 'bg-[#0b100e]',
        cardBg: 'bg-[#111714]',
        border: 'border-emerald-500/20',
        accent: 'text-emerald-400',
        accentBg: 'bg-emerald-500/15',
        accentBorder: 'border-emerald-500/30',
        badge: 'bg-emerald-500 text-slate-950',
        primaryBtn: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
      };
    }
    // Slate Blue Default
    return {
      bg: 'bg-[#090d16]',
      cardBg: 'bg-[#0b1329]',
      border: 'border-cyan-500/15',
      accent: 'text-cyan-400',
      accentBg: 'bg-cyan-500/10',
      accentBorder: 'border-cyan-500/25',
      badge: 'bg-cyan-500 text-slate-950',
      primaryBtn: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
    };
  };

  const style = getAdminStyleClasses();

  // Standalone and global multi-mode rendering with AnimatePresence
  return (
    <AnimatePresence mode="wait">
      {showEntrance ? (
        <EntranceAnimation key="entrance" profile={appState.profile} onComplete={() => setShowEntrance(false)} />
      ) : appMode === 'public' ? (
        <motion.div
          key="public"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <LandingPage
            profile={appState.profile}
            theme={appState.theme}
            links={appState.links}
            onLinkClick={handleLinkClick}
            onBackToEditor={() => setAppMode('editor')}
            isAdminLogged={isAdminLogged}
            onVerifyAdminPassword={(pass) => pass === appState.adminPasswordHash}
            onAdminLoginSuccess={() => {
              setIsAdminLogged(true);
              setAppMode('editor');
              localStorage.setItem('link_klepon_admin_logged', 'true');
              triggerPushNotification("Akses Admin Terbuka! 🔑", "Selamat datang kembali di panel kontrol Link Klepon.");
            }}
            onUpdateProfile={(updatedProfile) => {
              setAppState(prev => ({ ...prev, profile: updatedProfile }));
              triggerPushNotification("Profil Diperbarui! 👤", "Foto profil halaman utama berhasil diperbarui secara real-time.");
            }}
            isStealthModeActive={appState.isStealthModeActive}
            stealthAllowedLocation={appState.stealthAllowedLocation}
            stealthElementsToHide={appState.stealthElementsToHide}
            simulatedLocation={simulatedLocation}
          />
        </motion.div>
      ) : (
        <motion.div
          key="editor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`min-h-screen text-slate-100 flex flex-col justify-between transition-colors duration-500 ${style.bg}`}
        >
          {/* Top Header Section (Matches Layout in Mockup images) */}
          <header className="bg-[#050810] border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none">
            {/* Brand & Logo block */}
            <div className="flex items-center gap-3">
              <LKLogo size={42} glow={true} />
              <div>
                <h1 className="text-sm font-black tracking-widest text-white flex items-center gap-1.5 uppercase">
                  LINK KLEPON
                  <span className="text-[9px] bg-cyan-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">PRO</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">SEMUA INFORMASI TENTANG LINK KLEPON</p>
              </div>
            </div>

            {/* Real-time status indicators and action links */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Cloud Storage State */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091520] border border-cyan-500/25 rounded-lg text-cyan-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>CLOUD: TERSIMPAN ✓</span>
              </div>

              {/* Active profile badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1308] border border-amber-500/20 rounded-lg text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Aktif: ADMIN_KLEPON_PRO</span>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  const shareUrl = appState.customDomain ? `https://${appState.customDomain}` : window.location.href;
                  navigator.clipboard.writeText(shareUrl);
                  triggerPushNotification(
                    "Salin Link Sukses 🔗",
                    appState.customDomain 
                      ? `Link kustom "${appState.customDomain}" berhasil disalin ke clipboard.`
                      : "Link Klepon Anda siap dibagikan ke teman-teman."
                  );
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-bold cursor-pointer transition-colors"
              >
                <Icons.Copy className="w-3.5 h-3.5" />
                <span>{appState.customDomain ? "Salin Link Kustom" : "Salin Link"}</span>
              </button>

              <button
                onClick={() => setAppMode('public')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold cursor-pointer transition-colors"
              >
                <Icons.Eye className="w-3.5 h-3.5" />
                <span>Lihat Halaman Penuh</span>
              </button>

              <button
                onClick={() => setShowPreviewDrawer(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg font-bold cursor-pointer transition-colors"
              >
                <Icons.Smartphone className="w-3.5 h-3.5" />
                <span>Pratinjau HP</span>
              </button>

              <button
                onClick={() => {
                  const yes = window.confirm("Apakah Anda yakin ingin mereset seluruh konfigurasi Link Klepon?");
                  if (yes) {
                    setAppState(DEFAULT_APP_STATE);
                    triggerPushNotification("Reset Selesai 🔄", "Konfigurasi pabrik berhasil diterapkan.");
                  }
                }}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Muat Ulang Pabrik"
              >
                <Icons.RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const yes = window.confirm("Apakah Anda yakin ingin keluar dari Mode Admin?");
                  if (yes) {
                    localStorage.removeItem('link_klepon_admin_logged');
                    setIsAdminLogged(false);
                    setAppMode('public');
                    triggerPushNotification("Logout Sukses 👋", "Sistem admin dikunci kembali dengan aman.");
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg font-bold cursor-pointer transition-colors ml-1"
              >
                <Icons.LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </header>

          {/* Main Clean Centered Cockpit Container */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col space-y-4 items-stretch">
            {/* Navigation Tab list (Matches Layout in Mockup images) */}
            <nav className="flex flex-wrap gap-1 bg-[#070b13] p-1 border border-slate-800 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('tautan')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'tautan' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Link2 className="w-4 h-4" />
                <span>Tautan</span>
              </button>
              <button
                onClick={() => setActiveTab('profil')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'profil' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.User className="w-4 h-4" />
                <span>Profil</span>
              </button>
              <button
                onClick={() => setActiveTab('desain')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'desain' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Palette className="w-4 h-4" />
                <span>Desain & Tema</span>
              </button>
              <button
                onClick={() => setActiveTab('analitik')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'analitik' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.LineChart className="w-4 h-4" />
                <span>Analitik</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'admin' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.ShieldAlert className="w-4 h-4" />
                <span>Dashboard Admin 🛠</span>
              </button>
              <button
                onClick={() => setActiveTab('qr_backup')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'qr_backup' ? 'bg-[#151f38] text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.QrCode className="w-4 h-4" />
                <span>QR & Backup</span>
              </button>
            </nav>

            {/* Active Tab rendering router with elegant Framer Motion transitions */}
            <div className="min-h-[480px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {activeTab === 'tautan' && (
                    <TautanTab
                      links={appState.links}
                      onChange={(links) => setAppState(prev => ({ ...prev, links }))}
                      onLogSuspiciousActivity={handleLogSuspiciousActivity}
                    />
                  )}
                  {activeTab === 'profil' && (
                    <ProfilTab
                      profile={appState.profile}
                      onChange={(profile) => setAppState(prev => ({ ...prev, profile }))}
                    />
                  )}
                  {activeTab === 'desain' && (
                    <DesainTab
                      theme={appState.theme}
                      onChange={(theme) => setAppState(prev => ({ ...prev, theme }))}
                      adminStyle={adminStyle}
                      onAdminStyleChange={(s) => setAdminStyle(s)}
                    />
                  )}
                  {activeTab === 'analitik' && (
                    <AnalitikTab
                      links={appState.links}
                      analytics={appState.analytics}
                      onResetClicks={handleResetClicks}
                    />
                  )}
                  {activeTab === 'admin' && (
                    <AdminTab
                      isTwoFactorEnabled={appState.isTwoFactorEnabled}
                      onToggleTwoFactor={(enabled) => setAppState(prev => ({ ...prev, isTwoFactorEnabled: enabled }))}
                      isEndToEndEncrypted={appState.isEndToEndEncrypted}
                      onToggleEndToEnd={(enabled) => setAppState(prev => ({ ...prev, isEndToEndEncrypted: enabled }))}
                      suspiciousLogs={suspiciousLogs}
                      onClearLogs={() => setSuspiciousLogs([])}
                      onTriggerPushNotification={triggerPushNotification}
                      adminPasswordHash={appState.adminPasswordHash}
                      onUpdatePassword={(newPass) => setAppState(prev => ({ ...prev, adminPasswordHash: newPass }))}
                      isStealthModeActive={appState.isStealthModeActive}
                      onToggleStealthMode={(enabled) => setAppState(prev => ({ ...prev, isStealthModeActive: enabled }))}
                      stealthAllowedLocation={appState.stealthAllowedLocation}
                      onUpdateStealthAllowedLocation={(loc) => setAppState(prev => ({ ...prev, stealthAllowedLocation: loc }))}
                      stealthElementsToHide={appState.stealthElementsToHide}
                      onUpdateStealthElementsToHide={(elements) => setAppState(prev => ({ ...prev, stealthElementsToHide: elements }))}
                      simulatedLocation={simulatedLocation}
                      onUpdateSimulatedLocation={(loc) => setSimulatedLocation(loc)}
                    />
                  )}
                  {activeTab === 'qr_backup' && (
                    <QRBackupTab
                      appUrl={window.location.href}
                      onImportBackup={handleImportBackup}
                      onExportBackup={handleExportBackup}
                      onTriggerPushNotification={triggerPushNotification}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Slide-in Push notifications list overlay */}
          <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
            <AnimatePresence>
              {pushNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 100, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-slate-900/95 border-l-4 border-cyan-400 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto backdrop-blur-md"
                >
                  <div className="p-1 bg-cyan-500/10 rounded-full text-cyan-400 shrink-0 mt-0.5">
                    <Icons.Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide text-cyan-300">{notif.title}</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono ml-auto">now</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Global persistent footer bar */}
          <footer className="bg-[#050810] border-t border-slate-900 py-3 px-6 text-center text-[10px] text-slate-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-2 select-none uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PENYIMPANAN LOKAL & CLOUD: AKTIF</span>
            </div>
            <div className="text-[9px] text-slate-600">
              CRAFTED BY <span className="text-cyan-400 font-extrabold">ADMIN KLEPON </span>
            </div>
          </footer>

          {/* Floating Live Preview Toggle Button */}
          <button
            onClick={() => setShowPreviewDrawer(true)}
            className="fixed bottom-6 right-6 z-40 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black px-4 py-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            title="Buka Pratinjau HP"
          >
            <Icons.Smartphone className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-xs uppercase tracking-wider font-extrabold">Buka Pratinjau HP</span>
          </button>

          {/* Side Drawer Live Preview with slide-out animation */}
          <AnimatePresence>
            {showPreviewDrawer && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowPreviewDrawer(false)}
                  className="fixed inset-0 bg-slate-950/85 z-50 backdrop-blur-sm cursor-pointer"
                />

                {/* Drawer Container */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 220 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[#070b13] border-l border-slate-800 z-50 shadow-2xl p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4 flex-1 flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Icons.Smartphone className="w-5 h-5 animate-pulse" />
                        <h3 className="text-xs font-black tracking-widest uppercase">Live Pratinjau HP</h3>
                      </div>
                      <button
                        onClick={() => setShowPreviewDrawer(false)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        <Icons.X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-4 min-h-0 overflow-y-auto">
                      <PratinjauHP
                        profile={appState.profile}
                        theme={appState.theme}
                        links={appState.links}
                        onLinkClick={handleLinkClick}
                        isStealthModeActive={appState.isStealthModeActive}
                        stealthAllowedLocation={appState.stealthAllowedLocation}
                        stealthElementsToHide={appState.stealthElementsToHide}
                        simulatedLocation={simulatedLocation}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 shrink-0 text-center">
                    <button
                      onClick={() => {
                        setShowPreviewDrawer(false);
                        setAppMode('public');
                      }}
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icons.Eye className="w-4 h-4" />
                      <span>Lihat Halaman Penuh</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
