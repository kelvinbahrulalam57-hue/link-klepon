/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SocialMediaLink {
  id: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'custom';
  url: string;
  iconType: 'default' | 'upload';
  iconValue: string;
}

export interface ProfileData {
  name: string;
  bio: string;
  location: string;
  email: string;
  avatarType: 'emoji' | 'initial' | 'link' | 'upload';
  avatarValue: string;
  useAvatarInEntrance?: boolean;
  socials?: SocialMediaLink[];
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  font: string;
  buttonStyle: string;
  pattern: string;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  blur: number;
  opacity: number;
  sizing: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  icon: string;
  isVisible: boolean;
  clickCount: number;
  animation: string;
  imageType?: 'icon' | 'upload';
  imageValue?: string;
  isScheduled?: boolean;
  scheduleStart?: string; // ISO datetime string or YYYY-MM-DDTHH:mm
  scheduleEnd?: string;   // ISO datetime string or YYYY-MM-DDTHH:mm
}

export interface AnalyticsRecord {
  date: string;
  clicks: number;
  views: number;
}

export interface AppState {
  profile: ProfileData;
  theme: ThemeConfig;
  links: LinkItem[];
  analytics: AnalyticsRecord[];
  isTwoFactorEnabled: boolean;
  isEndToEndEncrypted: boolean;
  customLogoActive: boolean;
  adminPasswordHash: string;
  customDomain?: string;
  isStealthModeActive?: boolean;
  stealthAllowedLocation?: string;
  stealthElementsToHide?: string[];
}
