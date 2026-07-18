/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProfileData } from '../types.ts';
import * as Icons from 'lucide-react';
import LKLogo from './LKLogo.tsx';

interface ProfilTabProps {
  profile: ProfileData;
  onChange: (updatedProfile: ProfileData) => void;
}

export default function ProfilTab({ profile, onChange }: ProfilTabProps) {
  const [seoKeywords, setSeoKeywords] = React.useState('');
  const [isGeneratingSeo, setIsGeneratingSeo] = React.useState(false);
  const [seoResult, setSeoResult] = React.useState<{ title: string; description: string } | null>(null);
  const [seoError, setSeoError] = React.useState('');
  
  const handleUpdate = (field: keyof ProfileData, value: string) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const presetEmojis = ["🟢", "🕹️", "🎮", "👾", "⚔️", "🔥", "🚀", "👑", "💡", "📡", "🛸"];

  return (
    <div className="space-y-6">
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
        <h3 className="text-sm font-semibold tracking-wide text-cyan-400 flex items-center gap-2 mb-6">
          <Icons.User className="w-4 h-4 text-cyan-400" />
          IDENTITAS PROFIL
        </h3>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Nama Tampilan</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              placeholder="Masukkan nama tampilan link bio Anda"
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Bio Singkat / Penjelasan</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => handleUpdate('bio', e.target.value)}
              placeholder="Masukkan bio deskripsi singkat..."
              className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Icons.MapPin className="w-3.5 h-3.5 text-cyan-400" /> Lokasi (Kota/Negara)
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleUpdate('location', e.target.value)}
                placeholder="Contoh: Jawa Tengah, Tegal, Indonesia"
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Email Contact */}
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Icons.Mail className="w-3.5 h-3.5 text-cyan-400" /> Kontak Email Resmi
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleUpdate('email', e.target.value)}
                placeholder="Contoh: kleponstore2@gmail.com"
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Pilih Jenis Avatar / Foto Profil */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs text-slate-400 mb-2 font-medium">Pilih Jenis Avatar / Foto Profil</label>
            
            {/* Segmented Control */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#10192e] border border-slate-800 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => handleUpdate('avatarType', 'emoji')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  profile.avatarType === 'emoji' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Emoji 🟢
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('avatarType', 'initial')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  profile.avatarType === 'initial' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inisial 🔠
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('avatarType', 'link')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  profile.avatarType === 'link' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Link Foto 🔗
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('avatarType', 'upload')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  profile.avatarType === 'upload' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unggah Galeri 📸
              </button>
            </div>

            {/* Input fields based on selection */}
            {profile.avatarType === 'emoji' && (
              <div className="space-y-3 p-3 bg-[#131d35] rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium">Pilih Emoji Terpopuler atau Tulis Sendiri:</span>
                <div className="flex flex-wrap gap-2">
                  {presetEmojis.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleUpdate('avatarValue', emo)}
                      className={`text-xl p-2 rounded-lg bg-[#182542] hover:bg-slate-700 transition-all border cursor-pointer ${
                        profile.avatarValue === emo ? 'border-cyan-500 scale-110' : 'border-transparent'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Atau ketik emoji kustom..."
                  value={profile.avatarValue}
                  onChange={(e) => handleUpdate('avatarValue', e.target.value)}
                  className="w-full bg-[#1c2a47] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {profile.avatarType === 'initial' && (
              <div className="p-3 bg-[#131d35] rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Ketik Inisial Singkat (Max 3 Karakter):</span>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="Contoh: LK, KP, PK"
                  value={profile.avatarValue}
                  onChange={(e) => handleUpdate('avatarValue', e.target.value.toUpperCase())}
                  className="w-full bg-[#1c2a47] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest font-bold"
                />
              </div>
            )}

            {profile.avatarType === 'link' && (
              <div className="p-3 bg-[#131d35] rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Masukkan URL Link Foto Profil Anda:</span>
                <input
                  type="text"
                  placeholder="Contoh: https://images.unsplash.com/photo-..."
                  value={profile.avatarValue}
                  onChange={(e) => handleUpdate('avatarValue', e.target.value)}
                  className="w-full bg-[#1c2a47] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            )}

            {profile.avatarType === 'upload' && (
              <div className="p-5 bg-[#131d35] rounded-lg border border-dashed border-cyan-500/30 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="w-16 h-16 rounded-full border border-cyan-500/30 bg-[#0d1527] flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {profile.avatarValue && profile.avatarValue !== 'LK' && profile.avatarValue !== '👤' ? (
                      <img src={profile.avatarValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="scale-75">
                        <LKLogo size={55} glow={true} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-1">
                    <h4 className="text-xs font-bold text-cyan-300">Unggah dari Galeri atau Google Foto</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Pilih file foto dari galeri HP / PC Anda, atau tempel URL langsung Google Photos / Google Drive / Imgur.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* File Upload Button */}
                  <label className="flex flex-col items-center justify-center p-3 bg-[#172545] border border-slate-700 hover:border-cyan-500/50 rounded-lg cursor-pointer transition text-center hover:bg-[#1c2e54]">
                    <Icons.UploadCloud className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-200">Pilih dari Galeri HP/PC</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Mendukung JPEG, PNG, WEBP</span>
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
                              handleUpdate('avatarValue', reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {/* URL / Google Photos Direct Link Input */}
                  <div className="p-3 bg-[#172545] border border-slate-700 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-300 block mb-1">Tempel Link Google Foto / Direct URL</span>
                      <input
                        type="text"
                        placeholder="https://photos.google.com/... atau https://..."
                        value={profile.avatarValue.startsWith('data:') ? '' : profile.avatarValue}
                        onChange={(e) => handleUpdate('avatarValue', e.target.value)}
                        className="w-full bg-[#10192e] border border-slate-700 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1">Tempel URL link publik foto dari Google Photos Anda.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate('avatarValue', 'LK')}
                      className="bg-[#1b2b4d] text-[10px] px-3 py-1.5 rounded text-cyan-400 hover:bg-slate-700 transition cursor-pointer font-bold"
                    >
                      Gunakan Default LK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate('avatarValue', '👤')}
                      className="bg-slate-800 text-[10px] px-3 py-1.5 rounded text-rose-400 hover:bg-slate-700 transition cursor-pointer font-bold"
                    >
                      Reset / Kosongkan
                    </button>
                  </div>

                  <span className="text-[9px] text-slate-500">
                    {profile.avatarValue.startsWith('data:') ? '✓ Foto Galeri Aktif (Base64)' : profile.avatarValue === 'LK' ? '✓ Logo LK Aktif' : '✓ Web URL Aktif'}
                  </span>
                </div>
              </div>
            )}

            {/* Opsi Sinkronisasi Logo Animasi Masuk */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="bg-[#10192e] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Icons.Sparkles className="w-4 h-4 text-cyan-400" />
                    SINKRONISASI IDENTITAS ANIMASI MASUK (ENTRANCE LOGO)
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl">
                    Aktifkan opsi ini agar foto yang Anda unggah dari galeri atau Google Foto di atas juga digunakan sebagai logo utama di animasi masuk web Link Klepon (menggantikan logo LK default).
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange({ ...profile, useAvatarInEntrance: !profile.useAvatarInEntrance })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      profile.useAvatarInEntrance ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        profile.useAvatarInEntrance ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* PENGATURAN FAVICON HALAMAN */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="bg-[#10192e] border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icons.Settings className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                    PENGATURAN FAVICON HALAMAN (PUBLIC FAVICON)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    Atur ikon kecil (favicon) yang muncul di tab browser halaman publik Anda. Tempel link kustom, pilih foto dari Google Foto, atau unggah gambar dari galeri HP/PC Anda.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0d1425] p-3 rounded-lg border border-slate-800">
                  {/* Favicon Preview */}
                  <div className="w-12 h-12 rounded-lg border-2 border-cyan-500/30 bg-[#060b13] flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    {profile.favicon ? (
                      <img 
                        src={profile.favicon} 
                        alt="Favicon Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=64&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <Icons.Gamepad2 className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* Upload button */}
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1a263f] hover:bg-[#223253] border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 cursor-pointer transition">
                        <Icons.UploadCloud className="w-4 h-4 text-cyan-400" />
                        Unggah Gambar Favicon
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
                                  onChange({ ...profile, favicon: reader.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {/* Reset button */}
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ ...profile, favicon: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=64&auto=format&fit=crop&q=80' });
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 rounded-lg text-[10px] font-bold text-rose-400 cursor-pointer transition"
                      >
                        <Icons.RefreshCw className="w-3.5 h-3.5" />
                        Gunakan Favicon Default
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-medium">Atau tempel Link/URL Foto Langsung:</span>
                      <input
                        type="text"
                        placeholder="Masukkan URL foto favicon (cth: link Google Photos)"
                        value={profile.favicon?.startsWith('data:') ? '' : (profile.favicon || '')}
                        onChange={(e) => {
                          onChange({ ...profile, favicon: e.target.value });
                        }}
                        className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PENGATURAN SEO & META DATA */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="bg-[#0f192b] border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icons.Globe className="w-4 h-4 text-emerald-400" />
                    KONFIGURASI SEO & META HALAMAN (SEO ENGINE)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    Sesuaikan judul meta dan deskripsi halaman bio link Anda untuk meningkatkan keterlihatan dan ranking pencarian di Google, Yahoo, Bing, dan sosial media.
                  </p>
                </div>

                {/* AI SEO Suggestion Engine */}
                <div className="bg-[#0d1525] border border-emerald-500/10 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 flex items-center gap-1.5 uppercase">
                      <Icons.Cpu className="w-3.5 h-3.5 animate-pulse" />
                      Otomatisasi SEO Cerdas (AI Gemini)
                    </span>
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Ready</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Tulis kata kunci/keywords target pencarian Anda di bawah, dan AI Gemini akan merekomendasikan judul & deskripsi terbaik berdasarkan profil Link Klepon Anda.
                  </p>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="Contoh: klepon store, top up game murah, event klepon"
                        className="bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1 placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!seoKeywords.trim()) {
                            setSeoError("Harap masukkan setidaknya satu kata kunci.");
                            return;
                          }
                          setIsGeneratingSeo(true);
                          setSeoError('');
                          setSeoResult(null);
                          try {
                            const res = await fetch('/api/gemini/seo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                keywords: seoKeywords,
                                titleContext: profile.name,
                                bioContext: profile.bio
                              })
                            });
                            if (!res.ok) {
                              throw new Error("Gagal menghubungi server backend.");
                            }
                            const data = await res.json();
                            if (data.error) {
                              throw new Error(data.error);
                            }
                            setSeoResult({
                              title: data.title || '',
                              description: data.description || ''
                            });
                          } catch (err: any) {
                            console.error(err);
                            setSeoError(err.message || "Gagal menghasilkan saran SEO.");
                          } finally {
                            setIsGeneratingSeo(false);
                          }
                        }}
                        disabled={isGeneratingSeo}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 text-xs font-black px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isGeneratingSeo ? (
                          <>
                            <Icons.Loader className="w-3.5 h-3.5 animate-spin" />
                            <span>Menganalisis...</span>
                          </>
                        ) : (
                          <>
                            <Icons.Sparkles className="w-3.5 h-3.5 animate-bounce" />
                            <span>Saran AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {seoError && (
                      <div className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 p-2 rounded border border-rose-500/20">
                        {seoError}
                      </div>
                    )}

                    {seoResult && (
                      <div className="bg-[#121c33] border border-emerald-500/20 rounded-lg p-3 space-y-3">
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wide">
                          <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Saran AI Berhasil Dibuat!
                        </div>

                        <div className="space-y-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block font-bold">Judul Halaman (Meta Title):</span>
                            <p className="bg-[#0c1221] p-2 rounded text-white font-medium border border-slate-800/60 mt-0.5">{seoResult.title}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold">Deskripsi Pencarian (Meta Description):</span>
                            <p className="bg-[#0c1221] p-2 rounded text-slate-300 font-mono leading-relaxed border border-slate-800/60 mt-0.5">{seoResult.description}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onChange({
                              ...profile,
                              metaTitle: seoResult.title,
                              metaDescription: seoResult.description
                            });
                            setSeoResult(null);
                            setSeoKeywords('');
                          }}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded transition uppercase tracking-wider cursor-pointer"
                        >
                          Terapkan Rekomendasi AI ini
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">SEO Meta Title / Judul Halaman</label>
                    <input
                      type="text"
                      placeholder="Masukkan Meta Title halaman..."
                      value={profile.metaTitle || ''}
                      onChange={(e) => onChange({ ...profile, metaTitle: e.target.value })}
                      className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">SEO Meta Description / Deskripsi Singkat</label>
                    <textarea
                      rows={3}
                      placeholder="Masukkan Meta Description deskripsi pencarian..."
                      value={profile.metaDescription || ''}
                      onChange={(e) => onChange({ ...profile, metaDescription: e.target.value })}
                      className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-mono resize-none"
                    />
                  </div>

                  {/* Google Search Result Preview Mockup */}
                  <div className="border border-slate-800 bg-slate-950/80 p-3.5 rounded-lg space-y-1 select-none">
                    <span className="text-[9px] font-black tracking-widest text-emerald-400/80 uppercase block mb-1">PREVIEW DI MESIN PENCARI GOOGLE:</span>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 block truncate font-mono">https://link.klepon.official/bio-link</span>
                      <h4 className="text-sm text-blue-400 hover:underline font-medium cursor-pointer truncate leading-tight">
                        {profile.metaTitle || `${profile.name || 'LINK KLEPON'} - Website Resmi`}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {profile.metaDescription || 'Temukan semua tautan resmi Klepon Store, Event Game seru, Sosial Media, dan kontak penting lainnya dalam satu halaman bio link.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAUTAN MEDIA SOSIAL DINAMIS */}
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Icons.Share2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  PENGATURAN MEDIA SOSIAL (DYNAMIC ROW)
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  Tambahkan baris ikon media sosial interaktif Anda sendiri di bawah profil. Sesuaikan ikon menggunakan logo default atau unggah foto/gambar kustom dari galeri / Google Foto.
                </p>
              </div>

              <div className="space-y-4">
                {(profile.socials || []).map((soc, idx) => (
                  <div key={soc.id || idx} className="bg-[#10182b] border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-300" />
                    
                    <div className="flex items-center justify-between gap-3 border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">Media Sosial #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.socials || []).filter(s => s.id !== soc.id);
                          onChange({ ...profile, socials: updated });
                        }}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Icons.Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Platform */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Platform</label>
                        <select
                          value={soc.platform}
                          onChange={(e) => {
                            const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, platform: e.target.value as any } : s);
                            onChange({ ...profile, socials: updated });
                          }}
                          className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="custom">Platform Kustom / Web Lain</option>
                        </select>
                      </div>

                      {/* URL */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Link URL</label>
                        <input
                          type="text"
                          value={soc.url}
                          onChange={(e) => {
                            const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, url: e.target.value } : s);
                            onChange({ ...profile, socials: updated });
                          }}
                          placeholder="Masukkan URL tautan..."
                          className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Icon Customizer Section */}
                    <div className="bg-[#131d33] border border-slate-800/40 p-3 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300">PILIHAN IKON SOSIAL</span>
                        <div className="flex gap-1.5 p-0.5 bg-[#0b101d] rounded border border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, iconType: 'default' as const } : s);
                              onChange({ ...profile, socials: updated });
                            }}
                            className={`px-2 py-1 text-[9px] font-bold rounded transition cursor-pointer ${soc.iconType === 'default' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                          >
                            Bawaan / Default
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, iconType: 'upload' as const } : s);
                              onChange({ ...profile, socials: updated });
                            }}
                            className={`px-2 py-1 text-[9px] font-bold rounded transition cursor-pointer ${soc.iconType === 'upload' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                          >
                            Galeri / Google Foto 📸
                          </button>
                        </div>
                      </div>

                      {soc.iconType === 'default' ? (
                        <div className="flex items-center gap-2.5 text-xs text-slate-400 p-1">
                          <span className="text-[10px]">Ikon default yang akan digunakan:</span>
                          <span className="flex items-center gap-1 bg-[#1a263f] px-2.5 py-1 rounded text-cyan-400 border border-cyan-500/10 font-mono font-bold uppercase text-[9px]">
                            {soc.platform === 'instagram' && <><Icons.Instagram className="w-3.5 h-3.5" /> Instagram</>}
                            {soc.platform === 'tiktok' && <><Icons.Video className="w-3.5 h-3.5" /> TikTok</>}
                            {soc.platform === 'twitter' && <><Icons.Twitter className="w-3.5 h-3.5" /> Twitter / X</>}
                            {soc.platform === 'linkedin' && <><Icons.Linkedin className="w-3.5 h-3.5" /> LinkedIn</>}
                            {soc.platform === 'custom' && <><Icons.Globe className="w-3.5 h-3.5" /> Website</>}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            {/* Icon Preview */}
                            <div className="w-10 h-10 rounded-lg border border-cyan-500/20 bg-[#0d1527] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {soc.iconValue ? (
                                <img src={soc.iconValue} alt="Icon Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Icons.Image className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div className="flex-1 w-full space-y-1">
                              <span className="text-[10px] text-slate-400 font-medium">Unggah atau Tempel Link Google Foto:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {/* Upload button */}
                                <label className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#1a263f] hover:bg-[#223253] border border-slate-700 rounded text-[10px] font-bold text-slate-200 cursor-pointer transition">
                                  <Icons.UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                                  Pilih dari HP/PC
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
                                            const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, iconValue: reader.result as string } : s);
                                            onChange({ ...profile, socials: updated });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>

                                {/* Link input */}
                                <input
                                  type="text"
                                  placeholder="Tempel Link Google Foto/Direct URL"
                                  value={soc.iconValue.startsWith('data:') ? '' : soc.iconValue}
                                  onChange={(e) => {
                                    const updated = (profile.socials || []).map(s => s.id === soc.id ? { ...s, iconValue: e.target.value } : s);
                                    onChange({ ...profile, socials: updated });
                                  }}
                                  className="w-full bg-[#101726] border border-slate-700 rounded px-2.5 py-1.5 text-[9px] text-white focus:outline-none focus:border-cyan-500 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(profile.socials || []).length === 0 && (
                  <div className="text-center py-6 bg-[#10182b]/50 border border-slate-800 border-dashed rounded-xl">
                    <Icons.Share2 className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-400">Belum ada baris media sosial kustom. Tambahkan sekarang!</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const newId = `soc_${Date.now()}`;
                    const updated = [...(profile.socials || []), {
                      id: newId,
                      platform: 'instagram' as const,
                      url: 'https://instagram.com/',
                      iconType: 'default' as const,
                      iconValue: ''
                    }];
                    onChange({ ...profile, socials: updated });
                  }}
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 py-2.5 rounded-xl text-xs font-extrabold tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Icons.PlusCircle className="w-4 h-4" />
                  TAMBAH MEDIA SOSIAL BARU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
