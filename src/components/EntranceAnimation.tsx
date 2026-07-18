/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import LKLogo from './LKLogo.tsx';

interface EntranceAnimationProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  key?: React.Key;
  profile?: {
    avatarType: string;
    avatarValue: string;
    useAvatarInEntrance?: boolean;
    name?: string;
  };
}

// Procedural Audio Engine using native Web Audio API (No files required!)
const playSynthBeep = (frequency: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', duration = 0.15, volume = 0.08) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Fails silently if blocked by browser
  }
};

const playLaunchExplosion = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // 1. Deep Bass Drop (Sub)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 1.8);
    
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(now + 1.8);
    
    // 2. High Cyber Sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(180, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(950, now + 0.9);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.9);
    
    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    
    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    
    sweepOsc.start();
    sweepOsc.stop(now + 0.9);
    
    // 3. Futuristic Chord
    const chordFreqs = [220, 293, 330, 440, 587, 660, 880];
    chordFreqs.forEach((freq, index) => {
      const chordOsc = ctx.createOscillator();
      const chordGain = ctx.createGain();
      chordOsc.type = 'triangle';
      chordOsc.frequency.setValueAtTime(freq, now + (index * 0.02));
      
      chordGain.gain.setValueAtTime(0.05, now);
      chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      
      chordOsc.connect(chordGain);
      chordGain.connect(ctx.destination);
      chordOsc.start();
      chordOsc.stop(now + 1.5);
    });
  } catch (e) {
    // Fails silently
  }
};

export default function EntranceAnimation({
  onComplete,
  title = "WELCOME TO WEBSITE KLEPON",
  subtitle = "PLAY • CONNECT • DOMINATE",
  profile
}: EntranceAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  
  // Real-time mouse coordinates for interactive HUD
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Soundwave visualizer simulation (12 random heights)
  const [eqHeights, setEqHeights] = useState<number[]>([40, 60, 20, 70, 50, 90, 30, 80, 45, 65, 35, 55]);

  // Handle Mouse Coordinate Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Relative values in percentage
      const rx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const ry = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setMousePos({ x: rx, y: ry, clientX: e.clientX, clientY: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update mock soundwave equalizer frequencies
  useEffect(() => {
    if (isLaunching) return;
    const interval = setInterval(() => {
      setEqHeights(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
    }, 100);
    return () => clearInterval(interval);
  }, [isLaunching]);

  // Typewriter Effect for Title
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < title.length) {
        setTypedTitle(title.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [title]);

  // Progress Boot Loader sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoadingFinished(true);
          // Play a locked-on sound chime
          playSynthBeep(587.33, 'triangle', 0.25, 0.15);
          setTimeout(() => {
            playSynthBeep(880.00, 'sine', 0.35, 0.1);
          }, 120);
          return 100;
        }

        // Cyber jumpy loads
        const increment = Math.floor(Math.random() * 12) + 4;
        const nextVal = Math.min(prev + increment, 100);
        
        // Procedural tick-tock audio cue for immersion
        if (nextVal % 2 === 0) {
          playSynthBeep(330 + (nextVal * 2), 'sine', 0.05, 0.03);
        }

        return nextVal;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-launch once loading is finished (no manual click needed!)
  useEffect(() => {
    if (loadingFinished && !isLaunching) {
      const timer = setTimeout(() => {
        handleLaunch();
      }, 500); // 500ms delay to let the user see the 100% completion before entry
      return () => clearTimeout(timer);
    }
  }, [loadingFinished, isLaunching]);

  // Launch Portal Trigger (Explosive sequence!)
  const handleLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);

    // Play procedural sound FX
    playLaunchExplosion();

    // Stagger transition slightly to allow screen shake & white flash to culminate
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.15, filter: "blur(20px)" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02040a] text-white overflow-hidden select-none"
    >
      {/* 1. CYBER perspective grid travel background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          perspective: '500px',
          transform: 'rotateX(60deg) translateY(-20%) scale(1.8)',
          transformOrigin: 'top center',
          animation: 'grid-scroll 18s linear infinite'
        }}
      />
      <style>{`
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 400px; }
        }
      `}</style>

      {/* Real-time neon scanning laser sweeping down */}
      <div className="absolute inset-x-0 h-[2px] bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan-line_4s_ease-in-out_infinite] pointer-events-none z-10" />
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Cyber ambient color elements */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* 2. DYNAMIC HUD GLASS COCKPIT CONTROLLER */}
      <motion.div
        className="relative flex flex-col items-center max-w-xl px-6 text-center z-20 w-full"
      >
        {/* Holographic Header Info Rails */}
        <div className="w-full flex items-center justify-between text-[8px] font-mono tracking-[0.2em] text-cyan-400/60 border-b border-cyan-500/10 pb-2 mb-10 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>LK-CORE-ACTIVE v4.0</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>TEMP: 34°C [STABLE]</span>
            <span>FPS: 60 // ping: 12ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.Layers className="w-3.5 h-3.5" />
            <span>SECURE LINK ENVIRONMENT</span>
          </div>
        </div>

        {/* 3. CORE RETICLE OR AVATAR DOCK */}
        <div className="relative mb-10 flex items-center justify-center w-64 h-64 select-none">
          {/* Rotating Ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/25 scale-100"
          />

          {/* Rotating Ring 2 (Anti-clockwise) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute inset-4 rounded-full border border-rose-500/20"
          />

          {/* Rotating Ring 3 with neon brackets */}
          <motion.div
            animate={{ rotate: 180 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute inset-8 rounded-full border border-cyan-400/10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
          </motion.div>

          {/* 4 Corners Aim-Lock Bracket Frame */}
          <div className="absolute inset-10 pointer-events-none">
            {/* Top Left */}
            <motion.div 
              animate={loadingFinished ? { x: [0, 4, 0], y: [0, 4, 0], borderColor: "#f43f5e" } : { borderColor: "#06b6d4" }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" 
            />
            {/* Top Right */}
            <motion.div 
              animate={loadingFinished ? { x: [0, -4, 0], y: [0, 4, 0], borderColor: "#f43f5e" } : { borderColor: "#06b6d4" }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" 
            />
            {/* Bottom Left */}
            <motion.div 
              animate={loadingFinished ? { x: [0, 4, 0], y: [0, -4, 0], borderColor: "#f43f5e" } : { borderColor: "#06b6d4" }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" 
            />
            {/* Bottom Right */}
            <motion.div 
              animate={loadingFinished ? { x: [0, -4, 0], y: [0, -4, 0], borderColor: "#f43f5e" } : { borderColor: "#06b6d4" }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" 
            />
          </div>

          {/* Inside Crosshair Dot */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {profile?.useAvatarInEntrance && profile?.avatarValue ? (
              <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-rose-500 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#050914] overflow-hidden border border-black/35 flex items-center justify-center">
                  {profile.avatarType === 'emoji' ? (
                    <span className="text-6xl drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">{profile.avatarValue}</span>
                  ) : profile.avatarType === 'initial' ? (
                    <span className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-400">{profile.avatarValue}</span>
                  ) : (
                    <img src={profile.avatarValue} alt="Identity" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                animate={loadingFinished ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <LKLogo size={145} glow={true} />
              </motion.div>
            )}
          </div>

          {/* Interactive cursor pointer lock sight display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="text-[7px] font-mono tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 py-0.5 px-2 rounded-full absolute bottom-4 shadow-md uppercase">
              {loadingFinished ? "LOCK STABLE ✓" : `TARGETING ENGINE: ${progress}%`}
            </div>
          </div>
        </div>

        {/* 4. CHROME GLITCH GREETING TITLE */}
        <div className="h-16 mb-1 flex items-center justify-center w-full">
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-rose-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.45)] uppercase font-mono relative">
            {typedTitle}
            <span className="w-3 h-7 bg-cyan-400 inline-block align-middle ml-1 animate-pulse" />
          </h1>
        </div>

        {/* Subtitle tag */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[10px] md:text-xs tracking-[0.5em] text-cyan-300 font-extrabold uppercase mb-10"
        >
          {subtitle}
        </motion.p>

        {/* 5. LIVE LOADING PROGRESS BAR */}
        <div className="w-full max-w-sm bg-[#060a14]/90 border border-cyan-500/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

          <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-cyan-400 mb-2 font-bold uppercase">
            <span className="flex items-center gap-1.5">
              {progress < 100 ? (
                <>
                  <Icons.Workflow className="w-3 h-3 animate-spin text-cyan-400" />
                  INITIATING NEXUS INTERFACE
                </>
              ) : (
                <>
                  <Icons.Check className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-black">ACCESS GRANTED ✓</span>
                </>
              )}
            </span>
            <span className={progress === 100 ? "text-emerald-400 font-bold" : "text-cyan-400"}>{progress}%</span>
          </div>

          {/* Progress bar container */}
          <div className="h-3 w-full bg-[#0a1122] rounded-full overflow-hidden p-[2px] border border-cyan-500/20">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${progress === 100 ? 'from-emerald-400 to-cyan-400' : 'from-cyan-400 via-indigo-500 to-rose-500'} shadow-[0_0_12px_rgba(6,182,212,0.7)]`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Console log outputs */}
          <div className="mt-4 border-t border-slate-900 pt-3 text-left font-mono text-[8px] text-slate-400 space-y-1 h-9 overflow-hidden">
            <div className="text-cyan-400 truncate flex items-center gap-1.5 uppercase font-bold font-mono">
              <span className="text-cyan-500">&gt;&gt;</span>
              {progress < 30 && "CALIBRATING SENSORS... LOAD_SYS [OK]"}
              {progress >= 30 && progress < 60 && "ESTABLISHING REAL-TIME FIRESTORE GATEWAY..."}
              {progress >= 60 && progress < 85 && "OVERCLOCKING UI ANIMATION PIPELINES..."}
              {progress >= 85 && progress < 100 && "READY! PREPARING SONIC QUANTUM LAUNCHER..."}
              {progress === 100 && <span className="text-emerald-400 font-extrabold animate-pulse">SUCCESS! PORTAL OPENING IN 500MS...</span>}
            </div>
            <div className="text-slate-500 truncate text-[7px] uppercase tracking-wider">
              HUD RECT: [X: {mousePos.x}%, Y: {mousePos.y}%] // AUDIO: ACTIVE // GRID: SEEDING
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. IMMERSIVE TARGET SIGHTS FOLLOWING USER CURSOR (Desktop only helper) */}
      <div 
        className="hidden md:block fixed pointer-events-none z-40 transition-transform duration-75"
        style={{
          left: mousePos.clientX,
          top: mousePos.clientY,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Cursor crosshair circle */}
        <div className="w-10 h-10 rounded-full border border-cyan-400/40 relative flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(6,182,212,1)]" />
          {/* Laser cross lines */}
          <div className="absolute top-0 h-2 w-[1px] bg-cyan-400" />
          <div className="absolute bottom-0 h-2 w-[1px] bg-cyan-400" />
          <div className="absolute left-0 w-2 h-[1px] bg-cyan-400" />
          <div className="absolute right-0 w-2 h-[1px] bg-cyan-400" />
        </div>
        {/* Tiny live position floating coordinates */}
        <div className="text-[7px] font-mono text-cyan-400/80 bg-[#02040a]/90 px-1 rounded border border-cyan-500/20 absolute top-7 left-5 whitespace-nowrap uppercase">
          X:{mousePos.x} Y:{mousePos.y}
        </div>
      </div>

      {/* 7. LAUNCH BURST FULL SCREEN FLASHER & EXTREME SHOCKWAVE */}
      <AnimatePresence>
        {isLaunching && (
          <>
            {/* Blinding whiteout screen flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.15, 0.7, 1] }}
              className="fixed inset-0 bg-white z-[70] mix-blend-overlay pointer-events-none"
            />
            
            {/* Cyber shockwave expanding circle ring */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="fixed inset-auto w-48 h-48 rounded-full border-4 border-cyan-400 z-[80] pointer-events-none shadow-[0_0_50px_rgba(6,182,212,0.8)]"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
