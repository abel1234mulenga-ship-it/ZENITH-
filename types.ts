
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
