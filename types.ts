
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  ownerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  isFeatured?: boolean;
  isBoosted?: boolean;
  isPromoted?: boolean; // New: Internal platform promotion
  boostExpiry?: string;
  socialAdCopy?: string;
  clicks?: number;
  sales?: number;
}

export type UserTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'vendor';
  tier: UserTier;
  avatar?: string;
  businessType?: string;
  walletBalance: number;
  isSuspended?: boolean;
}

export interface PlatformStats {
  totalRevenue: number;
  adRevenue: number;
  subscriptionRevenue: number;
  activeAds: number;
  totalUsers: number;
  commissionRate: number;
}

export interface AdPlacement {
  id: string;
  type: 'banner' | 'sidebar' | 'interstitial';
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
}

export enum AIServiceMode {
  GENERAL = 'GENERAL',
  MAPS = 'MAPS',
  SEARCH = 'SEARCH',
  THINKING = 'THINKING',
  LIVE = 'LIVE'
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
