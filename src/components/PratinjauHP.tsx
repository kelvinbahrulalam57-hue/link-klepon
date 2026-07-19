/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProfileData, ThemeConfig, LinkItem } from '../types.ts';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import LKLogo from './LKLogo.tsx';

interface PratinjauHPProps {
  profile: ProfileData;
  theme: ThemeConfig;
  links: LinkItem[];
  onLinkClick: (linkId: string) => void;
  isStealthModeActive?: boolean;
  stealthAllowedLocation?: string;
  stealthElementsToHide?: string[];
  simulatedLocation?: string;
}

export default function PratinjauHP({ 
  profile, 
  theme, 
  links, 
  onLinkClick,
  isStealthModeActive = false,
  stealthAllowedLocation = 'Indonesia',
  stealthElementsToHide = [],
  simulatedLocation = 'Indonesia'
}: PratinjauHPProps) {

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

  // Helper to render lucide icon on links
  const renderLinkIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return <IconComp className="w-4 h-4" />;
    }
    return <Icons.Globe className="w-4 h-4" />;
  };

  // Helper to render custom or preset social icons in mobile view
  const renderSocialIcon = (soc: any) => {
    if (soc.iconType === 'upload' && soc.iconValue) {
      return (
        <img 
          src={soc.iconValue} 
          alt={soc.platform} 
          className="w-3 h-3 rounded-full object-cover" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    switch (soc.platform) {
      case 'instagram':
        return <Icons.Instagram className="w-3 h-3" />;
      case 'tiktok':
        return <Icons.Video className="w-3 h-3" />;
      case 'twitter':
        return <Icons.Twitter className="w-3 h-3" />;
      case 'linkedin':
        return <Icons.Linkedin className="w-3 h-3" />;
      default:
        return <Icons.Globe className="w-3 h-3" />;
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

  // Helper for background styling
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
      if (theme.blur > 0) {
        styles.filter = `blur(${theme.blur}px)`;
      }
    }
    return styles;
  };

  // Helper for pattern overlay
  const renderPatternOverlay = () => {
    if (theme.pattern === 'Polka Dots') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#334155 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px'
          }}
        />
      );
    }
    if (theme.pattern === 'Tech Grid') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />
      );
    }
    if (theme.pattern === 'Waves') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #475569, #475569 10px, transparent 10px, transparent 20px)'
          }}
        />
      );
    }
    if (theme.pattern === 'Hexagon Hive') {
      return (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, #0284c7 10%, transparent 11%)`,
            backgroundSize: '12px 12px'
          }}
        />
      );
    }
    return null;
  };

  // Helper for button style class names
  const getButtonStyleClass = () => {
    if (theme.buttonStyle === 'Outline Style • Dots') {
      return 'border-2 border-current hover:bg-white/10 text-white font-medium rounded-lg shadow-sm';
    }
    if (theme.buttonStyle === 'Shadow-3D Style • Grid') {
      return 'border-2 border-slate-900 bg-white text-slate-900 font-bold rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all';
    }
    if (theme.buttonStyle === 'Cyber Glow (Neon Border)') {
      return 'border border-cyan-400 bg-cyan-950/40 text-cyan-200 hover:text-white font-semibold rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_18px_rgba(34,211,238,0.4)] transition-all';
    }
    if (theme.buttonStyle === 'Pill Style • Waves') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full shadow';
    }
    if (theme.buttonStyle === 'Glassmorphism Style • Frosted') {
      return 'backdrop-blur-md bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium rounded-xl shadow-lg';
    }
    return 'bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg shadow'; // Flat block
  };

  // Helper for link custom animation
  const getLinkAnimationClass = (animation: string) => {
    if (animation === 'pulse') return 'animate-pulse ring-1 ring-cyan-400/50';
    if (animation === 'bounce') return 'animate-bounce';
    if (animation === 'shake') return 'hover:animate-bounce'; // or tilt effect
    if (animation === 'neon') return 'shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse';
    return '';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Smartphone Mockup Container Frame */}
      <div className="w-[280px] h-[580px] bg-[#0c0f17] border-[10px] border-[#1e2230] rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Notch / Speaker & Camera */}
        <div className="absolute top-0 inset-x-0 h-4 bg-[#1e2230] rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-[#090b10] rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#090b10] rounded-full ml-2" />
        </div>

        {/* Top Status Bar (Time, Signals) */}
        <div className="pt-5 px-4 pb-1 text-[9px] font-mono font-bold text-slate-400 flex justify-between items-center z-10 shrink-0 select-none">
          <span>17.15</span>
          <div className="flex items-center gap-1">
            <Icons.Wifi className="w-2.5 h-2.5" />
            <span className="text-[8px] bg-slate-800 px-1 py-0.2 rounded text-emerald-400 font-semibold border border-emerald-500/20">LTE</span>
            <Icons.BatteryCharging className="w-3 h-3 text-emerald-400" />
            <span>77%</span>
          </div>
        </div>

        {/* Dynamic Canvas Container (Scrollable) */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col justify-between" style={{ fontFamily: theme.font }}>
          
          {/* Main Background with Blur if Image */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ ...getBackgroundStyle(), filter: undefined }} />
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

          {/* Actual Content Layout inside device */}
          <div className="relative z-10 space-y-4 text-center mt-3 flex-1 flex flex-col">
            {/* Profile Avatar Frame */}
            {!(isStealthTriggered && stealthElementsToHide?.includes('avatar')) && (
              <div className="flex justify-center mt-2">
                <div className="w-16 h-16 rounded-full border-2 border-white/40 shadow-md flex items-center justify-center overflow-hidden bg-slate-900/60 backdrop-blur-sm">
                  {profile.avatarType === 'emoji' && (
                    <span className="text-3xl select-none">{profile.avatarValue || '🟢'}</span>
                  )}
                  {profile.avatarType === 'initial' && (
                    <span className="text-xl font-bold text-white tracking-wider">{profile.avatarValue || 'KP'}</span>
                  )}
                  {(profile.avatarType === 'link' || profile.avatarType === 'upload') && profile.avatarValue ? (
                    <img src={profile.avatarValue} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (profile.avatarType === 'link' || profile.avatarType === 'upload') ? (
                    <span className="text-2xl">👤</span>
                  ) : (
                    <div className="scale-75 translate-y-[2px]">
                      <LKLogo size={55} glow={true} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Name & Meta */}
            <div>
              <h4 className="text-sm font-extrabold text-white tracking-wide flex items-center justify-center gap-1 drop-shadow-sm">
                {profile.name || "LINK KLEPON"}
                <span className="text-[8px] bg-cyan-500 text-slate-950 font-black px-1 rounded">PRO</span>
              </h4>
              
              {profile.location && !(isStealthTriggered && stealthElementsToHide?.includes('bio_location')) && (
                <div className="text-[8px] text-slate-300 font-medium flex items-center justify-center gap-0.5 mt-0.5 drop-shadow-sm">
                  <Icons.MapPin className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Profile Description */}
            {profile.bio && !(isStealthTriggered && stealthElementsToHide?.includes('bio_location')) && (
              <p className="text-[10px] text-slate-300 px-2 line-clamp-3 leading-relaxed drop-shadow-sm bg-slate-950/25 p-1.5 rounded-lg backdrop-blur-[1px]">
                {profile.bio}
              </p>
            )}

            {/* Social Icons inside Live Mobile Mockup */}
            {profile.socials && profile.socials.length > 0 && !(isStealthTriggered && stealthElementsToHide?.includes('socials')) && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
                {profile.socials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 bg-slate-950/70 hover:bg-slate-900 rounded-full border border-slate-800 text-slate-300 transition-all duration-300 flex items-center justify-center shadow-md ${getPlatformHoverColor(soc.platform)}`}
                  >
                    {renderSocialIcon(soc)}
                  </a>
                ))}
              </div>
            )}

            {/* Dynamic Buttons List */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="space-y-2 pt-2 flex-1"
            >
              {filteredLinks.map((link) => (
                <motion.a
                  key={link.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
                  }}
                  whileHover={{ 
                    scale: 1.04, 
                    x: 3,
                    boxShadow: "0px 0px 14px rgba(6, 182, 212, 0.4)",
                    borderColor: "rgba(6, 182, 212, 0.8)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  layout
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick(link.id)}
                  className={`w-full py-2.5 px-3 flex items-center justify-between gap-2 text-xs transition-all duration-200 cursor-pointer ${getButtonStyleClass()} ${getLinkAnimationClass(link.animation)}`}
                >
                  <span className="shrink-0">
                    {link.imageType === 'upload' && link.imageValue ? (
                      <img 
                        src={link.imageValue} 
                        alt="" 
                        className="w-4 h-4 rounded-md object-cover border border-white/20" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      renderLinkIcon(link.icon)
                    )}
                  </span>
                  <span className="font-semibold text-center flex-1 truncate">{link.title}</span>
                  <span className="w-4 h-4 shrink-0 opacity-40">
                    <Icons.ChevronRight className="w-4 h-4" />
                  </span>
                </motion.a>
              ))}

              {filteredLinks.length === 0 && (
                <p className="text-[9px] text-slate-500 italic py-10">Tautan Kosong atau Dinonaktifkan</p>
              )}
            </motion.div>
          </div>

          {/* Footer inside mobile device */}
          <div className="relative z-10 text-center text-[7px] text-slate-500 font-bold select-none pt-2 mt-auto border-t border-white/5 uppercase tracking-widest">
            Crafted by Pami & Klepon
          </div>
        </div>

        {/* Home swipe indicator line */}
        <div className="h-4 bg-[#1e2230] flex items-center justify-center shrink-0">
          <div className="w-20 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
