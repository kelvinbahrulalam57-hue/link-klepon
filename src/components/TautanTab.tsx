/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LinkItem } from '../types.ts';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface TautanTabProps {
  links: LinkItem[];
  onChange: (updatedLinks: LinkItem[]) => void;
  onLogSuspiciousActivity: (action: string) => void;
}

export default function TautanTab({ links, onChange, onLogSuspiciousActivity }: TautanTabProps) {
  // Add new link form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [imageType, setImageType] = useState<'icon' | 'upload'>('icon');
  const [imageValue, setImageValue] = useState('');
  const [uploadSource, setUploadSource] = useState<'gallery' | 'google_photos'>('gallery');

  // Scheduling states for new link
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');

  // Inline edit state for existing links
  const [editingImageLinkId, setEditingImageLinkId] = useState<string | null>(null);
  const [editingScheduleLinkId, setEditingScheduleLinkId] = useState<string | null>(null);
  const [inlineUploadSource, setInlineUploadSource] = useState<'gallery' | 'google_photos'>('gallery');

  // Bulk Edit mode states
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [bulkCategoryInput, setBulkCategoryInput] = useState('');
  
  // WhatsApp generator state
  const [waNumber, setWaNumber] = useState('');
  const [waText, setWaText] = useState('');

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageValue(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit new link
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    // Append protocol if missing
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    // Security sanitization check for suspicious protocols
    if (finalUrl.toLowerCase().startsWith('javascript:') || finalUrl.toLowerCase().startsWith('data:')) {
      onLogSuspiciousActivity(`Percobaan injeksi link mencurigakan: ${finalUrl}`);
      alert("Aktivitas Mencurigakan Terdeteksi! Protokol link dilarang untuk keamanan.");
      return;
    }

    const newLink: LinkItem = {
      id: `link_${Date.now()}`,
      title: title.trim(),
      url: finalUrl,
      category: category.trim() || 'Umum',
      icon: icon,
      isVisible: true,
      clickCount: 0,
      animation: 'none',
      imageType: imageType,
      imageValue: imageType === 'upload' ? imageValue : undefined,
      isScheduled: isScheduled,
      scheduleStart: isScheduled && scheduleStart ? scheduleStart : undefined,
      scheduleEnd: isScheduled && scheduleEnd ? scheduleEnd : undefined
    };

    onChange([newLink, ...links]);
    
    // Reset form
    setTitle('');
    setUrl('');
    setCategory('');
    setIcon('Globe');
    setImageType('icon');
    setImageValue('');
    setIsScheduled(false);
    setScheduleStart('');
    setScheduleEnd('');
  };

  // Generate WhatsApp Link
  const handleGenerateWa = () => {
    if (!waNumber) return;
    // Clean phone number (replace space, +, dashes)
    let cleanedNum = waNumber.replace(/[^0-9]/g, '');
    if (cleanedNum.startsWith('0')) {
      cleanedNum = '62' + cleanedNum.slice(1);
    }
    const encodedText = encodeURIComponent(waText);
    const finalWaUrl = `https://wa.me/${cleanedNum}?text=${encodedText}`;
    
    setTitle('Hubungi WhatsApp Kami 🟢');
    setUrl(finalWaUrl);
    setCategory('Kontak');
    setIcon('MessageSquare');
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    onChange(links.filter(link => link.id !== id));
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    onChange(links.map(link => {
      if (link.id === id) {
        return { ...link, isVisible: !link.isVisible };
      }
      return link;
    }));
  };

  // Update Animation style for link
  const handleUpdateAnimation = (id: string, animation: string) => {
    onChange(links.map(link => {
      if (link.id === id) {
        return { ...link, animation };
      }
      return link;
    }));
  };

  // Sort/Reorder Links
  const moveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;
    onChange(newLinks);
  };

  // Icon preview helper
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }
    return <Icons.Globe className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Tambah Tautan Baru */}
      <div className="bg-[#0b1329] border border-cyan-500/20 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
        <h3 className="text-sm font-semibold tracking-wide text-cyan-400 flex items-center gap-2 mb-4">
          <Icons.Plus className="w-4 h-4 text-cyan-400" />
          TAMBAH TAUTAN BARU
        </h3>

        <form onSubmit={handleSaveLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Judul Tautan *</label>
              <input
                type="text"
                placeholder="Contoh: 🟢 Beli Klepon via Tokopedia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">URL / Link Lengkap *</label>
              <input
                type="text"
                placeholder="tokopedia.com/toko-klepon"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategori / Grup (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Bisnis, Portofolio, Sosial"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            {/* Visual Type Selector for Icon/Image */}
            <div className="space-y-1">
              <label className="block text-xs text-slate-400 mb-1 font-semibold flex items-center justify-between">
                <span>Visual Tautan (Ikon / Gambar)</span>
                <span className="text-[10px] text-cyan-400 font-bold">Galeri / Google Foto ready</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#121c2e] p-1 rounded-lg border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => {
                    setImageType('icon');
                  }}
                  className={`py-1 px-1 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'icon' 
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icons.Globe className="w-3 h-3" />
                  <span>Ikon</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setImageType('upload');
                    setUploadSource('gallery');
                  }}
                  className={`py-1 px-1 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'upload' && uploadSource === 'gallery'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icons.Image className="w-3 h-3" />
                  <span>Galeri</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageType('upload');
                    setUploadSource('google_photos');
                  }}
                  className={`py-1 px-1 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    imageType === 'upload' && uploadSource === 'google_photos'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icons.Sparkles className="w-3 h-3" />
                  <span>Google Foto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subfields depending on Selection */}
          <div className="bg-[#121a2e]/60 border border-slate-800/80 p-3.5 rounded-lg">
            {imageType === 'icon' && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pilih Preset Ikon Lucide</label>
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-[#1a2944] border border-slate-700 rounded-lg text-cyan-400 shrink-0">
                    {renderIcon(icon)}
                  </div>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="flex-1 bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Globe">Tautan Umum (Globe)</option>
                    <option value="MessageSquare">WhatsApp (MessageSquare)</option>
                    <option value="Instagram">Instagram</option>
                    <option value="MessageCircle">Discord / Telegram (MessageCircle)</option>
                    <option value="Youtube">Youtube</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="ShoppingBag">E-Commerce (ShoppingBag)</option>
                    <option value="Gamepad2">Game (Gamepad2)</option>
                    <option value="Flame">Hot / Promosi (Flame)</option>
                    <option value="Star">Bintang (Star)</option>
                    <option value="Heart">Favorit (Heart)</option>
                    <option value="Award">Medali (Award)</option>
                    <option value="User">Profil (User)</option>
                  </select>
                </div>
              </div>
            )}

            {imageType === 'upload' && uploadSource === 'gallery' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unggah Gambar dari Galeri</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {imageValue ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-cyan-500/50 bg-[#162235] shrink-0">
                      <img src={imageValue} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageValue('')}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                      <Icons.Upload className="w-4 h-4 animate-pulse" />
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 file:cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-500 mt-1">Saran: Gunakan rasio 1:1 (kotak) untuk tampilan terbaik.</p>
                  </div>
                </div>
              </div>
            )}

            {imageType === 'upload' && uploadSource === 'google_photos' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tautan Gambar Google Foto / Web</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {imageValue ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-cyan-500/50 bg-[#162235] shrink-0">
                      <img 
                        src={imageValue} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={() => {
                          alert('Gagal memuat URL gambar. Pastikan link langsung atau berformat gambar.');
                          setImageValue('');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImageValue('')}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                      <Icons.Link2 className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-1">
                    <input
                      type="url"
                      placeholder="https://photos.google.com/... atau web link"
                      value={imageValue}
                      onChange={(e) => setImageValue(e.target.value)}
                      className="w-full bg-[#162235] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Cara Google Foto: Di Google Foto web, buka foto, klik kanan dan pilih <strong>Salin Alamat Gambar</strong> (Copy Image Link).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pintasan WhatsApp Generator */}
          <div className="bg-[#121a2e] border border-[#1e2e4b] rounded-lg p-3 text-xs space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Icons.MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pintasan WhatsApp Generator</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-full ml-auto">Auto bikin link WA</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="No WA (misal: 08123456789)"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="w-full bg-[#1c2942] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Pesan otomatis (misal: Halo saya mau beli klepon)"
                  value={waText}
                  onChange={(e) => setWaText(e.target.value)}
                  className="w-full bg-[#1c2942] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateWa}
              disabled={!waNumber}
              className="w-full bg-[#1e2e4b] hover:bg-[#25395c] disabled:opacity-40 text-slate-300 font-medium py-1.5 px-3 rounded text-[11px] transition-colors border border-[#2b3f62] cursor-pointer"
            >
              Generate & Masukkan ke Form Diatas
            </button>
          </div>

          {/* Toggle Penjadwalan */}
          <div className="space-y-3 bg-[#121c2e]/40 p-3 rounded-lg border border-[#1e2e4b] text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.CalendarDays className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-300">Jadwalkan Publikasi Tautan (Mulai / Selesai)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isScheduled} 
                  onChange={(e) => setIsScheduled(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            
            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tanggal & Waktu Mulai Tampil</label>
                  <input
                    type="datetime-local"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    className="w-full bg-[#162235] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 animate-fadeIn"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tanggal & Waktu Selesai Tampil</label>
                  <input
                    type="datetime-local"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    className="w-full bg-[#162235] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 animate-fadeIn"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm shadow-lg shadow-amber-500/20"
          >
            + Simpan & Tampilkan Tautan
          </button>
        </form>
      </div>

      {/* Kelola & Urutkan Tautan */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex justify-between items-center sm:justify-start gap-3">
            <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
              <Icons.SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              KELOLA & URUTKAN TAUTAN
            </h3>
            <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {links.length} total
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mode Edit Masal Button */}
            <button
              onClick={() => {
                setIsBulkEditMode(!isBulkEditMode);
                setSelectedLinkIds([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isBulkEditMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-slate-800 text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Icons.CheckSquare className="w-3.5 h-3.5" />
              <span>{isBulkEditMode ? "Keluar Edit Masal" : "Mode Edit Masal"}</span>
            </button>

            {/* Real-time search bar input */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Icons.Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Cari judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#162235] border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {(() => {
          const filteredLinks = links.filter(link => 
            link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            link.url.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (links.length === 0) {
            return (
              <div className="text-center py-8 text-slate-500 text-sm">
                Belum ada tautan. Silakan tambahkan tautan di atas untuk memulai.
              </div>
            );
          }

          if (filteredLinks.length === 0) {
            return (
              <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
                <Icons.SearchCode className="w-8 h-8 text-slate-600 animate-pulse" />
                <span>Tidak ada tautan yang cocok dengan pencarian "{searchTerm}"</span>
              </div>
            );
          }

          // Variants for staggered layout animations
          const listContainerVariants = {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06
              }
            }
          };

          const listItemVariants = {
            hidden: { opacity: 0, y: 15 },
            show: { 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 140,
                damping: 16
              }
            }
          };

          return (
            <>
              {isBulkEditMode && filteredLinks.length > 0 && (
                <div className="bg-[#151f38] border border-cyan-500/25 rounded-lg p-3.5 mb-4 space-y-3 animate-fadeIn text-xs text-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === filteredLinks.length) {
                            setSelectedLinkIds([]);
                          } else {
                            setSelectedLinkIds(filteredLinks.map(l => l.id));
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {selectedLinkIds.length === filteredLinks.length ? (
                          <>
                            <Icons.XSquare className="w-4 h-4" />
                            <span>Batal Pilih Semua</span>
                          </>
                        ) : (
                          <>
                            <Icons.CheckSquare className="w-4 h-4" />
                            <span>Pilih Semua ({filteredLinks.length})</span>
                          </>
                        )}
                      </button>
                      <span className="text-slate-500">|</span>
                      <span className="font-semibold text-slate-200">
                        {selectedLinkIds.length} Tautan Terpilih
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Toggle Visibility Actions */}
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === 0) return;
                          onChange(links.map(l => selectedLinkIds.includes(l.id) ? { ...l, isVisible: true } : l));
                          alert(`Berhasil menampilkan ${selectedLinkIds.length} tautan.`);
                        }}
                        disabled={selectedLinkIds.length === 0}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Tampilkan semua yang dipilih"
                      >
                        <Icons.Eye className="w-3.5 h-3.5" />
                        <span>Tampilkan</span>
                      </button>
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === 0) return;
                          onChange(links.map(l => selectedLinkIds.includes(l.id) ? { ...l, isVisible: false } : l));
                          alert(`Berhasil menyembunyikan ${selectedLinkIds.length} tautan.`);
                        }}
                        disabled={selectedLinkIds.length === 0}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Sembunyikan semua yang dipilih"
                      >
                        <Icons.EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </button>

                      {/* Sorting / Batch Reordering */}
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === 0) return;
                          const selected = links.filter(l => selectedLinkIds.includes(l.id));
                          const remaining = links.filter(l => !selectedLinkIds.includes(l.id));
                          onChange([...selected, ...remaining]);
                          alert("Berhasil memindahkan tautan terpilih ke bagian TERATAS daftar.");
                        }}
                        disabled={selectedLinkIds.length === 0}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Pindahkan semua tautan terpilih ke barisan teratas"
                      >
                        <Icons.ArrowUpToLine className="w-3.5 h-3.5" />
                        <span>Ke Atas</span>
                      </button>
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === 0) return;
                          const selected = links.filter(l => selectedLinkIds.includes(l.id));
                          const remaining = links.filter(l => !selectedLinkIds.includes(l.id));
                          onChange([...remaining, ...selected]);
                          alert("Berhasil memindahkan tautan terpilih ke bagian TERBAWAH daftar.");
                        }}
                        disabled={selectedLinkIds.length === 0}
                        className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Pindahkan semua tautan terpilih ke barisan terbawah"
                      >
                        <Icons.ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Ke Bawah</span>
                      </button>

                      {/* Bulk Delete */}
                      <button
                        onClick={() => {
                          if (selectedLinkIds.length === 0) return;
                          const yes = window.confirm(`Apakah Anda yakin ingin menghapus ${selectedLinkIds.length} tautan secara permanen?`);
                          if (yes) {
                            onChange(links.filter(l => !selectedLinkIds.includes(l.id)));
                            setSelectedLinkIds([]);
                            alert("Tautan terpilih berhasil dihapus.");
                          }
                        }}
                        disabled={selectedLinkIds.length === 0}
                        className="px-2.5 py-1 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 rounded font-bold disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Icons.Trash className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Bulk Edit Category Input Section */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px]">Ubah Kategori Masal:</span>
                    <input
                      type="text"
                      placeholder="Kategori Baru (misal: Portofolio)"
                      value={bulkCategoryInput}
                      onChange={(e) => setBulkCategoryInput(e.target.value)}
                      className="bg-[#162235] border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => {
                        if (selectedLinkIds.length === 0 || !bulkCategoryInput.trim()) return;
                        onChange(links.map(l => selectedLinkIds.includes(l.id) ? { ...l, category: bulkCategoryInput.trim() } : l));
                        setBulkCategoryInput('');
                        alert(`Kategori berhasil diubah menjadi "${bulkCategoryInput.trim()}" untuk ${selectedLinkIds.length} tautan.`);
                      }}
                      disabled={selectedLinkIds.length === 0 || !bulkCategoryInput.trim()}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs hover:bg-amber-400 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Terapkan Kategori
                    </button>
                  </div>
                </div>
              )}

              <motion.div 
                variants={listContainerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
              {filteredLinks.map((link, index) => {
                // Find actual original index in raw links for correct sorting operations
                const originalIndex = links.findIndex(l => l.id === link.id);
                
                const schedStatus = (() => {
                  if (!link.isScheduled) return null;
                  const now = new Date();
                  if (link.scheduleStart) {
                    const start = new Date(link.scheduleStart);
                    if (now < start) return { label: 'Segera Hadir', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
                  }
                  if (link.scheduleEnd) {
                    const end = new Date(link.scheduleEnd);
                    if (now > end) return { label: 'Kedaluwarsa', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
                  }
                  return { label: 'Aktif (Berjadwal)', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
                })();

                return (
                  <motion.div
                    key={link.id}
                    variants={listItemVariants}
                    layout
                    className="bg-[#121c33] border border-slate-800 rounded-lg p-3 flex flex-col hover:border-slate-700 transition-all"
                  >
                    {/* Top Row / Main Content */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Drag / Sorting controls & Left side info */}
                      <div className="flex items-center gap-3">
                        {/* Up/Down Sorters or Checkbox for Bulk Edit */}
                        {isBulkEditMode ? (
                          <div className="p-1 pr-2 animate-fadeIn">
                            <input
                              type="checkbox"
                              checked={selectedLinkIds.includes(link.id)}
                              onChange={() => {
                                if (selectedLinkIds.includes(link.id)) {
                                  setSelectedLinkIds(selectedLinkIds.filter(id => id !== link.id));
                                } else {
                                  setSelectedLinkIds([...selectedLinkIds, link.id]);
                                }
                              }}
                              className="w-4.5 h-4.5 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveLink(originalIndex, 'up')}
                              disabled={originalIndex === 0}
                              className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                              title="Geser ke Atas"
                            >
                              <Icons.ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveLink(originalIndex, 'down')}
                              disabled={originalIndex === links.length - 1}
                              className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-20 cursor-pointer"
                              title="Geser ke Bawah"
                            >
                              <Icons.ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Custom Image or Preset Icon */}
                        <div className="w-10 h-10 shrink-0 bg-[#172442] border border-slate-700/50 rounded-lg text-cyan-400 flex items-center justify-center overflow-hidden">
                          {link.imageType === 'upload' && link.imageValue ? (
                            <img src={link.imageValue} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            renderIcon(link.icon)
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-white text-sm flex flex-wrap items-center gap-2">
                            <span>{link.title}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                              {link.category}
                            </span>
                            {schedStatus && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1 ${schedStatus.color}`}>
                                <Icons.Calendar className="w-2.5 h-2.5" />
                                {schedStatus.label}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono truncate max-w-[180px] md:max-w-xs">
                            {link.url}
                          </div>
                        </div>
                      </div>

                      {/* Right side parameters: Action icons & Animation options */}
                      <div className="flex items-center gap-3 self-end md:self-auto border-t border-slate-800 md:border-none pt-2 md:pt-0">
                        {/* Click Badge */}
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mr-2">
                          <Icons.BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{link.clickCount} Klik</span>
                        </div>

                        {/* Animation select */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500">Efek:</span>
                          <select
                            value={link.animation}
                            onChange={(e) => handleUpdateAnimation(link.id, e.target.value)}
                            className="bg-[#1c2a4a] border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="none">Tanpa Efek</option>
                            <option value="pulse">Pulse (Glow)</option>
                            <option value="bounce">Bounce (Lompat)</option>
                            <option value="shake">Wobble (Goyang)</option>
                            <option value="neon">Neon Spark (Kedip)</option>
                          </select>
                        </div>

                        {/* Inline Image Customizer Trigger Button */}
                        <button
                          onClick={() => {
                            setEditingImageLinkId(editingImageLinkId === link.id ? null : link.id);
                            setEditingScheduleLinkId(null);
                          }}
                          className={`p-1.5 rounded cursor-pointer transition-colors ${
                            editingImageLinkId === link.id ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Edit Gambar/Ikon"
                        >
                          <Icons.Image className="w-4 h-4" />
                        </button>

                        {/* Inline Schedule Customizer Trigger Button */}
                        <button
                          onClick={() => {
                            setEditingScheduleLinkId(editingScheduleLinkId === link.id ? null : link.id);
                            setEditingImageLinkId(null);
                          }}
                          className={`p-1.5 rounded cursor-pointer transition-colors ${
                            editingScheduleLinkId === link.id 
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                              : link.isScheduled
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Jadwalkan Tautan"
                        >
                          <Icons.CalendarDays className="w-4 h-4" />
                        </button>

                        {/* Hide Toggle */}
                        <button
                          onClick={() => handleToggleVisibility(link.id)}
                          className={`p-1.5 rounded cursor-pointer transition-colors ${
                            link.isVisible ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                          title={link.isVisible ? "Sembunyikan" : "Tampilkan"}
                        >
                          {link.isVisible ? <Icons.Eye className="w-4 h-4" /> : <Icons.EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:bg-rose-900/40 hover:text-rose-400 cursor-pointer transition-colors"
                          title="Hapus"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Image/Icon Customizer Panel */}
                    {editingImageLinkId === link.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs bg-[#0b1329]/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Icons.Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>Edit Visual Gambar Tautan Ini</span>
                          </span>
                          <button 
                            onClick={() => setEditingImageLinkId(null)}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Selesai
                          </button>
                        </div>

                        {/* Inline source selector */}
                        <div className="grid grid-cols-3 gap-1 bg-[#121c2e] p-1 rounded-md border border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => {
                              onChange(links.map(l => l.id === link.id ? { ...l, imageType: 'icon' } : l));
                            }}
                            className={`py-1 px-1.5 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                              link.imageType !== 'upload' 
                                ? 'bg-cyan-500 text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Preset Ikon
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setInlineUploadSource('gallery');
                              onChange(links.map(l => l.id === link.id ? { ...l, imageType: 'upload' } : l));
                            }}
                            className={`py-1 px-1.5 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                              link.imageType === 'upload' && inlineUploadSource === 'gallery'
                                ? 'bg-cyan-500 text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Galeri
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInlineUploadSource('google_photos');
                              onChange(links.map(l => l.id === link.id ? { ...l, imageType: 'upload' } : l));
                            }}
                            className={`py-1 px-1.5 text-[9px] font-bold rounded transition-all cursor-pointer text-center ${
                              link.imageType === 'upload' && inlineUploadSource === 'google_photos'
                                ? 'bg-cyan-500 text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Google Foto
                          </button>
                        </div>

                        {/* Inline sub-editor depending on source selected */}
                        {link.imageType !== 'upload' ? (
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-slate-500">Ikon Lucide:</span>
                            <select
                              value={link.icon}
                              onChange={(e) => {
                                onChange(links.map(l => l.id === link.id ? { ...l, icon: e.target.value, imageType: 'icon' } : l));
                              }}
                              className="bg-[#1c2a4a] border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 flex-1"
                            >
                              <option value="Globe">Tautan Umum (Globe)</option>
                              <option value="MessageSquare">WhatsApp (MessageSquare)</option>
                              <option value="Instagram">Instagram</option>
                              <option value="MessageCircle">Discord / Telegram (MessageCircle)</option>
                              <option value="Youtube">Youtube</option>
                              <option value="Twitter">Twitter / X</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Tiktok">Tiktok</option>
                              <option value="ShoppingBag">E-Commerce (ShoppingBag)</option>
                              <option value="Gamepad2">Game (Gamepad2)</option>
                              <option value="Flame">Hot / Promosi (Flame)</option>
                              <option value="Star">Bintang (Star)</option>
                              <option value="Heart">Favorit (Heart)</option>
                              <option value="Award">Medali (Award)</option>
                              <option value="User">Profil (User)</option>
                            </select>
                          </div>
                        ) : inlineUploadSource === 'gallery' ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400">Pilih gambar baru dari galeri:</span>
                            <div className="flex items-center gap-3">
                              {link.imageValue && (
                                <img src={link.imageValue} alt="" className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      onChange(links.map(l => l.id === link.id ? { ...l, imageValue: reader.result as string } : l));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="block w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 file:cursor-pointer"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Tempel URL Google Foto atau URL gambar web:</span>
                            <div className="flex items-center gap-2">
                              {link.imageValue && (
                                <img src={link.imageValue} alt="" className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0" referrerPolicy="no-referrer" />
                              )}
                              <input
                                type="url"
                                placeholder="https://lh3.googleusercontent.com/... atau web link"
                                value={link.imageValue || ''}
                                onChange={(e) => {
                                  onChange(links.map(l => l.id === link.id ? { ...l, imageValue: e.target.value } : l));
                                }}
                                className="w-full bg-[#162235] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline Schedule Customizer Panel */}
                    {editingScheduleLinkId === link.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs bg-[#0b1329]/50 p-3 rounded-lg animate-fadeIn text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Icons.CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Atur Jadwal Publikasi Tautan</span>
                          </span>
                          <button 
                            onClick={() => setEditingScheduleLinkId(null)}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Tutup
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-[#121c2e] p-2.5 rounded border border-slate-800/80">
                          <span className="text-slate-400 text-[11px]">Aktifkan Penjadwalan Waktu:</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={link.isScheduled || false} 
                              onChange={(e) => {
                                onChange(links.map(l => l.id === link.id ? { ...l, isScheduled: e.target.checked } : l));
                              }} 
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>

                        {link.isScheduled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Tanggal & Waktu Mulai Tampil</label>
                              <input
                                type="datetime-local"
                                value={link.scheduleStart || ''}
                                onChange={(e) => {
                                  onChange(links.map(l => l.id === link.id ? { ...l, scheduleStart: e.target.value } : l));
                                }}
                                className="w-full bg-[#162235] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Tanggal & Waktu Selesai Tampil</label>
                              <input
                                type="datetime-local"
                                value={link.scheduleEnd || ''}
                                onChange={(e) => {
                                  onChange(links.map(l => l.id === link.id ? { ...l, scheduleEnd: e.target.value } : l));
                                }}
                                className="w-full bg-[#162235] border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        );
      })()}
      </div>
    </div>
  );
}
