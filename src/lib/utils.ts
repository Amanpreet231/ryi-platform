import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Bhopal', 'Patna', 'Ranchi', 'Chandigarh', 'Goa',
  'Kochi', 'Coimbatore', 'Surat', 'Vadodara', 'Ludhiana',
  'Agra', 'Meerut', 'Nashik', 'Varanasi', 'Mysore', 'Jammu'
];

export const CONTENT_NICHES = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Technology',
  'Gaming', 'Lifestyle', 'Business', 'Finance', 'Education', 'Health',
  'Parenting', 'Home Decor', 'Sports', 'Comedy', 'Dance', 'Music',
  'Photography', 'Art', 'DIY', 'Pets', 'Books', 'Movies'
];

export const CONTENT_TYPES = [
  'Instagram Reels', 'Instagram Stories', 'Instagram Posts',
  'YouTube Videos', 'YouTube Shorts', 'TikTok',
  'Twitter/X Posts', 'Facebook Posts', 'Blog Posts', 'Other'
];

export const INDUSTRIES = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverages',
  'Health & Fitness',
  'Technology',
  'Travel & Tourism',
  'Home & Living',
  'Sports & Gaming',
  'Education',
  'Finance',
  'Entertainment',
  'Automotive',
  'Retail',
  'Other',
];

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];
