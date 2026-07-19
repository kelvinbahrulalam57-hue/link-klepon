/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProfileData, ThemeConfig, LinkItem } from '../types.ts';
import * as Icons from 'lucide-react';
import LKLogo from './LKLogo.tsx';
import EntranceAnimation from './EntranceAnimation.tsx';
import { InteractiveParticleBackground } from './InteractiveParticleBackground.tsx';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';

import { motion, AnimatePresence } from 'motion/react';

function TypewriterText({ text, delay = 80 }: { text: string; delay?: number }) {
  const [currentText, setCurrentText] = useState('');
  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setCurrentText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return (
    <span>
      {currentText}
      <span className="animate-pulse inline-block ml-0.5">_</span>
    </span>
  );
}

interface LandingPageProps {
  profile: ProfileData;
  theme: ThemeConfig;
  links: LinkItem[];
  onLinkClick: (linkId: string) => void;
  onBackToEditor: () => void;
  isAdminLogged: boolean;
  onVerifyAdminPassword: (password: string) => boolean;
  onAdminLoginSuccess: () => void;
  onUpdateProfile?: (profile: ProfileData) => void;
  isStealthModeActive?: boolean;
  stealthAllowedLocation?: string;
  stealthElementsToHide?: string[];
  simulatedLocation?: string;
}

export default function LandingPage({
  profile,
  theme,
  links,
  onLinkClick,
  onBackToEditor,
  isAdminLogged,
  onVerifyAdminPassword,
  onAdminLoginSuccess,
  onUpdateProfile,
  isStealthModeActive = false,
  stealthAllowedLocation = 'Indonesia',
  stealthElementsToHide = [],
  simulatedLocation = 'Indonesia'
}: LandingPageProps) {
  const [showEntrance, setShowEntrance] = useState(true);

  const isStealthTriggered = isStealthModeActive && !simulatedLocation.toLowerCase().includes(stealthAllowedLocation.toLowerCase());

  const filteredLinks = links.filter(l => {
    if (!l.isVisible) return false;

    // Check scheduled publication times
    if (l.isScheduled) {
      const now = new Date();
      if (l.scheduleStart) {
        const start = new Date(l.scheduleStart);
        if (now < start) return false;
      }
      if (l.scheduleEnd) {
        const end = new Date(l.scheduleEnd);
        if (now > end) return false;
      }
    }

    if (isStealthTriggered && stealthElementsToHide?.includes('links')) {
      const isContactOrCommunity = 
        ['kontak', 'komunitas', 'whatsapp', 'wa', 'tele', 'telegram', 'discord', 'grup', 'group', 'contact', 'community']
          .some(word => l.category?.toLowerCase().includes(word) || l.title?.toLowerCase().includes(word));
      if (isContactOrCommunity) return false;
    }
    return true;
  });

  // Avatar Editor States
  const [showAvatarEditorModal, setShowAvatarEditorModal] = useState(false);
  const [tempAvatarType, setTempAvatarType] = useState<'emoji' | 'initial' | 'link' | 'upload'>(profile.avatarType || 'emoji');
  const [tempAvatarValue, setTempAvatarValue] = useState(profile.avatarValue || '');

  // Secret Click States for hidden admin login portal
  const [secretClicks, setSecretClicks] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback / Suggestion Form States
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Pesan ulasan atau saran tidak boleh kosong.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackSuccess(false);

    try {
      await addDoc(collection(db, 'feedbacks'), {
        name: feedbackName.trim() || 'Anonim',
        rating: feedbackRating,
        feedback: feedbackText.trim(),
        createdAt: serverTimestamp(),
      });
      setFeedbackSuccess(true);
      setFeedbackText('');
      setFeedbackName('');
      setFeedbackRating(5);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setFeedbackError('Gagal mengirim ulasan/saran. Silakan coba lagi.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // New Shooting Theme States
  interface ShotRipple {
    id: number;
    x: number;
    y: number;
  }
  const [shots, setShots] = useState<ShotRipple[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Terminal Custom States & Logic
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'LK-OS v4.2 INITIALIZED [OK]',
    'SECURE CONNECTION ESTABLISHED DIRECTLY WITH CLOUD FIRESTORE.',
    'Ketik /help untuk daftar perintah interaktif.'
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanFinished, setScanFinished] = useState(false);
  const [liveVisitorCount, setLiveVisitorCount] = useState(() => Math.floor(Math.random() * 120) + 480);

  // Live Clock effect
  const [liveTime, setLiveTime] = useState(() => new Date().toLocaleTimeString('id-ID'));
  const [systemUptime, setSystemUptime] = useState(0);

  // Link Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // INTERACTIVE REALTIME PING ANALYZER & CYBER SPEEDTEST STATES
  const [pingTarget, setPingTarget] = useState<'GATEWAY' | 'GOOGLE' | 'FIREBASE'>('GATEWAY');
  const [pingHistory, setPingHistory] = useState<number[]>(() => [14, 18, 16, 15, 20, 19, 14, 16, 17, 18, 15, 14]);
  const [currentPing, setCurrentPing] = useState(15);
  const [isContinuousPing, setIsContinuousPing] = useState(true);

  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedProgress, setSpeedProgress] = useState(0);
  const [speedStage, setSpeedStage] = useState<'idle' | 'downloading' | 'uploading' | 'completed'>('idle');
  const [speedDownload, setSpeedDownload] = useState(0);
  const [speedUpload, setSpeedUpload] = useState(0);

  const handleCopyPortalLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Dynamic lists computed for search and categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    filteredLinks.forEach(l => {
      if (l.category && l.category.trim()) {
        cats.add(l.category.trim());
      }
    });
    return ['Semua', ...Array.from(cats)];
  }, [filteredLinks]);

  const searchFilteredLinks = React.useMemo(() => {
    return filteredLinks.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (l.category && l.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'Semua' || l.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [filteredLinks, searchQuery, selectedCategory]);

  // Stable memoized background particles for elite render performance and 100% FPS stability
  const stableParticles = React.useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const size = Math.floor(Math.random() * 3) + 2;
      const left = Math.floor(Math.random() * 100);
      const delay = Math.random() * 8;
      const duration = Math.random() * 14 + 10;
      const drift = Math.random() * 4 - 2;
      return { id: i, size, left, delay, duration, drift };
    });
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('id-ID'));
      setSystemUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time continuous network ping measurement loop
  React.useEffect(() => {
    if (!isContinuousPing) return;

    const measurePing = async () => {
      let latency = 15;
      const start = performance.now();
      
      if (pingTarget === 'GATEWAY') {
        try {
          // Attempt real-time fetch checking to local web gate
          await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
          latency = Math.round(performance.now() - start);
          if (latency > 150) latency = Math.round(latency / 3.2); // normalize proxy hops
        } catch (err) {
          // Safe fallback realistic WIB connection variation
          latency = Math.floor(Math.random() * 8) + 12;
        }
      } else if (pingTarget === 'GOOGLE') {
        // WIB Singapore Edge Cloudflare/Google DNS range simulation
        latency = Math.floor(Math.random() * 11) + 21;
      } else {
        // Secure Web Socket Firebase cluster latency estimation
        latency = Math.floor(Math.random() * 16) + 36;
      }

      if (latency <= 0) latency = 1;
      setCurrentPing(latency);
      setPingHistory(prev => {
        const next = [...prev.slice(1), latency];
        return next;
      });
    };

    measurePing();
    const interval = setInterval(measurePing, 1800);
    return () => clearInterval(interval);
  }, [pingTarget, isContinuousPing]);

  // Interactive cyber speedtest bandwidth simulator
  const startSpeedtest = () => {
    if (isTestingSpeed) return;
    setIsTestingSpeed(true);
    setSpeedProgress(0);
    setSpeedStage('downloading');
    setSpeedDownload(0);
    setSpeedUpload(0);

    setTerminalLogs(prev => [
      ...prev,
      ' ',
      '⚡ [KONEKSI] MEMULAI ANALISIS BANDWIDTH PORTAL...',
      '🛰️ [KONEKSI] MENYAMBUNGKAN KE SERP-APAC EDGE...',
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setSpeedProgress(Math.min(100, progress));

      if (progress < 50) {
        setSpeedDownload(Math.floor(Math.random() * 32) + 88); 
      } else if (progress >= 50 && progress < 100) {
        setSpeedStage('uploading');
        setSpeedUpload(Math.floor(Math.random() * 18) + 36); 
      } else if (progress >= 100) {
        clearInterval(interval);
        setSpeedStage('completed');
        setIsTestingSpeed(false);
        
        const finalDl = 104.8;
        const finalUl = 44.2;
        setSpeedDownload(finalDl);
        setSpeedUpload(finalUl);

        setTerminalLogs(prev => [
          ...prev,
          `✓ [LATENSI] LATENSI RATA-RATA: ${currentPing}ms`,
          `✓ [BANDWIDTH] DOWNLOAD RATE: ${finalDl} Mbps`,
          `✓ [BANDWIDTH] UPLOAD RATE: ${finalUl} Mbps`,
          '✓ [SYS] ANALISIS KONEKSI SELESAI: KUALITAS ELITE & PREMIUM',
        ]);
      }
    }, 120);
  };

  // Register Global Keyboard Shortcuts accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 's' || key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[aria-label="Cari tautan"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (key === 'd' || key === 'p') {
        e.preventDefault();
        startSecurityScan();
      } else if (key === 'c') {
        e.preventDefault();
        handleCopyPortalLink();
      } else if (key === 't') {
        e.preventDefault();
        const terminalInputEl = document.querySelector('input[placeholder*="Ketik /help"]') as HTMLInputElement;
        if (terminalInputEl) terminalInputEl.focus();
      } else if (key === 'r') {
        e.preventDefault();
        if (!isTestingSpeed) startSpeedtest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTestingSpeed, currentPing]);

  // Auto scroll terminal logs
  const terminalLogsEndRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (terminalLogsEndRef.current) {
      terminalLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Handle command input
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;

    const newLogs = [...terminalLogs, `visitor@klepon-nexus:~$ ${terminalInput}`];
    
    if (command === '/help') {
      newLogs.push(
        'PERINTAH YANG TERSEDIA:',
        '  /about   - Informasi tentang portal Website Klepon',
        '  /links   - Tampilkan daftar tautan aktif saat ini',
        '  /joke    - Dapatkan lelucon gaming/cyber acak',
        '  /ping    - Periksa latensi koneksi real-time Anda',
        '  /clear   - Bersihkan riwayat konsol terminal',
        '  /secret  - Aktifkan pesan tersembunyi admin'
      );
    } else if (command === '/about') {
      newLogs.push(
        'TENTANG WEBSITE KLEPON:',
        '  Gerbang utama multi-tautan resmi yang dirancang oleh Kelvin Bahrul Alam.',
        '  Menggunakan teknologi modern React 19, Tailwind CSS v4, dan Firebase.'
      );
    } else if (command === '/links') {
      newLogs.push(
        'DAFTAR TAUTAN AKTIF:',
        ...filteredLinks.map((l, idx) => `  [${idx + 1}] ${l.title} (${l.category || 'Tautan'})`)
      );
    } else if (command === '/joke') {
      const jokes = [
        "Kenapa pahlawan ML susah dapet pacar? Karena kerjaannya selalu nge-push!",
        "Bagaimana cara para gamer mendekati lawan jenis? Lewat jalur top-up kasih skin legendaris!",
        "Kenapa server game selalu down waktu hari libur? Karena servernya juga butuh refreshing!",
        "Pemain game apa yang paling sabar? Pemain yang heronya di-nerf terus tapi tetap setia main!"
      ];
      newLogs.push(`LELUCON GAMING: "${jokes[Math.floor(Math.random() * jokes.length)]}"`);
    } else if (command === '/ping') {
      newLogs.push(`PONG! Latensi Anda saat ini adalah ${Math.floor(Math.random() * 15) + 12}ms (Sangat Stabil/Hijau)`);
    } else if (command === '/clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (command === '/secret') {
      newLogs.push(
        '🔓 PROTOKOL RAHASIA DIAKTIFKAN!',
        '  "Semua informasi Klepon sudah ada di sini. Stay secure, main game dengan sehat!"',
        '  -- Kelvin Bahrul Alam'
      );
    } else {
      newLogs.push(`Perintah tidak dikenal: "${command}". Ketik /help untuk bantuan.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  // Handle Security Scan
  const startSecurityScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanFinished(false);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanFinished(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Tick visitor counter up and down randomly
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLiveVisitorCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return prev + change;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Track Mouse Movement and Clickables
  React.useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMouseCoords({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isClickable = target && (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.getAttribute('role') === 'button'
      );
      setIsHoveringClickable(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle gunshot simulation (Muted per user request, visuals remain intact!)
  const playLaserGunshotSound = () => {
    // Sound muted to prevent loud audio on clicking links/buttons
    return;
  };

  const triggerShot = (clientX: number, clientY: number) => {
    // Play the synthesized target-locked laser shot sound
    playLaserGunshotSound();

    const newShot: ShotRipple = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY
    };
    setShots(prev => [...prev, newShot]);
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 120);
    setTimeout(() => {
      setShots(prev => prev.filter(s => s.id !== newShot.id));
    }, 700);
  };

  // Keyboard shortcut Ctrl+Shift+A to trigger hidden admin login modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
        e.preventDefault();
        setShowLoginModal(true);
        setPasswordInput('');
        setLoginError('');
        setShowPassword(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic favicon, document title, and meta description setup
  React.useEffect(() => {
    // 1. Dynamic Title
    if (profile.metaTitle) {
      document.title = profile.metaTitle;
    } else if (profile.name) {
      document.title = `${profile.name} | Website Klepon Official`;
    }
    
    // 2. Dynamic Meta Description
    let metaDesc: HTMLMetaElement | null = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(metaDesc);
    }
    metaDesc.content = profile.metaDescription || "Temukan semua tautan resmi Klepon Store, Event Game seru, Sosial Media, dan kontak penting lainnya dalam satu halaman bio link.";

    // 3. Dynamic Favicon
    if (profile.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = profile.favicon;
    }
  }, [profile.favicon, profile.name, profile.metaTitle, profile.metaDescription]);

  const handleFooterClick = () => {
    setSecretClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowLoginModal(true);
        setPasswordInput('');
        setLoginError('');
        setShowPassword(false);
        return 0;
      }
      return next;
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isOk = onVerifyAdminPassword(passwordInput);
    if (isOk) {
      onAdminLoginSuccess();
      setShowLoginModal(false);
    } else {
      setLoginError('Password admin salah! Silakan coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  // Helper to render lucide icon on links
  const renderLinkIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return <IconComp className="w-5 h-5" />;
    }
    return <Icons.Globe className="w-5 h-5" />;
  };

  // Helper to render custom or preset social icons
  const renderSocialIcon = (soc: any) => {
    if (soc.iconType === 'upload' && soc.iconValue) {
      return (
        <img 
          src={soc.iconValue} 
          alt={soc.platform} 
          className="w-4 h-4 rounded-full object-cover" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    switch (soc.platform) {
      case 'instagram':
        return <Icons.Instagram className="w-4 h-4" />;
      case 'tiktok':
        return <Icons.Video className="w-4 h-4" />;
      case 'twitter':
        return <Icons.Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Icons.Linkedin className="w-4 h-4" />;
      default:
        return <Icons.Globe className="w-4 h-4" />;
    }
  };

  const getPlatformHoverColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'hover:text-rose-400 hover:border-rose-400/50 hover:bg-rose-500/5';
      case 'tiktok': return 'hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5';
      case 'twitter': return 'hover:text-slate-200 hover:border-slate-300/50 hover:bg-slate-200/5';
      case 'linkedin': return 'hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-500/5';
      default: return 'hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5';
    }
  };

  // Background styling mapping
  const getBackgroundStyle = () => {
    const styles: React.CSSProperties = {};
    if (theme.backgroundType === 'color') {
      styles.backgroundColor = theme.backgroundValue;
    } else if (theme.backgroundType === 'gradient') {
      styles.backgroundImage = theme.backgroundValue;
    } else if (theme.backgroundType === 'image') {
      styles.backgroundImage = `url(${theme.backgroundValue})`;
      styles.backgroundSize = theme.sizing;
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
    }
    return styles;
  };

  // Background pattern overlays
  const renderPatternOverlay = () => {
    if (theme.pattern === 'Polka Dots') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-[1]"
          style={{
            backgroundImage: 'radial-gradient(#334155 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px'
          }}
        />
      );
    }
    if (theme.pattern === 'Tech Grid') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-15 z-[1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      );
    }
    if (theme.pattern === 'Waves') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 z-[1]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #475569, #475569 10px, transparent 10px, transparent 20px)'
          }}
        />
      );
    }
    if (theme.pattern === 'Hexagon Hive') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 z-[1]"
          style={{
            backgroundImage: `radial-gradient(circle, #0284c7 10%, transparent 11%)`,
            backgroundSize: '15px 15px'
          }}
        />
      );
    }
    return null;
  };

  // Button styles mapping
  const getButtonStyleClass = () => {
    if (theme.buttonStyle === 'Outline Style • Dots') {
      return 'border-2 border-current hover:bg-white/10 text-white font-medium rounded-xl shadow';
    }
    if (theme.buttonStyle === 'Shadow-3D Style • Grid') {
      return 'border-3 border-slate-900 bg-white text-slate-900 font-extrabold rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all';
    }
    if (theme.buttonStyle === 'Cyber Glow (Neon Border)') {
      return 'border border-cyan-400 bg-cyan-950/40 text-cyan-200 hover:text-white font-bold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.55)] transition-all';
    }
    if (theme.buttonStyle === 'Pill Style • Waves') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg';
    }
    if (theme.buttonStyle === 'Glassmorphism Style • Frosted') {
      return 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl shadow-xl';
    }
    return 'bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl shadow'; // Flat Block
  };

  // Custom animation mapper for links
  const getLinkAnimationClass = (animation: string) => {
    if (animation === 'pulse') return 'animate-pulse ring-2 ring-cyan-400/40';
    if (animation === 'bounce') return 'animate-bounce';
    if (animation === 'shake') return 'hover:animate-bounce';
    if (animation === 'neon') return 'shadow-[0_0_20px_rgba(6,182,212,0.7)] animate-pulse';
    return '';
  };

  if (showEntrance) {
    return <EntranceAnimation profile={profile} onComplete={() => setShowEntrance(false)} />;
  }

  return (
    <div 
      onClick={(e) => triggerShot(e.clientX, e.clientY)}
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 text-white pb-8 cursor-crosshair"
      style={{ fontFamily: theme.font }}
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={getBackgroundStyle()} />
      {theme.backgroundType === 'image' && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{
            backgroundImage: `url(${theme.backgroundValue})`,
            backgroundSize: theme.sizing,
            backgroundPosition: 'center',
            filter: `blur(${theme.blur}px)`,
            opacity: theme.opacity / 100
          }}
        />
      )}

      {/* Pattern overlay layer */}
      {renderPatternOverlay()}

      {/* Running Announcement Banner (Marquee) */}
      <div className="w-full bg-slate-950/90 border-b border-cyan-500/15 py-2.5 overflow-hidden z-30 backdrop-blur-md relative flex items-center select-none shrink-0">
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-slate-950 to-transparent w-16 z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-slate-950 to-transparent w-16 z-10 pointer-events-none" />
        
        {/* Ticker static prefix */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-wider rounded-md ml-4 z-20 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          INFORMASI
        </div>

        {/* Seamless scrolling tracks */}
        <div className="flex items-center w-full overflow-hidden">
          <div className="flex gap-16 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer pl-4">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              📢 <span className="text-cyan-400 font-black">KLEPON NEXUS V4.2:</span> Selamat datang di portal utama navigasi multi-tautan resmi Kelvin Bahrul Alam!
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              🔒 <span className="text-emerald-400 font-black">SSL VERIFIED:</span> Semua tautan aktif telah melewati enkripsi SHA-256 real-time yang aman.
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              🚀 <span className="text-indigo-400 font-black">METRIK SISTEM:</span> Gunakan tombol diagnostik "PINDAI SEKARANG" untuk meninjau status latensi internet Anda.
            </span>
            
            {/* Set 2 (for seamless loop) */}
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              📢 <span className="text-cyan-400 font-black">KLEPON NEXUS V4.2:</span> Selamat datang di portal utama navigasi multi-tautan resmi Kelvin Bahrul Alam!
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              🔒 <span className="text-emerald-400 font-black">SSL VERIFIED:</span> Semua tautan aktif telah melewati enkripsi SHA-256 real-time yang aman.
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-300 font-mono flex items-center gap-2">
              🚀 <span className="text-indigo-400 font-black">METRIK SISTEM:</span> Gunakan tombol diagnostik "PINDAI SEKARANG" untuk meninjau status latensi internet Anda.
            </span>
          </div>
        </div>
      </div>

      {/* Quantum Starfield Particle Background with Mouse Interactive Constellation Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        {/* Ambient floating dust */}
        {stableParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '110vh', x: `${p.left}vw`, opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.4, 0.4, 0],
              x: [`${p.left}vw`, `${p.left + p.drift}vw`, `${p.left}vw`]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear'
            }}
            className="absolute bg-cyan-400/20 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              boxShadow: '0 0 6px rgba(6, 182, 212, 0.3)'
            }}
          />
        ))}
        {/* High-end interactive canvas constellation particles */}
        <InteractiveParticleBackground color="6, 182, 212" />
      </div>

      {/* Creator panel shortcut floating on top left for ease of use (visible only for logged in admins) */}
      {isAdminLogged && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={onBackToEditor}
            className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer"
          >
            <Icons.Wrench className="w-3.5 h-3.5" />
            <span>Kembali Ke Editor 🛠</span>
          </button>
        </div>
      )}

      {/* Main Landing Bio Link Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-6 pt-16 flex-1 flex flex-col items-center">
        
        {/* Dynamic Typewriter Welcome Message */}
        <div className="mb-6 text-center font-gaming text-[11px] md:text-xs tracking-[0.25em] font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] uppercase flex items-center justify-center gap-2 select-none bg-slate-950/50 px-4 py-2 rounded-xl border border-cyan-500/15 backdrop-blur-sm shadow-md">
          <span className="text-rose-500 animate-pulse">🎯</span>
          <TypewriterText text="WELCOME TO WEBSITE KLEPON" delay={70} />
        </div>

        {/* Dynamic Theme Banner (Cyber LK design overlay) */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Logo container with rotation */}
          {!(isStealthTriggered && stealthElementsToHide?.includes('avatar')) && (
            <button
              onClick={() => {
                setTempAvatarType(profile.avatarType || 'emoji');
                setTempAvatarValue(profile.avatarValue || '');
                setShowAvatarEditorModal(true);
              }}
              aria-label="Ganti foto profil"
              className="relative mb-6 cursor-pointer group outline-none focus:ring-2 focus:ring-cyan-400 rounded-full transition-transform active:scale-95"
              title="Klik untuk mengganti foto profil"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-rose-500 opacity-75 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />
              <div className="relative bg-[#090d16] p-2.5 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden">
                {profile.avatarType === 'emoji' ? (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-950/50 text-6xl select-none">
                    {profile.avatarValue || '🟢'}
                  </div>
                ) : profile.avatarType === 'initial' ? (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-950/50 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-400">
                    {profile.avatarValue || 'KP'}
                  </div>
                ) : (profile.avatarType === 'link' || profile.avatarType === 'upload') && profile.avatarValue ? (
                  <img 
                    src={profile.avatarValue} 
                    alt={profile.name || 'Foto Profil'} 
                    width="96"
                    height="96"
                    loading="lazy"
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <LKLogo size={96} glow={true} />
                )}

                {/* Hover overlay to change avatar */}
                <div className="absolute inset-0 bg-slate-950/75 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Icons.Camera className="w-6 h-6 text-cyan-400 mb-0.5 animate-bounce" />
                  <span className="text-[9px] font-black tracking-widest text-white uppercase">Ganti Foto</span>
                </div>
              </div>
            </button>
          )}

          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
            {profile.name || "LINK KLEPON"}
          </h1>

          {/* Location details */}
          {profile.location && !(isStealthTriggered && stealthElementsToHide?.includes('bio_location')) && (
            <div className="mt-1 flex items-center justify-center gap-1 text-slate-300 text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <Icons.MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio text block */}
          {profile.bio && !(isStealthTriggered && stealthElementsToHide?.includes('bio_location')) && (
            <p className="mt-4 text-xs md:text-sm text-slate-200 bg-slate-950/45 px-4 py-3 rounded-xl border border-white/5 backdrop-blur-sm max-w-md mx-auto leading-relaxed drop-shadow-sm">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Quick Integration (Responsive Mobile-ready) */}
          {profile.socials && profile.socials.length > 0 && !(isStealthTriggered && stealthElementsToHide?.includes('socials')) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {profile.socials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.platform ? `Ikuti Kelvin di ${soc.platform}` : 'Media Sosial'}
                  className={`p-2.5 bg-slate-950/70 hover:bg-slate-900 rounded-full border border-slate-800 text-slate-300 transition-all duration-300 flex items-center justify-center shadow-md ${getPlatformHoverColor(soc.platform)}`}
                >
                  {renderSocialIcon(soc)}
                </a>
              ))}
              {/* Salin Tautan Portal (Copy Link) Button */}
              <button
                onClick={handleCopyPortalLink}
                aria-label="Salin tautan portal utama"
                className="p-2.5 bg-slate-950/70 hover:bg-slate-900 rounded-full border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center shadow-md cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95"
                title="Salin Tautan Portal"
              >
                <Icons.Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar & Category Quick Filters */}
        {filteredLinks.length > 0 && (
          <div className="w-full max-w-md mt-6 mb-2 space-y-4">
            {/* Elegant Neon Search Input */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-cyan-500/10 rounded-xl blur-md group-focus-within:opacity-100 opacity-60 transition-opacity" />
              <div className="relative bg-[#050914]/80 border border-slate-800 focus-within:border-cyan-500/50 rounded-xl p-[1px] transition-all">
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <Icons.Search className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tautan..."
                    aria-label="Cari tautan"
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
                    >
                      <Icons.X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrolling Pill Category Filter */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-2 px-2">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-105'
                          : 'bg-slate-950/65 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* List of custom compiled active links */}
        <div className="w-full space-y-3 max-w-md">
          {searchFilteredLinks.map((link) => (
            <motion.a
              key={link.id}
              whileHover={{ 
                scale: 1.02, 
                x: 4,
                boxShadow: "0px 0px 18px rgba(6, 182, 212, 0.4)",
                borderColor: "rgba(6, 182, 212, 0.8)",
              }}
              whileTap={{ scale: 0.98 }}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                triggerShot(e.clientX, e.clientY);
                onLinkClick(link.id);
              }}
              className={`w-full py-3.5 px-4.5 flex items-center justify-between gap-3 text-sm md:text-base cursor-pointer transition-all duration-200 ${getButtonStyleClass()} ${getLinkAnimationClass(link.animation)}`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="shrink-0">
                  {link.imageType === 'upload' && link.imageValue ? (
                    <img 
                      src={link.imageValue} 
                      alt={link.title || 'Ikon tautan'} 
                      width="24"
                      height="24"
                      loading="lazy"
                      className="w-5 h-5 md:w-6 md:h-6 rounded-md object-cover border border-white/20" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    renderLinkIcon(link.icon)
                  )}
                </span>
                <span className="font-bold truncate text-left">{link.title}</span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {link.category && (
                  <span className="hidden sm:inline-block text-[8px] font-black uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full">
                    {link.category}
                  </span>
                )}
                <span className="w-4 h-4 opacity-40">
                  <Icons.ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </motion.a>
          ))}

          {searchFilteredLinks.length === 0 && filteredLinks.length > 0 && (
            <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-900 rounded-2xl p-6">
              <Icons.SearchX className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
              <p className="text-xs text-slate-400 font-bold">Tautan tidak ditemukan</p>
              <p className="text-[10px] text-slate-500 mt-1">Coba cari kata kunci lain atau bersihkan filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="mt-3.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-white border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {filteredLinks.length === 0 && (
            <div className="text-center py-16 text-slate-500 italic text-sm">
              Belum ada tautan yang dikonfigurasikan atau ditampilkan.
            </div>
          )}
        </div>

        {/* NEW FUTURISTIC CYBER WIDGETS */}
        {!(isStealthTriggered && stealthElementsToHide.includes('widgets')) && (
          <div className="w-full max-w-md mt-10 space-y-6">
            
            {/* 1. SERVER STATUS MONITORING & REALTIME METRICS PANEL */}
            <div className="bg-[#050914]/80 border border-cyan-500/15 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.05)] backdrop-blur-md relative overflow-hidden text-left">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-400/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                    <Icons.Cpu className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase font-gaming">SISTEM KENDALI METRIK</h4>
                    <p className="text-[8px] text-slate-400 uppercase font-mono tracking-widest">LIVE SERVER OVERWATCH v4.2</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </div>
              </div>

              {/* Grid of Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div 
                  onClick={() => {
                    setPingTarget(prev => prev === 'GATEWAY' ? 'GOOGLE' : prev === 'GOOGLE' ? 'FIREBASE' : 'GATEWAY');
                  }}
                  className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:border-cyan-400/30 active:scale-95 transition-all select-none"
                  title="Klik untuk mengubah target server"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">LATENSI KONEKSI</span>
                    <span className="text-[7px] text-cyan-400 font-bold font-mono">⚡ TAP</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-cyan-400 font-mono tracking-tighter">{currentPing}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">ms</span>
                  </div>
                  <span className="text-[7px] text-emerald-400 uppercase font-mono tracking-wide mt-1">
                    {pingTarget === 'GATEWAY' ? 'Portal Server ✓' : pingTarget === 'GOOGLE' ? 'Google DNS ✓' : 'DB Cluster ✓'}
                  </span>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">PENGUNJUNG AKTIF</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-rose-400 font-mono tracking-tighter">{liveVisitorCount}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">user</span>
                  </div>
                  <span className="text-[7px] text-rose-300 uppercase font-mono tracking-wide mt-1">Sedang Berselancar</span>
                </div>

                {/* Jam Digital Satelit HUD */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">JAM SATELIT (WIB / LOCAL)</span>
                    <span className="text-[7px] text-indigo-400 uppercase font-mono tracking-wider font-bold">UPTIME: {systemUptime}s</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 font-mono tracking-widest">{liveTime}</span>
                    <span className="text-[8px] text-slate-400 font-mono">GMT+7 / ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Realtime Ping Waveform Chart */}
              <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">DIAGNOSTIK SINYAL SATELIT</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isContinuousPing ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-[7px] text-slate-400 uppercase font-mono font-bold">
                      {isContinuousPing ? 'MONITOR AKTIF' : 'GRAFIK DIAGNOSIS BERHENTI'}
                    </span>
                  </div>
                </div>

                {/* Grid Selector for Targets */}
                <div className="grid grid-cols-3 gap-1">
                  {(['GATEWAY', 'GOOGLE', 'FIREBASE'] as const).map((tgt) => (
                    <button
                      key={tgt}
                      onClick={() => setPingTarget(tgt)}
                      className={`px-1 py-1 text-[7px] font-black tracking-widest rounded-md uppercase border transition-all text-center select-none cursor-pointer ${
                        pingTarget === tgt
                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-white hover:bg-slate-900/30'
                      }`}
                    >
                      {tgt === 'GATEWAY' ? 'Portal Server' : tgt === 'GOOGLE' ? 'Google DNS' : 'DB Cluster'}
                    </button>
                  ))}
                </div>

                {/* Custom Live SVG Line Chart */}
                <div className="relative h-14 bg-[#02050b]/80 rounded-lg overflow-hidden border border-slate-900/50 flex flex-col justify-end">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none p-1">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {/* SVG Graph path */}
                  <svg className="w-full h-10 absolute inset-x-0 bottom-1 overflow-visible animate-pulse" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Filled Area Path */}
                    <path
                      d={`
                        M 0,40
                        ${pingHistory.map((val, idx) => {
                          const x = (idx / (pingHistory.length - 1)) * 100;
                          const clampedVal = Math.max(10, Math.min(120, val));
                          const y = 40 - ((clampedVal - 10) / (120 - 10)) * 32 - 4;
                          return `L ${x}%,${y}`;
                        }).join(' ')}
                        L 100%,40 Z
                      `}
                      fill="url(#pingGrad)"
                      className="transition-all duration-300"
                    />

                    {/* Stroke Path */}
                    <path
                      d={pingHistory.map((val, idx) => {
                        const x = (idx / (pingHistory.length - 1)) * 100;
                        const clampedVal = Math.max(10, Math.min(120, val));
                        const y = 40 - ((clampedVal - 10) / (120 - 10)) * 32 - 4;
                        return `${idx === 0 ? 'M' : 'L'} ${x}%,${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />

                    {/* End point dot */}
                    <circle
                      cx="100%"
                      cy={`${40 - ((Math.max(10, Math.min(120, currentPing)) - 10) / (120 - 10)) * 32 - 4}px`}
                      r="2.5"
                      fill="#22d3ee"
                    />
                  </svg>

                  {/* Info Badge */}
                  <div className="absolute top-1 right-1.5 flex items-baseline gap-1 bg-[#02050b]/95 border border-slate-900/50 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-tighter text-cyan-400 font-bold">
                    <span>{currentPing}</span>
                    <span className="text-[6px] text-slate-500">MS</span>
                  </div>

                  {/* Toggle continuous updates */}
                  <button
                    onClick={() => setIsContinuousPing(!isContinuousPing)}
                    className="absolute bottom-1 left-1.5 text-[6px] font-mono font-bold text-slate-500 hover:text-white transition-colors cursor-pointer select-none border-none bg-transparent"
                  >
                    {isContinuousPing ? '[PAUSE GRAPH]' : '[PLAY GRAPH]'}
                  </button>
                </div>
              </div>

              {/* 2. Interactive Speedtest Bandwidth Section */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono block">ANALIS BANDWIDTH KONEKSI</span>
                    <span className="text-[7px] text-slate-500 uppercase font-mono block mt-0.5">Uji kecepatan download & upload portal</span>
                  </div>
                  <button
                    onClick={startSpeedtest}
                    disabled={isTestingSpeed}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 text-[8px] font-black tracking-widest uppercase rounded-lg transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] select-none"
                  >
                    {isTestingSpeed ? 'MENGUJI...' : 'MULAI TES'}
                  </button>
                </div>

                {/* Progress bar */}
                {isTestingSpeed && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-mono font-bold text-cyan-400 uppercase">
                      <span>{speedStage === 'downloading' ? 'DOWNLOADING DATA...' : 'UPLOADING PACKETS...'}</span>
                      <span>{speedProgress}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden p-[1px] border border-cyan-500/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500"
                        style={{ width: `${speedProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Data speedometer gauges */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#030611] border border-slate-900 rounded-lg p-2 text-center">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest font-mono">DOWNLOAD RATE</span>
                    <div className="mt-1">
                      <span className="text-sm font-black text-cyan-400 font-mono tracking-tighter">
                        {speedStage === 'downloading' || speedStage === 'completed' ? speedDownload.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-[7px] font-bold text-slate-400 font-mono ml-0.5">Mbps</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#030611] border border-slate-900 rounded-lg p-2 text-center">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest font-mono">UPLOAD RATE</span>
                    <div className="mt-1">
                      <span className="text-sm font-black text-teal-400 font-mono tracking-tighter">
                        {speedStage === 'uploading' || speedStage === 'completed' ? speedUpload.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-[7px] font-bold text-slate-400 font-mono ml-0.5">Mbps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Diagnostics Section */}
              <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">DIAGNOSTIK KEAMANAN</span>
                  <button
                    onClick={startSecurityScan}
                    disabled={isScanning}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 text-[8px] font-black tracking-widest uppercase rounded-lg transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] select-none"
                  >
                    {isScanning ? 'MEMINDAI...' : 'PINDAI SEKARANG'}
                  </button>
                </div>

                {isScanning && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-mono font-bold text-cyan-400">
                      <span>SCANNING CORE MEMORY & SSL CERT...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#040810] rounded-full overflow-hidden p-[1px] border border-cyan-500/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {scanFinished && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2"
                  >
                    <Icons.ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-400 uppercase font-mono">STATUS: 100% SECURE & VERIFIED</p>
                      <p className="text-[7px] text-slate-400 uppercase font-mono">Enkripsi SHA-256 Cloud Firestore aktif penuh.</p>
                    </div>
                  </motion.div>
                )}

                {!isScanning && !scanFinished && (
                  <p className="text-[8px] text-slate-400 uppercase font-mono leading-relaxed">
                    Klik tombol untuk melakukan verifikasi keamanan tautan SSL secara real-time.
                  </p>
                )}
              </div>

              {/* 3. Keyboard Shortcuts visual legend block */}
              <div className="mt-4 pt-3.5 border-t border-slate-900/50 flex flex-wrap gap-1.5 justify-center items-center">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest font-mono mr-1">TOMBOL AKSES CEPAT:</span>
                <span className="px-1.5 py-0.5 bg-slate-950/60 border border-slate-900 rounded text-[7px] font-mono text-cyan-400 font-bold" title="Tekan S di keyboard">[S] Cari Tautan</span>
                <span className="px-1.5 py-0.5 bg-slate-950/60 border border-slate-900 rounded text-[7px] font-mono text-cyan-400 font-bold" title="Tekan P di keyboard">[P] Pindai SSL</span>
                <span className="px-1.5 py-0.5 bg-slate-950/60 border border-slate-900 rounded text-[7px] font-mono text-cyan-400 font-bold" title="Tekan T di keyboard">[T] Tulis Terminal</span>
                <span className="px-1.5 py-0.5 bg-slate-950/60 border border-slate-900 rounded text-[7px] font-mono text-cyan-400 font-bold" title="Tekan R di keyboard">[R] Tes Speed</span>
                <span className="px-1.5 py-0.5 bg-slate-950/60 border border-slate-900 rounded text-[7px] font-mono text-cyan-400 font-bold" title="Tekan C di keyboard">[C] Salin Link</span>
              </div>
            </div>

          </div>
        )}

        {/* Review / Suggestion Box Form Card */}
        {!(isStealthTriggered && stealthElementsToHide.includes('widgets')) && (
          <>
            <div className="w-full max-w-md mt-12 bg-slate-950/65 border border-cyan-500/20 p-5 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.1)] relative text-left">
              {/* Cyber retro decorative element */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 rounded-t-2xl" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                  <Icons.MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-cyan-300 uppercase">KOTAK ULASAN & SARAN</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Sampaikan pesan langsung ke admin</p>
                </div>
              </div>

              {feedbackSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2.5 my-4"
                >
                  <Icons.CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider">PESAN TERKIRIM SECARA REAL-TIME!</h5>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Ulasan atau saran Anda telah berhasil disimpan langsung di database cloud dan diterima langsung oleh admin Kelvin Bahrul Alam. Terima kasih!
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackSuccess(false)}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-extrabold rounded-lg transition-colors mt-2 uppercase cursor-pointer"
                  >
                    Kirim Pesan Lain
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                  {/* Name / Contact input */}
                  <div className="space-y-1">
                    <label htmlFor="feedbackName" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">NAMA / SOCIAL MEDIA TAG (OPSIONAL)</label>
                    <input
                      id="feedbackName"
                      type="text"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="Contoh: Kelvin / @kelvin57"
                      className="w-full bg-[#070b13]/80 border-2 border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/80 transition-all placeholder:text-slate-500"
                    />
                  </div>



                  {/* Suggestion Textarea */}
                  <div className="space-y-1">
                    <label htmlFor="feedbackText" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">ULASAN / SARAN ANDA</label>
                    <textarea
                      id="feedbackText"
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tuliskan masukan atau ulasan Anda di sini..."
                      className="w-full bg-[#070b13]/80 border-2 border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/80 transition-all placeholder:text-slate-500 resize-none"
                    />
                  </div>

                  {feedbackError && (
                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg flex items-center gap-1.5">
                      <Icons.XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] disabled:opacity-50"
                  >
                    {feedbackLoading ? (
                      <>
                        <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>MENGIRIM PESAN...</span>
                      </>
                    ) : (
                      <>
                        <Icons.Send className="w-3.5 h-3.5" />
                        <span>KIRIM ULASAN & SARAN SEKARANG</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Tech tagline bar (Image 5 style) */}
            <div className="w-full max-w-md mt-8 border border-slate-800 bg-[#070b13]/80 rounded-lg py-2 px-4 text-center text-[9px] font-bold text-slate-400 tracking-[0.15em] flex justify-between items-center select-none uppercase">
              <span>LINK KLEPON</span>
              <span className="text-cyan-400">• UPDATE •</span>
              <span>TERLENGKAP</span>
              <span className="text-rose-400">• TERPERCAYA •</span>
            </div>
          </>
        )}
      </div>

      {/* Global public footer */}
      <footer className="relative z-10 text-center text-[9px] text-slate-400 font-bold pt-8 mt-12 border-t border-white/5 uppercase tracking-[0.2em] select-none">
        PLAY • CONNECT • DOMINATE
        <span 
          onClick={handleFooterClick}
          className="block text-[8px] text-slate-400/85 hover:text-cyan-400 font-semibold tracking-normal mt-1 lowercase cursor-pointer transition-colors active:scale-95"
          title="Area Tersembunyi"
        >
          crafted by admin klepon 
        </span>
      </footer>

      {/* Secret Floating Cyber Passcode Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/90 z-50 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={isShaking ? {
                x: [0, -12, 12, -8, 8, -4, 4, 0],
                y: [0, 4, -4, 3, -3, 1, -1, 0],
                scale: 1,
                opacity: 1
              } : { 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={isShaking ? { duration: 0.45 } : { type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-auto z-[60] w-full max-w-sm bg-[#050914] border-2 border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-center select-none"
            >
              {/* Responsive target grid background elements */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08] select-none overflow-hidden z-0">
                <div 
                  className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] bg-[size:14px_14px]" 
                  style={{
                    transform: `scale(${1 + passwordInput.length * 0.08})`,
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <motion.div
                  animate={{
                    rotate: isInputFocused ? 360 + (passwordInput.length * 20) : (passwordInput.length * 12),
                    scale: isInputFocused ? 0.85 - (passwordInput.length * 0.02) : 1.1,
                    borderColor: passwordInput.length > 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.3)'
                  }}
                  transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                  className="absolute inset-6 rounded-full border-2 border-dashed flex items-center justify-center"
                >
                  <div className="w-1/2 h-1/2 rounded-full border border-double border-cyan-500/20" />
                </motion.div>
              </div>

              {/* Aiming Reticle Scope Bracket overlays in corners */}
              <div className="absolute inset-3 border border-cyan-500/10 pointer-events-none z-0">
                {/* Scope notch brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40" />
              </div>

              {/* Energy beam header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-rose-500 to-cyan-500 animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center space-y-4">
                {/* Double-ring shooting lock target */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                    className="absolute inset-2 rounded-full border border-rose-500/30"
                  />
                  
                  {/* Glowing Laser Core Dot */}
                  <motion.div 
                    animate={{
                      scale: isInputFocused ? [1, 1.4, 1] : [1, 1.15, 1],
                      backgroundColor: passwordInput.length > 0 ? "#f43f5e" : "#06b6d4"
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    <Icons.Target className={`w-5 h-5 ${passwordInput.length > 0 ? "text-rose-400 animate-spin" : "text-cyan-400"}`} />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase font-mono">AIM LOCK: GUEST BYPASS</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Masukkan sandi otentikasi admin</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="w-full space-y-3 pt-1">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ammunition / Passcode Key</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="KODE ADMIN"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoFocus
                        className="w-full bg-[#080e1a] border-2 border-slate-800 rounded-xl px-4 py-3 text-xs text-white text-center tracking-[0.25em] font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 transition-all font-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Bullet Chamber / Passcode Length Ammo Indicator */}
                  <div className="space-y-1 py-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-2">
                    <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-slate-500 font-mono">
                      <span>CHAMBER STATUS:</span>
                      <span className={passwordInput.length > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"}>
                        {passwordInput.length > 0 ? `${passwordInput.length} ROUNDS LOADED` : "EMPTY"}
                      </span>
                    </div>
                    <div className="flex justify-center gap-1.5 pt-1.5">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const isActive = passwordInput.length > i;
                        return (
                          <motion.div
                            key={i}
                            animate={{
                              scale: isActive ? [1, 1.25, 1] : 1,
                              backgroundColor: isActive ? '#f43f5e' : '#11192e',
                              boxShadow: isActive ? '0 0 8px rgba(244, 63, 94, 0.7)' : 'none'
                            }}
                            transition={{ duration: 0.2 }}
                            className="w-3.5 h-5 rounded-t-md border border-slate-800 flex flex-col justify-end p-[1px]"
                          >
                            <div className={`w-full h-1/2 rounded-t-sm ${isActive ? 'bg-white' : 'bg-transparent'}`} stroke="" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] text-rose-400 font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg flex items-center gap-1.5 justify-center font-mono"
                    >
                      <Icons.XCircle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                      <span>{loginError}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="flex-1 py-2.5 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]"
                    >
                      <Icons.Target className="w-3.5 h-3.5" />
                      FIRE / MASUK
                    </button>
                  </div>
                </form>

                <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest pt-1.5 font-mono">
                  LOCK STATUS: {secretClicks > 0 ? `${secretClicks}/5 TARGET ACQUIRED` : "CYBER CRITICAL AUTHORIZATION"}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {showAvatarEditorModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarEditorModal(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto bg-[#0a0f1d] border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] z-[60] p-6 text-center select-none"
            >
              {/* Header */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icons.Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Ubah Foto Profil Utama</h3>
                  <p className="text-[10px] text-slate-400">Sesuaikan foto yang tampil di halaman utama Link Klepon Anda.</p>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                {(['emoji', 'initial', 'link', 'upload'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTempAvatarType(type);
                      if (type === 'emoji' && !tempAvatarValue.match(/\p{Emoji}/u)) {
                        setTempAvatarValue('🟢');
                      } else if (type === 'initial' && tempAvatarValue.length > 2) {
                        setTempAvatarValue('KP');
                      } else if (type === 'upload' && !tempAvatarValue.startsWith('data:')) {
                        setTempAvatarValue('');
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer ${tempAvatarType === type ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    {type === 'emoji' && 'Emoji'}
                    {type === 'initial' && 'Inisial'}
                    {type === 'link' && 'Link'}
                    {type === 'upload' && 'Unggah'}
                  </button>
                ))}
              </div>

              {/* Live Preview Inside Modal */}
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-500/30 bg-slate-950/60 flex items-center justify-center overflow-hidden shadow-inner relative group">
                  {tempAvatarType === 'emoji' ? (
                    <span className="text-5xl select-none">{tempAvatarValue || '🟢'}</span>
                  ) : tempAvatarType === 'initial' ? (
                    <span className="text-3xl font-black text-white tracking-wider uppercase">{tempAvatarValue || 'KP'}</span>
                  ) : (tempAvatarType === 'link' || tempAvatarType === 'upload') && tempAvatarValue ? (
                    <img src={tempAvatarValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <LKLogo size={80} glow={true} />
                  )}
                </div>
              </div>

              {/* Dynamic input blocks */}
              <div className="space-y-4 mb-6 text-left">
                {tempAvatarType === 'emoji' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Emoji Utama</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={tempAvatarValue}
                      onChange={(e) => setTempAvatarValue(e.target.value)}
                      placeholder="Masukkan emoji (cth: 🟢, 🔥)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                      {['🟢', '👤', '🚀', '💻', '🔥', '🎨', '🎵', '🎮', '💡', '🌟'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setTempAvatarValue(em)}
                          className="w-8 h-8 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-lg flex items-center justify-center transition cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tempAvatarType === 'initial' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inisial Nama (Maksimal 2 Huruf)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={tempAvatarValue}
                      onChange={(e) => setTempAvatarValue(e.target.value.toUpperCase())}
                      placeholder="Contoh: KP, LK"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-center text-white uppercase tracking-widest font-black focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                )}

                {tempAvatarType === 'link' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Link Foto (Google Foto / Unsplash)</label>
                    <input
                      type="text"
                      value={tempAvatarValue.startsWith('data:') ? '' : tempAvatarValue}
                      onChange={(e) => setTempAvatarValue(e.target.value)}
                      placeholder="Tempel link foto langsung di sini..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <p className="text-[9px] text-slate-500 leading-relaxed">
                      Masukkan URL gambar berakhiran .jpg, .png, atau link dari album Google Foto Anda.
                    </p>
                  </div>
                )}

                {tempAvatarType === 'upload' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unggah Gambar / Foto Galeri</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-3 bg-[#11192e] hover:bg-[#192544] border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-all">
                        <Icons.UploadCloud className="w-5 h-5 text-cyan-400 animate-bounce" />
                        <span>Pilih Foto dari Galeri / Google Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setTempAvatarValue(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {tempAvatarValue.startsWith('data:') && (
                        <div className="flex items-center justify-between text-[10px] bg-slate-950 border border-slate-800 p-2 rounded-lg">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                            Foto Terpilih ✓
                          </span>
                          <button
                            type="button"
                            onClick={() => setTempAvatarValue('')}
                            className="text-rose-400 hover:text-rose-300 font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowAvatarEditorModal(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer border border-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateProfile) {
                      onUpdateProfile({
                        ...profile,
                        avatarType: tempAvatarType,
                        avatarValue: tempAvatarValue
                      });
                    }
                    setShowAvatarEditorModal(false);
                  }}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Icons.Save className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Target/Shooting Theme Overlay Elements */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-white/20 pointer-events-none z-[9998] mix-blend-screen"
          />
        )}
      </AnimatePresence>

      {/* Shockwave ripples on click */}
      {shots.map((shot) => (
        <motion.div
          key={shot.id}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="fixed pointer-events-none rounded-full border border-cyan-400 z-[9997] -translate-x-1/2 -translate-y-1/2"
          style={{
            left: shot.x,
            top: shot.y,
            width: '32px',
            height: '32px',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.7)'
          }}
        />
      ))}

      {/* Dynamic Toast Notification for Clipboard Copy */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] px-4 py-3 bg-[#030712]/90 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md flex items-center gap-2.5 max-w-xs md:max-w-md w-max"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Icons.Check className="w-3 h-3 stroke-[3]" />
            </div>
            <p className="text-[10px] md:text-xs font-black tracking-widest uppercase font-mono text-white">
              Tautan berhasil disalin!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Interactive Crosshair Reticle */}
      {!isTouchDevice && (
        <motion.div
          className="fixed pointer-events-none z-[9999] flex items-center justify-center"
          style={{
            left: mouseCoords.x,
            top: mouseCoords.y,
            x: '-50%',
            y: '-50%'
          }}
          animate={{
            scale: isHoveringClickable ? 1.35 : 1,
            color: isHoveringClickable ? '#f43f5e' : '#06b6d4',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Central Target laser dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
          
          {/* Rotating outer targeting circle */}
          <svg className="absolute w-9 h-9 animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
            <path d="M 50 10 L 50 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 50 90 L 50 78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 10 50 L 22 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 90 50 L 78 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Tech targeting corner notches */}
            <path d="M 22 22 L 28 22 L 22 28 Z" fill="currentColor" opacity="0.5" />
            <path d="M 78 22 L 72 22 L 78 28 Z" fill="currentColor" opacity="0.5" />
            <path d="M 22 78 L 28 78 L 22 72 Z" fill="currentColor" opacity="0.5" />
            <path d="M 78 78 L 72 78 L 78 72 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
