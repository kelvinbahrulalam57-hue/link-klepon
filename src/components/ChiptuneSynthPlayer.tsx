/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChiptuneTrack {
  name: string;
  genre: string;
  bpm: number;
  description: string;
  progression: number[][]; // [chord, melodyNotes]
}

const TRACKS: ChiptuneTrack[] = [
  {
    name: "KLEPON WAVE",
    genre: "8-BIT CHILL LOFI",
    bpm: 85,
    description: "Relaxing tropical pandan leaves retro chill vibes.",
    progression: [
      [220, 330, 440, 523], // A minor
      [261, 329, 392, 523], // C Major
      [293, 349, 440, 587], // D minor
      [349, 440, 523, 698], // F Major
    ]
  },
  {
    name: "NEON COCKPIT",
    genre: "CYBERPUNK SYNTHWAVE",
    bpm: 120,
    description: "Driving cyberpunk 80s arcade action simulator.",
    progression: [
      [110, 220, 277, 330], // A Major
      [130, 261, 311, 392], // C minor
      [146, 293, 349, 440], // D minor
      [110, 220, 277, 330], // A Major
    ]
  },
  {
    name: "AMBIENT VOID",
    genre: "SPACE SCI-FI DRONE",
    bpm: 60,
    description: "Vast, hypnotic slow soundscapes of the nexus.",
    progression: [
      [146, 220, 293, 440], // Dsus2
      [165, 220, 330, 440], // Asus4
      [196, 293, 392, 587], // G Major
      [146, 220, 293, 440], // Dsus2
    ]
  }
];

export default function ChiptuneSynthPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.04); // keep it safe and comfortable by default
  const [step, setStep] = useState(0);
  
  // Audio state refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalIdRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Visualizer bar animation state
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10]);

  const currentTrack = TRACKS[currentTrackIndex];

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopSynthesizer();
    };
  }, []);

  // Update volume in real-time
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Synchronous step sequencer callback
  const playStep = () => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Auto increment step
    setStep(prev => (prev + 1) % 16);

    const progression = currentTrack.progression;
    const chordIndex = Math.floor(step / 4) % progression.length;
    const currentChord = progression[chordIndex];

    // Every beat (4 steps) trigger a warm synth bass
    if (step % 4 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      
      // play fundamental note 2 octaves down
      bassOsc.frequency.setValueAtTime(currentChord[0] / 4, now);
      bassGain.gain.setValueAtTime(volume * 2.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      bassOsc.connect(bassGain);
      bassGain.connect(masterGainRef.current);
      bassOsc.start(now);
      bassOsc.stop(now + 0.6);
    }

    // Melody triggers on active steps (random pentatonic arpeggios to sound beautiful)
    const melodyTriggerChance = currentTrackIndex === 2 ? 0.3 : 0.75; // Ambient is more sparse
    if (Math.random() < melodyTriggerChance) {
      const noteToPlay = currentChord[Math.floor(Math.random() * currentChord.length)];
      // Arpeggiate melody one octave higher
      const frequency = noteToPlay * (currentTrackIndex === 1 ? 2 : 1.5);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Custom synth styles
      osc.type = currentTrackIndex === 1 ? 'square' : 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      // Simple pitch vibrato
      if (currentTrackIndex === 0) {
        osc.frequency.setValueAtTime(frequency + (Math.sin(step) * 4), now + 0.1);
      }

      gainNode.gain.setValueAtTime(volume * 0.9, now);
      const noteDuration = currentTrackIndex === 2 ? 1.2 : 0.28; // Ambient has long tails
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

      // Lowpass Filter for warmer sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(currentTrackIndex === 1 ? 1200 : 2000, now);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      osc.start(now);
      osc.stop(now + noteDuration);
    }

    // Fast glitch percussion hihat arpeggiation (Square burst)
    if (step % 2 === 0 && currentTrackIndex === 1) {
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(10000, now);
      
      hatGain.gain.setValueAtTime(volume * 0.3, now);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      
      hatOsc.connect(hatGain);
      hatGain.connect(masterGainRef.current);
      hatOsc.start(now);
      hatOsc.stop(now + 0.04);
    }

    // Dynamic graphic equalizer simulation
    if (analyserRef.current) {
      const dataArray = new Uint8Array(8);
      for (let i = 0; i < 8; i++) {
        dataArray[i] = Math.floor(Math.random() * 85) + 15;
      }
      setVisualizerHeights(Array.from(dataArray));
    }
  };

  // Run the sequence loop when playing
  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = (60 / currentTrack.bpm / 4) * 1000;
      intervalIdRef.current = setInterval(playStep, stepDurationMs);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    }
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [isPlaying, currentTrackIndex, step]);

  const initAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("AudioContext is not supported in this browser environment.");
        return;
      }
      const ctx = new AudioContextClass();
      const mainGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      mainGain.gain.setValueAtTime(volume, ctx.currentTime);
      
      // Connect output chain
      mainGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = mainGain;
      analyserRef.current = analyser;
    } catch (err) {
      console.error("Failed to initialize Web Audio API:", err);
    }
  };

  const startSynthesizer = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    // resume if suspended (required due to Chrome autoplay block)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying(true);
  };

  const stopSynthesizer = () => {
    setIsPlaying(false);
    setStep(0);
    setVisualizerHeights([10, 10, 10, 10, 10, 10, 10, 10]);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynthesizer();
    } else {
      startSynthesizer();
    }
  };

  const handleNextTrack = () => {
    const wasPlaying = isPlaying;
    stopSynthesizer();
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    if (wasPlaying) {
      setTimeout(() => startSynthesizer(), 100);
    }
  };

  const handlePrevTrack = () => {
    const wasPlaying = isPlaying;
    stopSynthesizer();
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    if (wasPlaying) {
      setTimeout(() => startSynthesizer(), 100);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-950/75 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.05)] relative text-left select-none overflow-hidden mt-6">
      {/* Decorative top energy line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500" />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border flex items-center justify-center ${isPlaying ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <Icons.Music className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h4 className="text-[10px] font-black tracking-[0.2em] text-cyan-300 uppercase">KLEPON RETRO FM</h4>
            <p className="text-[7px] text-slate-500 uppercase tracking-widest font-black">CHIPTUNE SYNTHESIZER</p>
          </div>
        </div>

        {/* Live Audio Equalizer Visualizer Bars */}
        <div className="flex items-end gap-1 h-5 select-none pr-1">
          {visualizerHeights.map((h, i) => (
            <motion.div
              key={i}
              className="w-[2px] rounded-t-sm bg-gradient-to-t from-cyan-400 to-rose-400 shadow-[0_0_5px_rgba(34,211,238,0.4)]"
              animate={{ height: isPlaying ? `${h}%` : '4px' }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            />
          ))}
        </div>
      </div>

      {/* Album visualizer cassette container */}
      <div className="bg-[#030611] border border-slate-900 rounded-xl p-3 flex gap-3.5 items-center relative overflow-hidden">
        {/* Abstract vinyl disc spinning */}
        <div className="relative w-12 h-12 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-500/30 flex items-center justify-center"
          >
            <div className="w-3.5 h-3.5 bg-rose-500/40 rounded-full border border-rose-400/50" />
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wide truncate">{currentTrack.name}</span>
            <span className="text-[6px] px-1 py-0.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded font-bold font-mono tracking-tighter shrink-0">{currentTrack.genre}</span>
          </div>
          <p className="text-[8px] text-slate-400 mt-1 truncate leading-tight uppercase font-medium">{currentTrack.description}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[7px] font-mono font-bold text-slate-500">
            <span>BPM: {currentTrack.bpm}</span>
            <span>STEP: {isPlaying ? `${step + 1}/16` : 'IDLE'}</span>
          </div>
        </div>
      </div>

      {/* Player controllers */}
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-900">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevTrack}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all active:scale-90 cursor-pointer"
            title="Lagu Sebelumnya"
          >
            <Icons.SkipBack className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={togglePlayback}
            className={`p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-lg ${
              isPlaying 
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
                : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4 fill-cyan-400" />}
          </button>

          <button
            onClick={handleNextTrack}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all active:scale-90 cursor-pointer"
            title="Lagu Selanjutnya"
          >
            <Icons.SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real-time slider volume slider */}
        <div className="flex items-center gap-1.5 w-1/2">
          <Icons.VolumeX className="w-3 h-3 text-slate-500" />
          <div className="flex-1 h-1 bg-slate-900 rounded-full relative cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setVolume(Math.max(0, Math.min(0.12, pos * 0.12)));
          }}>
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" style={{ width: `${(volume / 0.12) * 100}%` }} />
            <div className="absolute w-2 h-2 rounded-full bg-white top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer shadow-md" style={{ left: `${(volume / 0.12) * 100}%` }} />
          </div>
          <Icons.Volume2 className="w-3 h-3 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}
