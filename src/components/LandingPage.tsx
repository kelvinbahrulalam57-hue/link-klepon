/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProfileData, ThemeConfig, LinkItem } from '../types.ts';
import * as Icons from 'lucide-react';
import LKLogo from './LKLogo.tsx';
import EntranceAnimation from './EntranceAnimation.tsx';

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
    if (isStealthTriggered && stealthElementsToHide.includes('links')) {
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  // Handle gunshot simulation (Ripple, Flash, and Web Audio API Synthesis)
  const playLaserGunshotSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Sweep laser frequency oscillator
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1000, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
      
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);
      
      // Heavy metal impact sub-oscillator
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(150, ctx.currentTime);
      osc2.frequency.setValueAtTime(60, ctx.currentTime + 0.08);
      
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.start();
      osc2.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext is blocked or unsupported:", e);
    }
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
        <div className="mb-6 text-center font-mono text-[11px] md:text-xs tracking-[0.25em] font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] uppercase flex items-center justify-center gap-2 select-none bg-slate-950/50 px-4 py-2 rounded-xl border border-cyan-500/15 backdrop-blur-sm shadow-md">
          <span className="text-rose-500 animate-pulse">🎯</span>
          <TypewriterText text="WELCOME TO WEBSITE KLEPON" delay={70} />
        </div>

        {/* Dynamic Theme Banner (Cyber LK design overlay) */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Logo container with rotation */}
          {!(isStealthTriggered && stealthElementsToHide.includes('avatar')) && (
            <button
              onClick={() => {
                setTempAvatarType(profile.avatarType || 'emoji');
                setTempAvatarValue(profile.avatarValue || '');
                setShowAvatarEditorModal(true);
              }}
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
                    alt={profile.name} 
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
          {profile.location && !(isStealthTriggered && stealthElementsToHide.includes('bio_location')) && (
            <div className="mt-1 flex items-center justify-center gap-1 text-slate-300 text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <Icons.MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio text block */}
          {profile.bio && !(isStealthTriggered && stealthElementsToHide.includes('bio_location')) && (
            <p className="mt-4 text-xs md:text-sm text-slate-200 bg-slate-950/45 px-4 py-3 rounded-xl border border-white/5 backdrop-blur-sm max-w-md mx-auto leading-relaxed drop-shadow-sm">
              {profile.bio}
            </p>
          )}

          {/* Social Icons Quick Integration (Responsive Mobile-ready) */}
          {profile.socials && profile.socials.length > 0 && !(isStealthTriggered && stealthElementsToHide.includes('socials')) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {profile.socials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 bg-slate-950/70 hover:bg-slate-900 rounded-full border border-slate-800 text-slate-300 transition-all duration-300 flex items-center justify-center shadow-md ${getPlatformHoverColor(soc.platform)}`}
                >
                  {renderSocialIcon(soc)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* List of custom compiled active links */}
        <div className="w-full space-y-4 max-w-md">
          {filteredLinks.map((link) => (
            <motion.a
              key={link.id}
              whileHover={{ 
                scale: 1.03, 
                x: 4,
                boxShadow: "0px 0px 20px rgba(6, 182, 212, 0.45)",
                borderColor: "rgba(6, 182, 212, 0.9)",
              }}
              whileTap={{ scale: 0.98 }}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                triggerShot(e.clientX, e.clientY);
                onLinkClick(link.id);
              }}
              className={`w-full py-4 px-5 flex items-center justify-between gap-3 text-sm md:text-base cursor-pointer transition-all duration-200 ${getButtonStyleClass()} ${getLinkAnimationClass(link.animation)}`}
            >
              <span className="shrink-0">
                {link.imageType === 'upload' && link.imageValue ? (
                  <img 
                    src={link.imageValue} 
                    alt="" 
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
              <span className="font-bold text-center flex-1 truncate">{link.title}</span>
              <span className="w-5 h-5 shrink-0 opacity-40">
                <Icons.ChevronRight className="w-5 h-5" />
              </span>
            </motion.a>
          ))}

          {filteredLinks.length === 0 && (
            <div className="text-center py-16 text-slate-500 italic text-sm">
              Belum ada tautan yang dikonfigurasikan atau ditampilkan.
            </div>
          )}
        </div>

        {/* Feature widgets (Image 5 style bento blocks) */}
        {!(isStealthTriggered && stealthElementsToHide.includes('widgets')) && (
          <>
            <div className="w-full max-w-md mt-12 grid grid-cols-2 gap-3">
              <div className="bg-slate-950/65 border border-cyan-500/10 p-3.5 rounded-xl backdrop-blur-sm text-center">
                <Icons.BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                <h5 className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">ARTIKEL GAME</h5>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">Info, tips, dan update baru seputar Klepon.</p>
              </div>
              <div className="bg-slate-950/65 border border-rose-500/10 p-3.5 rounded-xl backdrop-blur-sm text-center">
                <Icons.CalendarDays className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                <h5 className="text-[10px] font-black text-rose-300 uppercase tracking-widest">EVENT JADWAL</h5>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">Jadwal event menarik dan kesempatan emas.</p>
              </div>
            </div>

            {/* Trust features (Image 5 style full width indicators) */}
            <div className="w-full max-w-md mt-3 grid grid-cols-2 gap-3">
              <div className="bg-slate-950/65 border border-amber-500/10 p-3.5 rounded-xl backdrop-blur-sm text-center">
                <Icons.Info className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <h5 className="text-[10px] font-black text-amber-300 uppercase tracking-widest">INFO TERLENGKAP</h5>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">Semua info Klepon ada di sini.</p>
              </div>
              <div className="bg-slate-950/65 border border-emerald-500/10 p-3.5 rounded-xl backdrop-blur-sm text-center">
                <Icons.ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                <h5 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">TERPERCAYA</h5>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">Resmi, akurat, dan dapat diandalkan.</p>
              </div>
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
      <footer className="relative z-10 text-center text-[9px] text-slate-500 font-bold pt-8 mt-12 border-t border-white/5 uppercase tracking-[0.2em] select-none">
        PLAY • CONNECT • DOMINATE
        <span 
          onClick={handleFooterClick}
          className="block text-[8px] text-slate-600 hover:text-cyan-500/50 font-semibold tracking-normal mt-1 lowercase cursor-pointer transition-colors active:scale-95"
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

      {/* Floating QR Code/Barcode Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowQRModal(true);
          }}
          className="w-12 h-12 rounded-full bg-slate-950/90 hover:bg-slate-900 border-2 border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] backdrop-blur-md cursor-pointer transition-all duration-300 flex items-center justify-center group active:scale-95"
          title="Tampilkan QR Code & Barcode Website"
        >
          <Icons.QrCode className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* QR Code & Barcode Modal */}
      <AnimatePresence>
        {showQRModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/90 z-50 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowQRModal(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-auto z-[60] w-full max-w-sm bg-[#050914] border-2 border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner brackets */}
              <div className="absolute inset-3 border border-cyan-500/10 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40" />
              </div>

              {/* Energy beam header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 animate-pulse" />

              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase font-mono">WEBSITE QR & BARCODE</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Bagikan & Pindai Tautan Resmi</p>
                </div>

                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/20 inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=090d16&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(window.location.href)}`}
                    alt="Link Klepon QR Code"
                    className="w-36 h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full border-t border-dashed border-slate-800 my-1 relative">
                  <div className="absolute -left-[31px] -top-[8px] w-4 h-4 bg-[#050914] border-r border-cyan-500/20 rounded-full" />
                  <div className="absolute -right-[31px] -top-[8px] w-4 h-4 bg-[#050914] border-l border-cyan-500/20 rounded-full" />
                </div>

                {/* Barcode */}
                <div className="bg-white p-2.5 rounded-lg w-full max-w-[240px] flex items-center justify-center">
                  <img
                    src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(window.location.href)}&scale=2&rotate=N&includetext`}
                    alt="Link Klepon Barcode"
                    className="h-12 max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed font-semibold">
                  Tunjukkan kode di atas kepada teman atau kamera ponsel untuk mengakses <span className="text-cyan-400 font-bold">Link Klepon</span> secara instan.
                </p>

                {/* Buttons */}
                <div className="flex gap-2 w-full pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="flex-1 py-2 bg-[#121c33] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    {copiedUrl ? <Icons.Check className="w-3.5 h-3.5 text-emerald-400" /> : <Icons.Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedUrl ? "Disalin!" : "Salin Link"}</span>
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
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
