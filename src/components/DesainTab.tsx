/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeConfig } from '../types.ts';
import {
  PRESET_THEMES,
  PRESET_THEME_COLORS,
  FONT_OPTIONS,
  BUTTON_STYLES,
  PATTERN_OPTIONS
} from '../data/defaultState.ts';
import * as Icons from 'lucide-react';

interface DesainTabProps {
  theme: ThemeConfig;
  onChange: (updatedTheme: ThemeConfig) => void;
  adminStyle: 'slate' | 'gold' | 'sage';
  onAdminStyleChange: (style: 'slate' | 'gold' | 'sage') => void;
}

export default function DesainTab({ theme, onChange, adminStyle, onAdminStyleChange }: DesainTabProps) {

  const handleUpdate = (field: keyof ThemeConfig, value: any) => {
    onChange({
      ...theme,
      [field]: value
    });
  };

  // Preset 1-click apply
  const applyPresetTheme = (preset: typeof PRESET_THEMES[0]) => {
    onChange({
      ...theme,
      id: preset.id,
      name: preset.name,
      font: preset.font,
      buttonStyle: preset.buttonStyle,
      pattern: preset.pattern,
      backgroundType: preset.backgroundType,
      backgroundValue: preset.backgroundValue,
      blur: preset.blur,
      opacity: preset.opacity,
      sizing: preset.sizing
    });
  };

  // Preset quick backgrounds
  const applyQuickBackground = (type: 'color' | 'gradient' | 'image', value: string) => {
    onChange({
      ...theme,
      backgroundType: type,
      backgroundValue: value
    });
  };

  // Color preset apply
  const applyColorPreset = (preset: typeof PRESET_THEME_COLORS[0]) => {
    onChange({
      ...theme,
      id: preset.id,
      name: preset.name,
      backgroundType: 'color',
      backgroundValue: preset.background,
      buttonStyle: 'Flat Block (Minimalist)'
    });
  };

  const imagePresets = [
    { name: "Neon Cyber", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600" },
    { name: "Abstract", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600" },
    { name: "Gaming Room", url: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600" },
    { name: "Cosmic Space", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600" },
    { name: "Mist Forest", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600" },
    { name: "Pink Sunset", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600" }
  ];

  return (
    <div className="space-y-6">
      {/* Galeri Template Halaman */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
            <Icons.Palette className="w-4 h-4 text-cyan-400" />
            GALERI TEMPLATE HALAMAN (1-CLICK TEMPLATES)
          </h3>
          <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">INSTAN</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Ubah tampilan visual halaman link Anda secara instan dalam satu klik! Pilih dari galeri template modern, tebal, minimalis, atau bernuansa gaming di bawah ini:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPresetTheme(preset)}
              className={`p-4 bg-[#121c33] hover:bg-[#182645] border text-left rounded-xl transition-all relative group cursor-pointer ${
                theme.id === preset.id ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white text-xs">{preset.name}</span>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                  preset.id === 'classic_minimalist' ? 'bg-slate-700 text-slate-300' :
                  preset.id === 'retro_neobrutalist' ? 'bg-amber-500 text-slate-950' :
                  preset.id === 'neon_cyberpunk' ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {preset.id === 'classic_minimalist' ? 'Populer' :
                   preset.id === 'retro_neobrutalist' ? 'Trending' :
                   preset.id === 'neon_cyberpunk' ? 'Gamer' : 'Estetik'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-3 truncate">Pola: {preset.pattern} • Font: {preset.font}</p>
              
              {/* Dummy preview bar */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="h-1 bg-slate-700 rounded-full flex-1" />
                <span className="text-[8px] text-slate-400 group-hover:text-cyan-400 transition-colors">LIHAT LINK</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gaya Warna Dashboard Admin (Tema Tampilan Admin) */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 mb-2">
          <Icons.LayoutGrid className="w-4 h-4 text-cyan-400" />
          GAYA WARNA DASHBOARD ADMIN (TEMA TAMPILAN ADMIN)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Sesuaikan warna tampilan halaman admin/dashboard ini dengan mood Anda!</p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onAdminStyleChange('slate')}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              adminStyle === 'slate' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-[#121c33] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            Slate Blue 🌊
          </button>
          <button
            onClick={() => onAdminStyleChange('gold')}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              adminStyle === 'gold' ? 'bg-amber-500/10 border-amber-400 text-amber-400' : 'bg-[#121c33] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Espresso Gold ☕
          </button>
          <button
            onClick={() => onAdminStyleChange('sage')}
            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              adminStyle === 'sage' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400' : 'bg-[#121c33] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Serene Sage 🌿
          </button>
        </div>
      </div>

      {/* Pilih Tema Presets */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 mb-2">
          <Icons.Sparkles className="w-4 h-4 text-cyan-400" />
          PILIH TEMA PRESETS (TEMA KALEM, SIMPEL & ELEGAN)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Preset warna background klasik, bersih, dan modern yang ramah di mata pengunjung:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_THEME_COLORS.map((col) => (
            <button
              key={col.id}
              onClick={() => applyColorPreset(col)}
              className={`p-3 bg-[#121c33] hover:bg-[#182645] border text-left rounded-lg transition-all cursor-pointer ${
                theme.id === col.id ? 'border-cyan-400' : 'border-slate-800'
              }`}
            >
              <div className="font-semibold text-white text-xs mb-1.5">{col.name}</div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: col.background }} />
                <div className="h-2 w-full rounded" style={{ backgroundColor: col.primary }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ubah Desain Sesuai Selera Anda */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Icons.Wrench className="w-4 h-4 text-cyan-400" />
          UBAH DESAIN SESUAI SELERA ANDA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Font selection */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Gaya Huruf (Font)</label>
            <select
              value={theme.font}
              onChange={(e) => handleUpdate('font', e.target.value)}
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Bentuk Tombol (Button Shape)</label>
            <select
              value={theme.buttonStyle}
              onChange={(e) => handleUpdate('buttonStyle', e.target.value)}
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {BUTTON_STYLES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Background pattern */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Pola Latar Belakang (Pattern)</label>
            <select
              value={theme.pattern}
              onChange={(e) => handleUpdate('pattern', e.target.value)}
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {PATTERN_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Preset Quick Colors */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Preset Latar Cepat (Ganti Langsung)</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => applyQuickBackground('gradient', 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)')}
                className="bg-[#121c33] border border-slate-700 hover:border-cyan-400 py-1 rounded text-[10px] text-slate-300 cursor-pointer"
              >
                Cyber Neon 🌌
              </button>
              <button
                onClick={() => applyQuickBackground('gradient', 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)')}
                className="bg-[#121c33] border border-slate-700 hover:border-cyan-400 py-1 rounded text-[10px] text-slate-300 cursor-pointer"
              >
                Sky Soft ☁️
              </button>
              <button
                onClick={() => applyQuickBackground('gradient', 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)')}
                className="bg-[#121c33] border border-slate-700 hover:border-cyan-400 py-1 rounded text-[10px] text-slate-300 cursor-pointer"
              >
                Breeze 🍃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gambar Latar Belakang */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Icons.Image className="w-4 h-4 text-cyan-400" />
          GAMBAR LATAR BELAKANG (BACKGROUND IMAGE)
        </h3>
        <p className="text-xs text-slate-400">Tambahkan gambar latar belakang untuk membuat halaman bio Anda semakin aesthetic dan menarik! Anda bisa memilih preset kami atau memasukkan URL gambar sendiri.</p>

        <div>
          <label className="block text-xs text-slate-400 mb-2 font-medium">Pilih Gambar Preset Cepat:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {imagePresets.map((img) => (
              <button
                key={img.name}
                onClick={() => applyQuickBackground('image', img.url)}
                className={`group relative h-14 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                  theme.backgroundValue === img.url ? 'border-cyan-400 scale-105' : 'border-slate-800'
                }`}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold tracking-wider">{img.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custom image url */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Atau Gunakan URL Gambar Kustom:</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={theme.backgroundType === 'image' ? theme.backgroundValue : ''}
              onChange={(e) => {
                if (e.target.value) {
                  onChange({ ...theme, backgroundType: 'image', backgroundValue: e.target.value });
                }
              }}
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Sizing selection */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Penyelarasan Gambar (Image Sizing)</label>
            <select
              value={theme.sizing}
              onChange={(e) => handleUpdate('sizing', e.target.value)}
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="cover">Cover (Penuh Menutupi Layar)</option>
              <option value="contain">Contain (Proporsional Tengah)</option>
              <option value="auto">Auto (Asli)</option>
              <option value="stretch">Stretch (Regangkan)</option>
            </select>
          </div>
        </div>

        {/* Sliders for Blur & Opacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Blur level */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 font-medium">Efek Buram (Blur):</span>
              <span className="text-cyan-400 font-bold font-mono">{theme.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={theme.blur}
              onChange={(e) => handleUpdate('blur', parseInt(e.target.value))}
              className="w-full accent-cyan-500 bg-[#162235] cursor-pointer"
            />
          </div>

          {/* Opacity level */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 font-medium">Transparansi Latar (Opacity):</span>
              <span className="text-cyan-400 font-bold font-mono">{theme.opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={theme.opacity}
              onChange={(e) => handleUpdate('opacity', parseInt(e.target.value))}
              className="w-full accent-cyan-500 bg-[#162235] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
