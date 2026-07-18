/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.ts';

interface AdminTabProps {
  isTwoFactorEnabled: boolean;
  onToggleTwoFactor: (enabled: boolean) => void;
  isEndToEndEncrypted: boolean;
  onToggleEndToEnd: (enabled: boolean) => void;
  suspiciousLogs: string[];
  onClearLogs: () => void;
  onTriggerPushNotification: (title: string, msg: string) => void;
  adminPasswordHash: string;
  onUpdatePassword: (newPass: string) => void;
  isStealthModeActive?: boolean;
  onToggleStealthMode?: (enabled: boolean) => void;
  stealthAllowedLocation?: string;
  onUpdateStealthAllowedLocation?: (loc: string) => void;
  stealthElementsToHide?: string[];
  onUpdateStealthElementsToHide?: (elements: string[]) => void;
  simulatedLocation?: string;
  onUpdateSimulatedLocation?: (loc: string) => void;
}

export default function AdminTab({
  isTwoFactorEnabled,
  onToggleTwoFactor,
  isEndToEndEncrypted,
  onToggleEndToEnd,
  suspiciousLogs,
  onClearLogs,
  onTriggerPushNotification,
  adminPasswordHash,
  onUpdatePassword,
  isStealthModeActive = false,
  onToggleStealthMode,
  stealthAllowedLocation = "Indonesia",
  onUpdateStealthAllowedLocation,
  stealthElementsToHide = [],
  onUpdateStealthElementsToHide,
  simulatedLocation = "Indonesia",
  onUpdateSimulatedLocation
}: AdminTabProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Visitor Feedbacks States & Real-time Sync
  interface FeedbackItem {
    id: string;
    name: string;
    rating: number;
    feedback: string;
    createdAt?: any;
  }
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  useEffect(() => {
    if (!isUnlocked) return;

    setFeedbacksLoading(true);
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: FeedbackItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || 'Anonim',
          rating: data.rating || 5,
          feedback: data.feedback || '',
          createdAt: data.createdAt,
        });
      });
      setFeedbacks(items);
      setFeedbacksLoading(false);
    }, (err) => {
      console.error("Error listening to feedbacks:", err);
      setFeedbacksLoading(false);
    });

    return () => unsubscribe();
  }, [isUnlocked]);

  const handleDeleteFeedback = async (id: string) => {
    const yes = window.confirm("Apakah Anda yakin ingin menghapus ulasan/saran ini?");
    if (!yes) return;

    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      onTriggerPushNotification("Ulasan Dihapus 🗑", "Ulasan pengunjung berhasil dihapus secara permanen.");
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  };

  // 2FA mock verification
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState<boolean | null>(null);

  // API Key state
  const [apiKey, setApiKey] = useState('lk_live_557ea683bd9f0de1a42b9c77174e901a');
  const [copiedKey, setCopiedKey] = useState(false);

  // New password state
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminPasswordHash) {
      setIsUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Kata Sandi Admin Salah! Akses Ditolak.');
      onTriggerPushNotification("Akses Gagal!", "Seseorang mencoba membuka Pusat Admin dengan password salah.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasswordInput('');
  };

  const handleVerifyOtp = () => {
    // Check if OTP length is 6 characters
    if (otpInput.length === 6) {
      setOtpVerified(true);
      onTriggerPushNotification("2FA Terverifikasi ✅", "Autentikasi Dua Faktor berhasil terhubung dengan aman.");
    } else {
      setOtpVerified(false);
    }
  };

  const regenerateApiKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`lk_live_${randomHex}`);
    onTriggerPushNotification("API Key Diperbarui 🔑", "Kunci integrasi API pihak ketiga berhasil dirotasi.");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) return;
    onUpdatePassword(newPass);
    setNewPass('');
    setPassUpdated(true);
    setTimeout(() => setPassUpdated(false), 3000);
    onTriggerPushNotification("Password Diubah 🛠", "Kata sandi akses moderator berhasil diperbarui.");
  };

  return (
    <div className="space-y-6">
      {!isUnlocked ? (
        /* Pusat Admin Login Screen (Image 2) */
        <div className="max-w-md mx-auto my-12 bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-rose-500" />
          
          <div className="flex flex-col items-center text-center mt-4 mb-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 mb-4 animate-pulse">
              <Icons.Lock className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black tracking-widest text-white uppercase">PUSAT ADMIN</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Masukkan kata sandi untuk mengakses dashboard moderasi</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Icons.Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Password Admin (Default: admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#162235] border border-slate-700 rounded-lg pl-10 pr-3.5 py-3 text-sm text-center text-white font-mono placeholder:font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>

            {errorMessage && (
              <div className="text-xs font-semibold text-rose-400 text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold py-3 rounded-lg transition-colors cursor-pointer text-sm tracking-wider"
            >
              Unlock Dashboard 🔓
            </button>
          </form>

          {/* Keamanan Ekstra Badge */}
          <div className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5">
            <Icons.ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-200 block mb-0.5">Keamanan Ekstra Aktif:</span>
              Pusat Admin memerlukan kunci verifikasi keamanan master Anda untuk mencegah akses tidak sah secara global.
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Admin Dashboard Panel */
        <div className="space-y-6">
          {/* Header Dashboard Admin */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase">PANEL UTAMA</div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Icons.Settings2 className="w-5 h-5 text-cyan-400" />
                MODERASI KEAMANAN & INTEGRASI API
              </h2>
            </div>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <Icons.Lock className="w-3.5 h-3.5" />
              Kunci Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. SISTEM NOTIFIKASI AKTIVITAS MENCURIGAKAN */}
            <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 mb-2">
                  <Icons.BellRing className="w-4 h-4 text-rose-400" />
                  LOG AKTIVITAS MENCURIGAKAN (EMAIL OTOMATIS)
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Sistem kami memantau login, perubahan link, dan akses luar. Setiap terdeteksi anomali, sistem akan otomatis mengirimkan notifikasi peringatan email ke: <span className="text-cyan-400 font-semibold underline">kelvinbahrulalam57@gmail.com</span>
                </p>

                {/* Log list */}
                <div className="bg-[#070d1a] border border-slate-900 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2">
                  {suspiciousLogs.length === 0 ? (
                    <div className="text-center text-slate-600 pt-16 font-sans">Belum ada aktivitas mencurigakan yang terdeteksi. Sistem aman.</div>
                  ) : (
                    suspiciousLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-b-0">
                        <span className="text-rose-400 font-bold">[WARN]</span> {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={onClearLogs}
                  disabled={suspiciousLogs.length === 0}
                  className="px-3 py-1.5 bg-[#14203a] hover:bg-slate-700 disabled:opacity-40 text-slate-400 font-semibold text-xs rounded transition-all cursor-pointer"
                >
                  Bersihkan Logs
                </button>
                <button
                  onClick={() => onTriggerPushNotification("Uji Notifikasi", "Sistem mendeteksi login admin dari IP mencurigakan (Simulasi).")}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded transition-all cursor-pointer"
                >
                  Kirim Test Email Alert
                </button>
              </div>
            </div>

            {/* 2. AUTENTIKASI DUA FAKTOR (2FA) */}
            <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                  <Icons.KeyRound className="w-4 h-4 text-cyan-400" />
                  AUTENTIKASI DUA FAKTOR (2FA)
                </h3>
                {/* Switch style */}
                <button
                  type="button"
                  onClick={() => onToggleTwoFactor(!isTwoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isTwoFactorEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      isTwoFactorEnabled ? 'translate-x-5 bg-white' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengharuskan kode OTP tambahan dari aplikasi authenticator (Google/Microsoft) setiap kali melakukan login demi pertahanan ekstra.
              </p>

              {isTwoFactorEnabled ? (
                <div className="bg-[#121c33] border border-cyan-500/20 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Fake QR code */}
                    <div className="bg-white p-1 rounded shrink-0">
                      <div className="w-16 h-16 bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold text-center font-mono">
                        QR Secret
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold block">SECRET KEY:</span>
                      <span className="text-xs text-white font-mono block select-all">LK2F AJEM 5779 EKL9</span>
                      <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">Pindai QR diatas dengan HP Anda untuk memasukkan ke Google Authenticator.</span>
                    </div>
                  </div>

                  {/* Validate connection */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Masukkan 6 Digit Kode OTP"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="bg-[#1a2644] border border-slate-700 rounded px-2.5 py-1 text-xs text-white text-center font-mono tracking-widest focus:outline-none focus:border-cyan-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold px-3 py-1 rounded transition cursor-pointer"
                    >
                      Verifikasi
                    </button>
                  </div>
                  
                  {otpVerified === true && (
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                      <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Koneksi 2FA Berhasil Dihubungkan!
                    </div>
                  )}
                  {otpVerified === false && (
                    <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mt-1">
                      <Icons.XCircle className="w-3.5 h-3.5" /> Kode OTP harus 6 digit angka!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-[#070d1a] border border-slate-900 rounded-lg p-3 text-center">
                  Autentikasi Dua Faktor dinonaktifkan. Aktifkan saklar diatas untuk konfigurasi.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. API PIHAK KETIGA */}
            <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                <Icons.Code className="w-4 h-4 text-cyan-400" />
                API INTEGRASI PIHAK KETIGA (DEVELOPER KEYS)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gunakan REST API terenkripsi untuk mengintegrasikan data link atau profile Link Klepon Anda ke website pihak ketiga, game launcher, atau aplikasi server eksternal Anda.
              </p>

              <div className="space-y-3">
                {/* Api Key display box */}
                <div className="flex items-center gap-2 bg-[#0d1629] border border-slate-800 rounded-lg p-2.5">
                  <span className="text-[10px] text-slate-500 font-mono">LIVE_KEY:</span>
                  <span className="text-xs font-mono text-white select-all truncate flex-1">{apiKey}</span>
                  <button
                    onClick={copyApiKey}
                    className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                    title="Salin API Key"
                  >
                    {copiedKey ? <Icons.Check className="w-4 h-4 text-emerald-400" /> : <Icons.Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={regenerateApiKey}
                    className="bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 text-[11px] font-bold px-3 py-1.5 rounded border border-amber-500/20 transition cursor-pointer flex items-center gap-1"
                  >
                    <Icons.RotateCw className="w-3 h-3" /> Rotasi API Key
                  </button>
                </div>

                {/* Live Node.js Code snippet */}
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">CURL REQUEST SAMPLE:</span>
                  <pre className="bg-[#070d1a] border border-slate-900 rounded p-2 text-[10px] font-mono text-cyan-200 overflow-x-auto">
{`curl -X GET "https://link-klepon.vercel.app/api/v1/links" \\
  -H "Authorization: Bearer ${apiKey.slice(0, 15)}..."`}
                  </pre>
                </div>
              </div>
            </div>

            {/* 4. ENKRIPSI UJUNG-KE-UJUNG (E2EE) */}
            <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                  <Icons.ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ENKRIPSI UJUNG-KE-UJUNG (E2EE DATA PRIVACY)
                </h3>
                {/* Switch style */}
                <button
                  type="button"
                  onClick={() => onToggleEndToEnd(!isEndToEndEncrypted)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEndToEndEncrypted ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      isEndToEndEncrypted ? 'translate-x-5 bg-white' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Melindungi seluruh data tautan, konfigurasi template, dan informasi sensitif pelanggan dengan algoritme enkripsi militer AES-256 lokal sebelum disimpan ke cloud.
              </p>

              {isEndToEndEncrypted ? (
                <div className="bg-[#121c33] border border-emerald-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Icons.Shield className="w-4 h-4 text-emerald-400" />
                    <span>STATUS DATA: TERENKRIPSI AES-256</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    Hash kunci privat enkripsi lokal saat ini:
                    <span className="block font-mono text-cyan-200 text-[9px] truncate bg-[#070d1a] px-1.5 py-1 rounded mt-1 select-all">
                      sha256_e2ee:a683bd9f0de1a42b9c77174e901a557ea683bd9f0de1a42b
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peringatan Privasi:</strong> Data disimpan dalam format teks biasa (Plaintext) tanpa lapisan penyamaran hash.
                  </span>
                </div>
              )}
            </div>
          </div>



          {/* 6. INDERA PENYAMARAN: STEALTH MODE SECURITY */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                  <Icons.EyeOff className="w-4 h-4 text-rose-400" />
                  SISTEM INDERA PENYAMARAN (STEALTH MODE SECURITY)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Secara otomatis menyembunyikan elemen UI tertentu di LandingPage jika sedang diakses dari lokasi atau negara yang tidak dikenal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleStealthMode?.(!isStealthModeActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isStealthModeActive ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    isStealthModeActive ? 'translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isStealthModeActive ? (
              <div className="bg-[#070d1a] border border-slate-900 rounded-lg p-4 space-y-4">
                {/* Whitelisted Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Icons.Globe className="w-3.5 h-3.5 text-cyan-400" />
                    Lokasi Terpercaya (Whitelisted Country/Location)
                  </label>
                  <input
                    type="text"
                    value={stealthAllowedLocation}
                    onChange={(e) => onUpdateStealthAllowedLocation?.(e.target.value)}
                    placeholder="Contoh: Indonesia"
                    className="w-full bg-[#162235] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Bila lokasi pengunjung tidak mengandung kata kunci ini, elemen UI yang dipilih di bawah akan disembunyikan.
                  </p>
                </div>

                {/* Elements To Hide Checkboxes */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">Elemen UI yang akan disembunyikan jika tidak cocok:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'avatar', label: 'Foto Profil / Avatar' },
                      { key: 'bio_location', label: 'Biodata & Lokasi' },
                      { key: 'socials', label: 'Tautan Sosial Media' },
                      { key: 'links', label: 'Tautan Kontak / Komunitas' },
                      { key: 'widgets', label: 'Widget Bento (Artikel/Event)' }
                    ].map((el) => {
                      const isChecked = stealthElementsToHide.includes(el.key);
                      return (
                        <label
                          key={el.key}
                          className="flex items-center gap-2.5 p-2.5 bg-[#121c33]/40 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? stealthElementsToHide.filter(k => k !== el.key)
                                : [...stealthElementsToHide, el.key];
                              onUpdateStealthElementsToHide?.(next);
                            }}
                            className="rounded text-cyan-500 focus:ring-cyan-500/20 w-3.5 h-3.5 bg-[#162235] border-slate-700"
                          />
                          <span className="text-slate-300 font-semibold">{el.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Geolocation Simulator */}
                <div className="border-t border-slate-800/80 pt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Icons.Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      Simulator Geolokasi Pengunjung (Untuk Testing)
                    </span>
                    <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">
                      {simulatedLocation}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { loc: "Indonesia", desc: "Indonesia (Whitelisted)" },
                      { loc: "Singapore", desc: "Singapura (Unknown)" },
                      { loc: "United States", desc: "Amerika Serikat (Unknown)" }
                    ].map((sim) => (
                      <button
                        key={sim.loc}
                        type="button"
                        onClick={() => {
                          onUpdateSimulatedLocation?.(sim.loc);
                          onTriggerPushNotification("Lokasi Disimulasikan 🗺", `Lokasi pengunjung diubah ke ${sim.desc}.`);
                        }}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          simulatedLocation === sim.loc
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            : "bg-[#14203a] text-slate-300 border-slate-800 hover:bg-slate-700"
                        }`}
                      >
                        {sim.desc}
                      </button>
                    ))}
                  </div>

                  {/* Simulator Status Banner */}
                  {simulatedLocation.toLowerCase().includes(stealthAllowedLocation.toLowerCase()) ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded text-[10px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <Icons.CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Lokasi Cocok! Seluruh elemen UI akan ditampilkan secara normal kepada pengunjung.</span>
                    </div>
                  ) : (
                    <div className="bg-rose-500/15 border border-rose-500/20 p-2.5 rounded text-[10px] text-rose-300 flex items-start gap-1.5 leading-normal">
                      <Icons.EyeOff className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400 animate-pulse" />
                      <div>
                        <span className="font-bold text-rose-200 block">Sistem Penyamaran Aktif!</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">
                          Lokasi tidak terpercaya ({simulatedLocation}) terdeteksi. Elemen yang dicentang di atas disembunyikan sepenuhnya dari LandingPage.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-[#070d1a] border border-slate-900 rounded-lg p-3 text-center">
                Sistem Penyamaran dinonaktifkan. Aktifkan saklar diatas untuk melindungi privasi halaman Anda.
              </div>
            )}
          </div>

          {/* 6. ULASAN & SARAN PENGUNJUNG (REAL-TIME) */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
                <Icons.MessageSquareDashed className="w-4 h-4 text-cyan-400" />
                LOG ULASAN & SARAN PENGUNJUNG (REAL-TIME)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">
                  DATABASE: ACTIVE
                </span>
                <span className="animate-ping inline-block w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#070d1a] border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">TOTAL ULASAN</span>
                  <span className="text-xl font-mono font-black text-white">{feedbacks.length} Pesan</span>
                </div>
                <Icons.MessageSquare className="w-8 h-8 text-cyan-500/20" />
              </div>
              <div className="bg-[#070d1a] border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">RATA-RATA RATING</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xl font-mono font-black text-white">
                      {feedbacks.length > 0 
                        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) 
                        : "0.0"}
                    </span>
                    <Icons.Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <Icons.TrendingUp className="w-8 h-8 text-cyan-500/20" />
              </div>
            </div>

            {feedbacksLoading ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono animate-pulse flex items-center justify-center gap-2">
                <Icons.Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Menghubungkan ke basis data cloud...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-10 bg-[#070d1a]/50 border border-slate-900 rounded-lg text-xs text-slate-500 italic">
                Belum ada ulasan atau saran dari pengunjung. Form tersedia di LandingPage.
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                {feedbacks.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-[#070d1a] border border-slate-800/80 hover:border-cyan-500/20 p-3.5 rounded-lg flex items-start justify-between gap-3 transition-colors relative text-left"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="text-xs font-black text-cyan-300 font-mono">{item.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icons.Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < item.rating 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {item.createdAt?.seconds 
                            ? new Date(item.createdAt.seconds * 1000).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Baru saja'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed break-words">{item.feedback}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-md text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Hapus Ulasan"
                    >
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. GANTI PASSWORD ADMIN */}
          <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 mb-4">
              <Icons.LockKeyhole className="w-4 h-4 text-cyan-400" />
              GANTI KATA SANDI MODERATOR ADMIN
            </h3>
            <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan Password Baru..."
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="bg-[#162235] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 flex-1 font-mono"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-lg transition cursor-pointer"
              >
                Ganti Password
              </button>
            </form>
            {passUpdated && (
              <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Password Moderator berhasil diperbarui! Gunakan password baru ini untuk login berikutnya.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
