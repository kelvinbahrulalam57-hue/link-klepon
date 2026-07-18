/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function EntranceAnimation({
  onComplete,
  title = "WELCOME TO WEBSITE KLEPON",
  subtitle = "PLAY • CONNECT • DOMINATE",
  profile
}: EntranceAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [targetLocked, setTargetLocked] = useState(false);
  const [laserPulse, setLaserPulse] = useState(true);

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
    }, 70); // realistic typing delay
    return () => clearInterval(interval);
  }, [title]);

  // Loading Progress with Realistic Jumps
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTargetLocked(true);
          setTimeout(() => {
            onComplete();
          }, 1200); // extra delay to admire locked state
          return 100;
        }
        // Cyberpunk style boot loading
        const increment = Math.floor(Math.random() * 10) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Laser pulsing sequence
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setLaserPulse(prev => !prev);
    }, 400);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(15px)" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] text-white overflow-hidden select-none"
    >
      {/* High-Tech Grid Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to right, rgba(6, 182, 212, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px, 30px 30px, 30px 30px',
          backgroundPosition: 'center'
        }}
      />

      {/* Futuristic Scope Overlay on viewport */}
      <div className="absolute inset-0 border border-cyan-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/5 pointer-events-none" />
      <div className="absolute left-1/2 top-0 w-[1px] h-full bg-cyan-500/5 pointer-events-none" />

      {/* Cyber ambient glow bubbles */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center max-w-lg px-6 text-center z-10">
        
        {/* WEAPON SYSTEM / TARGETING LASER RETICLE */}
        <div className="relative mb-12 flex items-center justify-center w-64 h-64">
          
          {/* External Reticle Scope Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20 scale-100"
          />

          {/* Internal Locking Rings */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute inset-4 rounded-full border-2 border-double border-rose-500/15"
          />
          
          {/* Aim Tracking Bracket 4 Corners */}
          <div className="absolute inset-8 pointer-events-none">
            {/* Top Left */}
            <motion.div 
              animate={{ 
                x: targetLocked ? [0, 8, 0] : [-15, 0], 
                y: targetLocked ? [0, 8, 0] : [-15, 0],
                borderColor: targetLocked ? "#ef4444" : "#06b6d4"
              }}
              transition={{ duration: 1, repeat: targetLocked ? Infinity : 0 }}
              className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" 
            />
            {/* Top Right */}
            <motion.div 
              animate={{ 
                x: targetLocked ? [0, -8, 0] : [15, 0], 
                y: targetLocked ? [0, 8, 0] : [-15, 0],
                borderColor: targetLocked ? "#ef4444" : "#06b6d4"
              }}
              transition={{ duration: 1, repeat: targetLocked ? Infinity : 0 }}
              className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" 
            />
            {/* Bottom Left */}
            <motion.div 
              animate={{ 
                x: targetLocked ? [0, 8, 0] : [-15, 0], 
                y: targetLocked ? [0, -8, 0] : [15, 0],
                borderColor: targetLocked ? "#ef4444" : "#06b6d4"
              }}
              transition={{ duration: 1, repeat: targetLocked ? Infinity : 0 }}
              className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" 
            />
            {/* Bottom Right */}
            <motion.div 
              animate={{ 
                x: targetLocked ? [0, -8, 0] : [15, 0], 
                y: targetLocked ? [0, -8, 0] : [15, 0],
                borderColor: targetLocked ? "#ef4444" : "#06b6d4"
              }}
              transition={{ duration: 1, repeat: targetLocked ? Infinity : 0 }}
              className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" 
            />
          </div>

          {/* ACTIVE LASER BEAMS SHOOTING & CONVERGING FROM CORNERS TO CENTER */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Laser 1: Top-Left to Center */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: targetLocked ? "100%" : ["0%", "50%"],
                opacity: laserPulse ? 0.8 : 0.3,
                borderColor: targetLocked ? "#f43f5e" : "#22d3ee"
              }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-0 h-[1px] border-b transform rotate-45 origin-top-left"
              style={{ width: "141%" }} // sqrt(2) * 100
            />
            {/* Laser 2: Top-Right to Center */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: targetLocked ? "100%" : ["0%", "50%"],
                opacity: laserPulse ? 0.8 : 0.3,
                borderColor: targetLocked ? "#f43f5e" : "#22d3ee"
              }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 right-0 h-[1px] border-b transform -rotate-45 origin-top-right"
              style={{ width: "141%" }}
            />
            {/* Laser 3: Bottom-Left to Center */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: targetLocked ? "100%" : ["0%", "50%"],
                opacity: laserPulse ? 0.8 : 0.3,
                borderColor: targetLocked ? "#f43f5e" : "#22d3ee"
              }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 left-0 h-[1px] border-b transform -rotate-45 origin-bottom-left"
              style={{ width: "141%" }}
            />
            {/* Laser 4: Bottom-Right to Center */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: targetLocked ? "100%" : ["0%", "50%"],
                opacity: laserPulse ? 0.8 : 0.3,
                borderColor: targetLocked ? "#f43f5e" : "#22d3ee"
              }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 right-0 h-[1px] border-b transform rotate-45 origin-bottom-right"
              style={{ width: "141%" }}
            />
          </div>

          {/* Interactive target laser dot */}
          <motion.div 
            animate={{ 
              scale: targetLocked ? [1, 2.5, 1] : [1, 1.4, 1],
              backgroundColor: targetLocked ? "#ef4444" : "#22d3ee"
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute w-3 h-3 rounded-full bg-cyan-400 z-30 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          />

          {/* Locked status banner */}
          <div className="absolute top-2 w-full text-center z-30">
            <span className={`text-[8px] font-black tracking-[0.3em] font-mono px-2 py-0.5 rounded border uppercase transition-colors ${targetLocked ? "bg-red-500/20 border-red-500 text-red-400" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse"}`}>
              {targetLocked ? "LOCK ACQUIRED / TARGET HIT" : `LOCKING TARGET: ${progress}%`}
            </span>
          </div>

          {/* Logo Frame - targeted in the middle */}
          <div className="z-10 flex items-center justify-center">
            {profile?.useAvatarInEntrance && profile?.avatarValue ? (
              <div className="relative flex items-center justify-center w-36 h-36">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 p-1 shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-[pulse_2s_infinite]">
                  <div className="w-full h-full rounded-full overflow-hidden border border-rose-500/30 bg-[#090f1d]">
                    {profile.avatarType === 'emoji' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl select-none">{profile.avatarValue}</span>
                      </div>
                    ) : profile.avatarType === 'initial' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-black tracking-wider text-cyan-400 font-mono">{profile.avatarValue}</span>
                      </div>
                    ) : (
                      <img 
                        src={profile.avatarValue} 
                        alt="Profile Identity" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                animate={targetLocked ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.6 }}
                className="scale-105"
              >
                <LKLogo size={140} glow={true} />
              </motion.div>
            )}
          </div>

          {/* Red pulse on target locked */}
          <AnimatePresence>
            {targetLocked && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-full border border-red-500 z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* HACKER TYPING GREETING */}
        <div className="h-14 mb-2 flex items-center justify-center">
          <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-rose-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] uppercase font-mono flex items-center">
            {typedTitle}
            <span className="w-2.5 h-6 ml-1 bg-cyan-400 animate-pulse inline-block" style={{ animationDuration: '0.8s' }}>_</span>
          </h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[9px] md:text-xs tracking-[0.55em] text-cyan-300 uppercase font-black mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Loading Terminal Mockup */}
        <div className="w-80 bg-[#070b15]/95 border border-cyan-500/10 backdrop-blur-md rounded-2xl p-4 shadow-[0_0_35px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle neon progress corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/50" />

          <div className="flex justify-between items-center mb-2 px-1 text-[9px] font-mono tracking-widest text-cyan-400/80">
            <span className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${targetLocked ? 'bg-red-500 animate-ping' : 'bg-cyan-500 animate-ping'}`} />
              {targetLocked ? "TARGET ACQUIRED" : "AIM LOCKING ENGINE"}
            </span>
            <span className="font-extrabold text-cyan-400">{progress}%</span>
          </div>

          {/* Loading bar */}
          <div className="h-2 w-full bg-[#11192e] rounded-full overflow-hidden p-[1px] border border-cyan-500/15">
            <motion.div
              className={`h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] ${targetLocked ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500'}`}
              style={{ width: `${progress}%` }}
              layoutId="progressBar"
            />
          </div>

          {/* Console logger lines */}
          <div className="mt-3 text-[8px] font-mono text-slate-400 tracking-wider text-left border-t border-slate-900 pt-2 h-10 flex flex-col justify-center">
            <div className="text-cyan-400/80 truncate uppercase font-bold">
              &gt; {progress < 25 && "STG 1: CALIBRATING AIM SENSORS [OK]"}
              {progress >= 25 && progress < 50 && "STG 2: CONVERGING LASER CORNER RAILS..."}
              {progress >= 50 && progress < 75 && "STG 3: EMITTING INTERACTIVE TARGET SCOPE..."}
              {progress >= 75 && progress < 95 && "STG 4: SECURING KLEPON RETICLE LOCK-ON..."}
              {progress >= 95 && "STG 5: TARGET LOCKED! FIRING NOW..."}
            </div>
            <div className="text-slate-500 truncate text-[7px] uppercase mt-0.5">
              AIM COORDINATES: [X: 192.44, Y: 402.12] • {progress === 100 ? "FIRE COMPLETION" : "ACTIVE SIGHT SENSORS"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
