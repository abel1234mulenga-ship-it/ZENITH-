
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  ownerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contactInfo: {
    phone?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    messenger?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isFeatured: boolean;
  isPromoted: boolean;
  clicks: number;
  sales: number;
  createdAt: number;
}

export type UserRole = 'user' | 'vendor' | 'admin';
export type UserTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tier: UserTier;
  walletBalance: number;
  isSuspended: boolean;
  avatar: string;
  joinedAt: number;
  businessType?: string;
  rating?: number;
  totalDeals?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'listing_fee' | 'promotion' | 'commission' | 'payout';
  timestamp: number;
  status: 'completed' | 'pending';
}

export interface SocialChannel {
  id: string;
  name: string;
  platform: string;
  url: string;
  status: 'active' | 'inactive';
  reach: string;
}

export interface ZambianProvince {
  name: string;
  capital: string;
  districts: string[];
  population: string;
  majorIndustries: string[];
}

export interface City {
  name: string;
  lat: number;
  lng: number;
}

export const ZAMBIAN_CITIES: City[] = [
  { name: 'Lusaka', lat: -15.4167, lng: 28.2833 },
  { name: 'Ndola', lat: -12.9667, lng: 28.6333 },
  { name: 'Kitwe', lat: -12.8167, lng: 28.2 },
  { name: 'Livingstone', lat: -17.85, lng: 25.85 },
  { name: 'Chipata', lat: -13.6333, lng: 32.65 },
  { name: 'Kabwe', lat: -14.4333, lng: 28.45 },
  { name: 'Solwezi', lat: -12.1833, lng: 26.4 },
  { name: 'Kasama', lat: -10.2128, lng: 31.1808 },
  { name: 'Mansa', lat: -11.1997, lng: 28.8943 },
  { name: 'Mongu', lat: -15.2484, lng: 23.1274 },
];

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  time: string;
}

export interface AppConfig {
  listingFee: number;
  promotionFee: number;
  featuredFee: number;
  commissionRate: number;
  isRegistrationOpen: boolean;
  isAiEnabled: boolean;
  adminPasswordHash: string;
  ownerName?: string;
  ownerTitle?: string;
  ownerMobileNumber?: string;
  ownerMobileOperator?: 'MTN' | 'Airtel' | 'Zamtel';
  savedSocialChannels?: SocialChannel[];
}

export interface PlatformStats {
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
  dailyTransactions: number;
}

export enum AIServiceMode {
  GENERAL = 'GENERAL',
  SEARCH = 'SEARCH',
  THINKING = 'THINKING'
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type AppView = 'hub' | 'marketplace' | 'services' | 'dashboard' | 'logistics' | 'admin' | 'navigator';
