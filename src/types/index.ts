export type UserType = 'influencer' | 'brand';

export type DealStatus = 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'paid';

export interface User {
  id: string;
  email: string;
  user_type: UserType | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InfluencerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  location: string | null;
  city: string | null;
  niche: string[];
  instagram_handle: string | null;
  instagram_followers: number | null;
  youtube_handle: string | null;
  youtube_subscribers: number | null;
  other_links: string | null;
  content_types: string[];
  price_per_post: number | null;
  is_verified: boolean;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  requirements: string | null;
  budget: number;
  deadline: string | null;
  location: string | null;
  niche: string[];
  content_type: string[];
  status: 'open' | 'closed' | 'paused';
  application_count: number;
  created_at: string;
  updated_at: string;
  brand?: { full_name: string };
}

export interface Application {
  id: string;
  campaign_id: string;
  influencer_id: string;
  brand_id: string;
  message: string | null;
  proposed_price: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  influencer?: InfluencerProfile & { user?: User };
}

export interface Deal {
  id: string;
  campaign_id: string;
  application_id: string | null;
  influencer_id: string;
  brand_id: string;
  title: string;
  description: string;
  amount: number;
  milestones: DealMilestone[];
  status: 'active' | 'completed' | 'paid' | 'cancelled';
  completed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  influencer?: InfluencerProfile & { user?: User };
  brand?: BrandProfile & { user?: User };
}

export interface DealMilestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Conversation {
  id: string;
  type: 'campaign' | 'direct';
  participant_1: string;
  participant_2: string;
  campaign_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'application_received' | 'application_accepted' | 'application_rejected' | 'deal_created' | 'deal_completed' | 'deal_paid' | 'message_received' | 'new_campaign';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_type: UserType;
  receiver_type: UserType;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}
