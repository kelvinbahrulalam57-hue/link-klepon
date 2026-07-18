/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import LKLogo from './LKLogo.tsx';

interface QRBackupTabProps {
  appUrl: string;
  onImportBackup: (jsonString: string) => boolean;
  onExportBackup: () => void;
  onTriggerPushNotification: (title: string, msg: string) => void;
}

export default function QRBackupTab({
  appUrl,
  onImportBackup,
  onExportBackup,
  onTriggerPushNotification
}: QRBackupTabProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string }>({});

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    onTriggerPushNotification("URL Disalin 🔗", "Link Klepon Anda berhasil disalin ke papan klip.");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleApplyJson = () => {
    if (!jsonInput.trim()) {
      setImportStatus({ success: false, msg: 'Kolom input JSON kosong!' });
      return;
    }

    const success = onImportBackup(jsonInput);
    if (success) {
      setImportStatus({ success: true, msg: 'Konfigurasi JSON Berhasil Diterapkan! Halaman diperbarui.' });
      setJsonInput('');
      onTriggerPushNotification("Backup Dipulihkan 🔄", "Konfigurasi Link Klepon berhasil dipulihkan dari cadangan JSON.");
    } else {
      setImportStatus({ success: false, msg: 'Gagal memformat JSON. Pastikan format teks JSON cadangan Anda valid.' });
    }
  };

  const handleDownloadQR = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&qzone=1&data=${encodeURIComponent(appUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode_link_klepon_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onTriggerPushNotification("Unduh QR Berhasil 📥", "Gambar QR Code resolusi tinggi berhasil diunduh.");
    } catch (err) {
      console.error(err);
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(appUrl)}`, '_blank');
    }
  };

  const handleDownloadBarcode = async () => {
    try {
      const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(appUrl)}&scale=3&rotate=N&includetext`;
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barcode_link_klepon_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onTriggerPushNotification("Unduh Barcode Berhasil 📥", "Gambar Barcode Code-128 berhasil diunduh.");
    } catch (err) {
      console.error(err);
      window.open(`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(appUrl)}&scale=3&rotate=N&includetext`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Code & Barcode Section */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl text-center flex flex-col items-center">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 self-start mb-1">
          <Icons.QrCode className="w-4 h-4 text-cyan-400" />
          QR CODE & BARCODE WEBSITE RESMI
        </h3>
        <p className="text-xs text-slate-500 text-left mb-6">
          Gunakan Kode QR dan Barcode dinamis di bawah ini agar pemain atau pengunjung bisa memindai dengan ponsel untuk langsung menuju ke halaman Link Klepon Anda.
        </p>

        {/* Dual Pass Design Container */}
        <div className="w-full max-w-sm bg-gradient-to-b from-[#0e172e] to-[#060b14] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6 flex flex-col items-center">
          {/* Cyber accents */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 animate-pulse" />
          <div className="absolute top-3 left-3 text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest font-black">
            Access Pass v2.0
          </div>
          <div className="absolute top-3 right-3 text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest font-black">
            LK-SECURE
          </div>

          {/* QR Code Container */}
          <div className="mt-4 bg-white p-3.5 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.15)] border border-cyan-500/20 inline-block relative group hover:scale-[1.02] transition-transform duration-300">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=090d16&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(appUrl)}`}
              alt="Link Klepon QR Code"
              className="w-40 h-40 object-contain select-none"
              referrerPolicy="no-referrer"
            />
            {/* Hover overlay indicator */}
            <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Icons.QrCode className="w-8 h-8 text-cyan-400 mb-1 animate-bounce" />
              <span className="text-[10px] font-black tracking-widest text-white uppercase font-mono">Pindai QR</span>
            </div>
          </div>

          <div className="w-full border-t border-dashed border-slate-800 my-5 relative">
            <div className="absolute -left-[31px] -top-[8px] w-4 h-4 bg-[#0b1329] border-r border-cyan-500/20 rounded-full" />
            <div className="absolute -right-[31px] -top-[8px] w-4 h-4 bg-[#0b1329] border-l border-cyan-500/20 rounded-full" />
          </div>

          {/* Linear Barcode Container */}
          <div className="w-full flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg w-full max-w-[260px] flex items-center justify-center shadow-lg group hover:scale-[1.01] transition-transform duration-200 cursor-pointer" onClick={handleDownloadBarcode} title="Klik untuk unduh Barcode">
              <img 
                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(appUrl)}&scale=2&rotate=N&includetext`}
                alt="Link Klepon Barcode"
                className="h-14 max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest mt-2">
              Sandi Batang Link Resmi
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Icons.Download className="w-4 h-4" />
            Unduh QR (PNG)
          </button>
          <button
            onClick={handleDownloadBarcode}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Icons.Download className="w-4 h-4" />
            Unduh Barcode
          </button>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#121c33] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {copiedUrl ? <Icons.Check className="w-4 h-4 text-emerald-400" /> : <Icons.Copy className="w-4 h-4 text-cyan-400" />}
            Salin URL Web
          </button>
        </div>
      </div>

      {/* Ekspor / Impor Backup JSON */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Icons.Database className="w-4 h-4 text-cyan-400" />
          EKSPOR / IMPOR BACKUP JSON
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Gunakan format file JSON portabel ini untuk mentransfer seluruh konfigurasi profil kustom, daftar tautan aktif, dan penataan tema Anda ke browser atau perangkat lain sebagai cadangan aman.
        </p>

        {/* Backup export trigger */}
        <button
          onClick={onExportBackup}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <Icons.Save className="w-4 h-4" />
          Simpan File Cadangan (.json)
        </button>

        {/* Import JSON text area */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs text-slate-400 font-medium">Impor Konfigurasi (Paste Teks JSON)</label>
          <textarea
            rows={4}
            placeholder="Paste isi teks format .json cadangan Anda di sini..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-[#162235] border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono placeholder:font-sans focus:outline-none focus:border-cyan-500 resize-none"
          />

          <button
            onClick={handleApplyJson}
            className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold py-2 px-4 rounded text-xs transition-colors cursor-pointer"
          >
            Terapkan Konfigurasi JSON
          </button>

          {importStatus.msg && (
            <div className={`p-2 rounded text-xs font-semibold mt-2 ${
              importStatus.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {importStatus.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
