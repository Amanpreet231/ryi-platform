'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, CheckCircle, Copy, Check, ArrowRight,
  ExternalLink, Share2
} from 'lucide-react';

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function fmtN(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

function ShareButton({ name }: { name: string }) {
  const [shared, setShared] = React.useState(false);
  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} on RYI`, text: `Check out ${name}'s creator profile on RYI`, url });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };
  return (
    <button
      onClick={share}
      className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors"
    >
      {shared ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
      {shared ? 'Copied!' : 'Share'}
    </button>
  );
}

export function CreatorProfileClient({ influencer }: { influencer: any }) {
  const profile = influencer.profiles || {};
  const name = profile.full_name || 'Creator';
  const avatar = profile.avatar_url;
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  const stats = [
    influencer.instagram_followers && {
      icon: <IgIcon className="h-4 w-4 text-pink-400" />,
      value: fmtN(influencer.instagram_followers),
      label: 'Instagram',
    },
    influencer.youtube_subscribers && {
      icon: <YtIcon className="h-4 w-4 text-red-400" />,
      value: fmtN(influencer.youtube_subscribers),
      label: 'YouTube',
    },
    influencer.price_per_post && {
      icon: <span className="text-green-400 font-bold text-sm">₹</span>,
      value: `${(influencer.price_per_post / 1000).toFixed(0)}K`,
      label: 'Per Post',
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center">
              <span className="text-xs font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">ReachYourInfluencer</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/signup/brand" className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-xl hover:bg-zinc-100 transition-colors">
              Post a Campaign
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden"
        >
          {/* Header band */}
          <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 relative">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          </div>

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="h-20 w-20 rounded-2xl border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-300 overflow-hidden shrink-0">
                {avatar
                  ? <img src={avatar} alt={name} className="h-full w-full object-cover" />
                  : initials}
              </div>
              {/* Share + copy buttons */}
              <div className="flex gap-2 mb-1">
                <CopyButton url={typeof window !== 'undefined' ? window.location.href : ''} />
                <ShareButton name={name} />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              {influencer.is_verified && (
                <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
              )}
            </div>

            {influencer.city && (
              <p className="flex items-center gap-1.5 text-sm text-zinc-500 mb-4">
                <MapPin className="h-3.5 w-3.5" />
                {influencer.city}
              </p>
            )}

            {/* Bio */}
            {influencer.bio && (
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">{influencer.bio}</p>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {stats.map((stat: any, i) => (
                  <div key={i} className="bg-zinc-800/60 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <p className="text-base font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Niches */}
            {influencer.niche?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Niches</p>
                <div className="flex flex-wrap gap-2">
                  {influencer.niche.map((n: string) => (
                    <span key={n} className="text-xs px-3 py-1.5 rounded-full border border-zinc-700/80 text-zinc-300 font-medium">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content types */}
            {influencer.content_types?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Content Types</p>
                <div className="flex flex-wrap gap-2">
                  {influencer.content_types.map((t: string) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social handles */}
            {(influencer.instagram_handle || influencer.youtube_handle) && (
              <div className="flex gap-2 flex-wrap mb-5">
                {influencer.instagram_handle && (
                  <a
                    href={`https://instagram.com/${influencer.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg hover:text-white transition-colors"
                  >
                    <IgIcon className="h-3.5 w-3.5 text-pink-400" />
                    {influencer.instagram_handle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {influencer.youtube_handle && (
                  <a
                    href={`https://youtube.com/@${influencer.youtube_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg hover:text-white transition-colors"
                  >
                    <YtIcon className="h-3.5 w-3.5 text-red-400" />
                    {influencer.youtube_handle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="pt-5 border-t border-zinc-800 space-y-3">
              <Link
                href={`/signup/brand?collab=${influencer.user_id}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm"
              >
                Work with {name.split(' ')[0]}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-xs text-zinc-600">
                Free to post a campaign · No upfront payment
              </p>
            </div>
          </div>
        </motion.div>

        {/* Platform badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            <div className="h-5 w-5 rounded bg-white flex items-center justify-center">
              <span className="text-[8px] font-black text-black">RYI</span>
            </div>
            Powered by ReachYourInfluencer · India's micro-influencer marketplace
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
