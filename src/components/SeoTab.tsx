/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProfileData } from '../types.ts';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface SeoTabProps {
  profile: ProfileData;
  onChange: (updatedProfile: ProfileData) => void;
}

const PRESET_PREVIEWS = [
  { name: 'Klepon Pandan Green', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600' },
  { name: 'Sweet Coconut Sugar', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600' },
  { name: 'Traditional Javanese Art', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600' },
  { name: 'Minimalist Tech Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600' }
];

export default function SeoTab({ profile, onChange }: SeoTabProps) {
  const [metaTitle, setMetaTitle] = useState(profile.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(profile.metaDescription || '');
  const [metaImage, setMetaImage] = useState(profile.metaImage || PRESET_PREVIEWS[0].url);

  const handleUpdate = (updates: Partial<ProfileData>) => {
    onChange({
      ...profile,
      ...updates
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setMetaImage(result);
      handleUpdate({ metaImage: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6" id="seo-tab-container">
      {/* Title block */}
      <div className="bg-[#0b1329] border border-cyan-500/15 rounded-xl p-5 shadow-xl relative overflow-hidden" id="seo-intro-card">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
        <h3 className="text-sm font-semibold tracking-wide text-cyan-400 flex items-center gap-2 mb-2">
          <Icons.SearchCode className="w-5 h-5 text-cyan-400" />
          PENGATURAN SEO & OPTIMISASI SEARCH ENGINE
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Atur meta title, meta description, dan gambar preview sosial untuk meningkatkan keterbacaan, ranking Google, serta daya tarik visual saat link bio Link Klepon Anda dibagikan ke WhatsApp, Twitter, Facebook, atau LinkedIn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="seo-main-grid">
        {/* Left Column: Input Form */}
        <div className="space-y-6" id="seo-form-col">
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Icons.FileText className="w-4 h-4 text-cyan-400" />
              Meta Tag Informasi
            </h4>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs text-slate-400 font-semibold">Judul Meta (Meta Title)</label>
                <span className={`text-[10px] ${metaTitle.length > 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {metaTitle.length} / 60 karakter
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  handleUpdate({ metaTitle: e.target.value });
                }}
                placeholder="Contoh: Klepon Manis Mandiri | Link Bio Resmi Kuliner"
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500">Judul yang muncul di tab browser dan hasil pencarian Google. Usahakan ringkas dan menarik.</p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs text-slate-400 font-semibold">Deskripsi Meta (Meta Description)</label>
                <span className={`text-[10px] ${metaDescription.length > 160 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {metaDescription.length} / 160 karakter
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value);
                  handleUpdate({ metaDescription: e.target.value });
                }}
                rows={3}
                placeholder="Contoh: Nikmati kelezatan klepon pandan premium asli dengan lumeran gula merah murni. Temukan info pemesanan, ulasan, dan lokasi toko kami di sini!"
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500">Ringkasan singkat isi halaman Anda. Google menampilkan deskripsi ini di bawah judul pencarian.</p>
            </div>
          </div>

          {/* Social Preview Image Settings */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Icons.Image className="w-4 h-4 text-cyan-400" />
              Gambar Preview Sosial (Open Graph Image)
            </h4>

            {/* Image Source Toggle Option */}
            <div className="space-y-3">
              <label className="block text-xs text-slate-400 font-semibold">Pilih atau Unggah Gambar Preview</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_PREVIEWS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMetaImage(preset.url);
                      handleUpdate({ metaImage: preset.url });
                    }}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      metaImage === preset.url ? 'border-cyan-400 scale-[1.03] shadow-md shadow-cyan-400/10' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 px-1 text-[8px] text-center text-slate-200 truncate">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1">
                  <span className="block text-xs text-slate-400 mb-1">Tempel URL Gambar Kustom:</span>
                  <input
                    type="url"
                    value={metaImage.startsWith('data:') ? '' : metaImage}
                    onChange={(e) => {
                      setMetaImage(e.target.value);
                      handleUpdate({ metaImage: e.target.value });
                    }}
                    placeholder="https://domain.com/social-preview.jpg"
                    className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="shrink-0 flex flex-col justify-end">
                  <span className="block text-xs text-slate-400 mb-1">Atau Unggah Gambar:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 file:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Live Previews */}
        <div className="space-y-6" id="seo-preview-col">
          {/* Google Search Result Preview */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Icons.Globe className="w-4 h-4 text-cyan-400" />
              KOSMETIK PRATINJAU GOOGLE SEARCH (GOOGLE SEARCH PREVIEW)
            </h4>
            <div className="bg-white text-slate-900 p-4 rounded-lg border border-slate-200 shadow-inner font-sans text-left">
              <div className="text-[12px] text-[#202124] flex items-center gap-1.5 mb-1 truncate">
                <span className="bg-slate-100 p-1 rounded-full text-[#3c4043]">
                  <Icons.Globe className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[14px] font-normal block text-[#202124]">Link Klepon</span>
                  <span className="text-[12px] text-[#5f6368] block leading-none">https://linkklepon.id/{profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'username'}</span>
                </div>
              </div>
              <h5 className="text-[20px] text-[#1a0dab] font-normal hover:underline leading-snug cursor-pointer font-sans truncate">
                {metaTitle.trim() || `${profile.name || 'Nama Klepon'} - Link Klepon Bio Resmi`}
              </h5>
              <p className="text-[14px] text-[#4d5156] leading-relaxed mt-1 font-sans break-words line-clamp-2">
                {metaDescription.trim() || profile.bio || 'Deskripsi singkat mengenai link bio kuliner atau personal Anda untuk memudahkan mesin pencari mengindeks.'}
              </p>
            </div>
          </div>

          {/* Social Card Preview */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Icons.Share2 className="w-4 h-4 text-cyan-400" />
              PRATINJAU MEDIA SOSIAL (WHATSAPP / FACEBOOK / OG CARD)
            </h4>
            <div className="bg-[#121c33] rounded-xl overflow-hidden border border-slate-800 shadow-xl max-w-sm mx-auto text-left">
              {/* Card Thumbnail Image */}
              <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                {metaImage ? (
                  <img src={metaImage} alt="Social Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-950 to-[#0b1329] flex items-center justify-center text-slate-600">
                    <Icons.Image className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                  OG IMAGE
                </div>
              </div>
              {/* Card Meta Content */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-900 space-y-1">
                <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest font-mono">
                  LINKKLEPON.ID
                </span>
                <h6 className="text-sm font-semibold text-slate-100 leading-snug truncate">
                  {metaTitle.trim() || `${profile.name || 'Nama Klepon'} - Link Bio`}
                </h6>
                <p className="text-xs text-slate-400 leading-normal line-clamp-2 break-words">
                  {metaDescription.trim() || profile.bio || 'Deskripsi singkat link bio Link Klepon Anda saat dibagikan ke media sosial.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
