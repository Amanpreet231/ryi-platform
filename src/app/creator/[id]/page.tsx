import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CreatorProfileClient } from './client';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('influencer_profiles')
    .select('bio, city, niche, instagram_followers, profiles:user_id(full_name, avatar_url)')
    .eq('user_id', id)
    .single();

  if (!data) return { title: 'Creator Not Found | RYI' };

  const name = (data.profiles as any)?.full_name || 'Creator';
  const avatar = (data.profiles as any)?.avatar_url;
  const niches = data.niche?.slice(0, 2).join(', ') || '';
  const desc = data.bio
    || `${name} is a micro-influencer on RYI${data.city ? ` based in ${data.city}` : ''}${niches ? `, creating ${niches} content` : ''}. Book them for your next brand campaign.`;

  return {
    title: `${name} — Creator Profile | RYI`,
    description: desc,
    openGraph: {
      title: `${name} | RYI Creator Profile`,
      description: `Book ${name} for your brand campaign on RYI — India's micro-influencer marketplace.`,
      ...(avatar ? { images: [{ url: avatar, width: 400, height: 400, alt: name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: `${name} | RYI Creator`,
      description: desc,
    },
  };
}

export default async function CreatorProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ip } = await supabase
    .from('influencer_profiles')
    .select('*, profiles:user_id(id, full_name, avatar_url)')
    .eq('user_id', id)
    .single();

  if (!ip) notFound();

  return <CreatorProfileClient influencer={ip} />;
}
