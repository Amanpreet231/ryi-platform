-- RYI Platform Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  user_type TEXT CHECK (user_type IN ('influencer', 'brand')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer profiles
CREATE TABLE public.influencer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  location TEXT,
  city TEXT,
  niche TEXT[] DEFAULT '{}',
  instagram_handle TEXT,
  instagram_followers INTEGER,
  youtube_handle TEXT,
  youtube_subscribers INTEGER,
  linkedin_handle TEXT,
  twitter_handle TEXT,
  other_links JSONB DEFAULT '[]',
  content_types TEXT[] DEFAULT '{}',
  price_per_post INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand profiles
CREATE TABLE public.brand_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  description TEXT,
  logo_url TEXT,
  gstin TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns (posted by brands)
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget INTEGER NOT NULL,
  deadline TIMESTAMPTZ,
  location TEXT,
  niche TEXT[] DEFAULT '{}',
  content_type TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications (influencers applying to campaigns)
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  proposed_price INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- Deals (accepted applications)
CREATE TABLE public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paid', 'cancelled')),
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal milestones
CREATE TABLE public.deal_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (brand reaching out to influencer)
CREATE TABLE public.connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('influencer', 'brand')),
  receiver_type TEXT CHECK (receiver_type IN ('influencer', 'brand')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT DEFAULT 'direct' CHECK (type IN ('campaign', 'direct')),
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaigns_brand ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_location ON public.campaigns(location);
CREATE INDEX idx_applications_campaign ON public.applications(campaign_id);
CREATE INDEX idx_applications_influencer ON public.applications(influencer_id);
CREATE INDEX idx_deals_influencer ON public.deals(influencer_id);
CREATE INDEX idx_deals_brand ON public.deals(brand_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_connections_sender ON public.connections(sender_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Influencer profiles policies
CREATE POLICY "Influencer profiles are viewable by everyone" ON public.influencer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own influencer profile" ON public.influencer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own influencer profile" ON public.influencer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Brand profiles policies
CREATE POLICY "Brand profiles are viewable by everyone" ON public.brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own brand profile" ON public.brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profile" ON public.brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by everyone" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Brands can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'brand'
    )
  );

CREATE POLICY "Brands can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = brand_id);

-- Applications policies
CREATE POLICY "Applications viewable by involved parties" ON public.applications
  FOR SELECT USING (
    auth.uid() = influencer_id OR 
    auth.uid() = brand_id OR
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND brand_id = auth.uid())
  );

CREATE POLICY "Influencers can create applications" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() = influencer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'influencer'
    )
  );

CREATE POLICY "Brand can update applications for their campaigns" ON public.applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND brand_id = auth.uid())
  );

-- Deals policies
CREATE POLICY "Deals viewable by involved parties" ON public.deals
  FOR SELECT USING (auth.uid() = influencer_id OR auth.uid() = brand_id);

CREATE POLICY "Brands can create deals" ON public.deals
  FOR INSERT WITH CHECK (
    auth.uid() = brand_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'brand')
  );

CREATE POLICY "Involved parties can update deals" ON public.deals
  FOR UPDATE USING (auth.uid() = influencer_id OR auth.uid() = brand_id);

-- Connections policies
CREATE POLICY "Users can view their connections" ON public.connections
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connections" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their connections" ON public.connections
  FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_influencer_profiles_updated_at BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
