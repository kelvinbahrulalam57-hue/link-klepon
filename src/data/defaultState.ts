/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState } from '../types.ts';

export const DEFAULT_APP_STATE: AppState = {
  profile: {
    name: "LINK KLEPON",
    bio: "Semua informasi lengkap seputar Klepon, Event Game, dan Tautan Resmi ada di sini! Tap salah satu tombol di bawah ini.",
    location: "Jawa Tengah, Tegal, Indonesia",
    email: "kleponstore2@gmail.com",
    avatarType: 'upload',
    avatarValue: 'LK',
    socials: [
      { id: 'soc_1', platform: 'instagram', url: 'https://instagram.com/link_klepon', iconType: 'default', iconValue: '' },
      { id: 'soc_2', platform: 'tiktok', url: 'https://tiktok.com/@link_klepon', iconType: 'default', iconValue: '' },
      { id: 'soc_3', platform: 'twitter', url: 'https://twitter.com/link_klepon', iconType: 'default', iconValue: '' },
      { id: 'soc_4', platform: 'linkedin', url: 'https://linkedin.com/in/link-klepon', iconType: 'default', iconValue: '' }
    ],
    favicon: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=64&auto=format&fit=crop&q=80',
    metaTitle: "Website Resmi Link Klepon - Event Game & Bio Link",
    metaDescription: "Temukan semua tautan resmi Klepon Store, Event Game seru, Sosial Media, dan kontak penting lainnya dalam satu halaman bio link yang interaktif!"
  },
  theme: {
    id: "neon_cyberpunk",
    name: "Neon Cyberpunk",
    font: "Space Grotesk",
    buttonStyle: "Cyber Glow (Neon Border)",
    pattern: "Tech Grid",
    backgroundType: 'gradient',
    backgroundValue: "linear-gradient(135deg, #090d16 0%, #111827 100%)",
    blur: 3,
    opacity: 80,
    sizing: "cover"
  },
  links: [
    {
      id: "link_1",
      title: "Hubungi WhatsApp Kami",
      url: "https://wa.me/6283874028746?text=Halo%20saya%20mau%20beli%20klepon",
      category: "Kontak",
      icon: "MessageSquare",
      isVisible: true,
      clickCount: 142,
      animation: "pulse"
    },
    {
      id: "link_2",
      title: "Ikuti Instagram @LinkKlepon",
      url: "https://instagram.com/link_klepon",
      category: "Sosial Media",
      icon: "Instagram",
      isVisible: true,
      clickCount: 89,
      animation: "none"
    },
    {
      id: "link_3",
      title: "Join Discord Server Klepon Elite",
      url: "https://discord.gg/klepon",
      category: "Komunitas",
      icon: "MessageCircle",
      isVisible: true,
      clickCount: 56,
      animation: "bounce"
    },
    {
      id: "link_4",
      title: "Website Resmi Link Klepon",
      url: "https://link-klepon.vercel.app",
      category: "Situs Utama",
      icon: "Globe",
      isVisible: true,
      clickCount: 204,
      animation: "pulse"
    }
  ],
  analytics: [
    { date: "Min", clicks: 12, views: 35 },
    { date: "Sen", clicks: 34, views: 82 },
    { date: "Sel", clicks: 25, views: 60 },
    { date: "Rab", clicks: 42, views: 98 },
    { date: "Kam", clicks: 50, views: 110 },
    { date: "Jum", clicks: 48, views: 105 },
    { date: "Sab", clicks: 65, views: 140 }
  ],
  isTwoFactorEnabled: false,
  isEndToEndEncrypted: true,
  customLogoActive: true,
  adminPasswordHash: "admin123", // Plain simple password for local validation
  customDomain: "",
  isStealthModeActive: false,
  stealthAllowedLocation: "Indonesia",
  stealthElementsToHide: []
};

export const PRESET_THEMES = [
  {
    id: "classic_minimalist",
    name: "Classic Minimalist",
    font: "Inter",
    buttonStyle: "Outline Style • Dots",
    pattern: "None",
    backgroundType: "color" as const,
    backgroundValue: "#ffffff",
    blur: 0,
    opacity: 100,
    sizing: "cover"
  },
  {
    id: "retro_neobrutalist",
    name: "Retro Neo-Brutalist",
    font: "JetBrains Mono",
    buttonStyle: "Shadow-3D Style • Grid",
    pattern: "Polka Dots",
    backgroundType: "color" as const,
    backgroundValue: "#fef08a", // bright yellow
    blur: 0,
    opacity: 100,
    sizing: "cover"
  },
  {
    id: "neon_cyberpunk",
    name: "Neon Cyberpunk",
    font: "Space Grotesk",
    buttonStyle: "Cyber Glow (Neon Border)",
    pattern: "Tech Grid",
    backgroundType: "gradient" as const,
    backgroundValue: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
    blur: 4,
    opacity: 85,
    sizing: "cover"
  },
  {
    id: "earthy_matcha",
    name: "Earthy Matcha",
    font: "Playfair Display",
    buttonStyle: "Pill Style • Waves",
    pattern: "Waves",
    backgroundType: "color" as const,
    backgroundValue: "#dcfce7", // light green matcha
    blur: 2,
    opacity: 90,
    sizing: "cover"
  },
  {
    id: "sunset_glassmorphism",
    name: "Sunset Glassmorphism",
    font: "Outfit",
    buttonStyle: "Glassmorphism Style • Frosted",
    pattern: "None",
    backgroundType: "gradient" as const,
    backgroundValue: "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
    blur: 8,
    opacity: 60,
    sizing: "cover"
  }
];

export const PRESET_THEME_COLORS = [
  { id: "espresso_latte", name: "Espresso Latte ☕", primary: "#78350f", background: "#fdf8f2" },
  { id: "classic_ivory", name: "Classic Ivory Glass 💎", primary: "#111827", background: "#f9fafb" },
  { id: "calm_sage", name: "Calm Sage & Coconut 🥥", primary: "#15803d", background: "#f0fdf4" },
  { id: "slate_blue", name: "Slate Blue Harmony 🌊", primary: "#1d4ed8", background: "#eff6ff" },
  { id: "warm_earth", name: "Warm Earth & Sand 🌴", primary: "#b45309", background: "#fffbeb" },
  { id: "lavender_dusk", name: "Lavender Dusk 🍇", primary: "#7e22ce", background: "#faf5ff" },
  { id: "monochrome", name: "Monochrome Dark Silver ♟️", primary: "#f3f4f6", background: "#111827" },
  { id: "forest_fern", name: "Forest Fern 🌲", primary: "#065f46", background: "#ecfdf5" },
  { id: "golden_clay", name: "Golden Clay 🍯", primary: "#b45309", background: "#fffbeb" }
];

export const FONT_OPTIONS = [
  "Inter",
  "Space Grotesk",
  "JetBrains Mono",
  "Playfair Display",
  "Outfit",
  "Fira Code"
];

export const BUTTON_STYLES = [
  "Outline Style • Dots",
  "Shadow-3D Style • Grid",
  "Cyber Glow (Neon Border)",
  "Pill Style • Waves",
  "Glassmorphism Style • Frosted",
  "Flat Block (Minimalist)"
];

export const PATTERN_OPTIONS = [
  "None",
  "Polka Dots",
  "Tech Grid",
  "Waves",
  "Hexagon Hive"
];
