import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(amount);
}

export function validateAccount(service: 'tiktok' | 'instagram', account: string) {
  if (service === 'tiktok') {
    // Basic regex for TikTok username or link
    return account.length > 2;
  }
  if (service === 'instagram') {
    // Basic regex for Instagram username or link
    return account.length > 2;
  }
  return false;
}
