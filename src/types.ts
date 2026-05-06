export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: Date | any;
}

export interface Order {
  id?: string;
  userId: string;
  service: 'tiktok' | 'instagram';
  targetAccount: string;
  quantity: number;
  cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date | any;
}

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'order_payment';
  createdAt: Date | any;
}

export const TIKTOK_RATE = 500; // per 100 followers
export const INSTAGRAM_RATE = 300; // per 100 followers
export const MIN_ORDER = 100;
