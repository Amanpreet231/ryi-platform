'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Search, MapPin, CheckCircle, X, Instagram, Youtube, Twitter, Send, SlidersHorizontal } from 'lucide-react';
import { INDIAN_CITIES, CONTENT_NICHES, formatCurrency } from '@/lib/utils';
import type { InfluencerProfile } from '@/types';

const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }) };

function fmtFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-4/5" />
      </div>
      <div className="flex gap-2 mt-3">
        {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 bg-zinc-800 rounded-full" />)}
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between">
        <div className="h-4 w-20 bg-zinc-800 rounded" />
        <div className="h-4 w-16 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

function ProfileModal({ influencer, onClose, onConnect }: { influencer: InfluencerProfile & { profiles?: any }; onClose: () => void; onConnect: (msg: string) => Promise<void> }) {
  const [message, setMessage] = React.useState('');
  const [connecting, setConnecting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const doConnect = async () => {
    setConnecting(true);
    await onConnect(message);
    setSent(true);
    setConnecting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-400 overflow-hidden">
              {influencer.profiles?.avatar_url
                ? <img src={influencer.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                : influencer.profiles?.full_name?.[0]?.toUpperCase() || 'I'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white">{influencer.profiles?.full_name || 'Influencer'}</h3>
                {influencer.is_verified && <CheckCircle className="h-4 w-4 text-blue-400" />}
              </div>
              {influencer.city && (
                <p className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{influencer.city}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {influencer.instagram_followers && (
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 text-center">
                <Instagram className="h-4 w-4 text-pink-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{fmtFollowers(influencer.instagram_followers)}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
            )}
            {influencer.youtube_subscribers && (
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 text-center">
                <Youtube className="h-4 w-4 text-red-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">{fmtFollowers(influencer.youtube_subscribers)}</p>
                <p className="text-xs text-zinc-500">Subscribers</p>
              </div>
            )}
            {influencer.price_per_post && (
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">Rate</p>
                <p className="text-sm font-bold text-white">₹{(influencer.price_per_post / 1000).toFixed(0)}K</p>
                <p className="text-xs text-zinc-500">per post</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {influencer.bio && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Bio</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{influencer.bio}</p>
            </div>
          )}

          {/* Niches */}
          {influencer.niche && influencer.niche.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Niches</p>
              <div className="flex flex-wrap gap-1.5">
                {influencer.niche.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 rounded-full border border-zinc-700/80 text-zinc-300">{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Content types */}
          {influencer.content_types && influencer.content_types.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Content Types</p>
              <div className="flex flex-wrap gap-1.5">
                {influencer.content_types.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Handles */}
          {(influencer.instagram_handle || influencer.youtube_handle) && (
            <div className="flex gap-2 flex-wrap">
              {influencer.instagram_handle && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg">
                  <Instagram className="h-3 w-3 text-pink-400" />{influencer.instagram_handle}
                </span>
              )}
              {influencer.youtube_handle && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-lg">
                  <Youtube className="h-3 w-3 text-red-400" />{influencer.youtube_handle}
                </span>
              )}
            </div>
          )}

          {/* Connect */}
          {!sent ? (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Send Connection Request</p>
              <textarea
                placeholder="Hi! I'd love to collaborate on our upcoming campaign..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors resize-none"
              />
              <button
                onClick={doConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm"
              >
                {connecting ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</>
                ) : (
                  <><Send className="h-4 w-4" />Send Request</>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Connection request sent! They&apos;ll be notified.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function FindInfluencersPage() {
  const supabase = createClient();
  const [influencers, setInfluencers] = React.useState<(InfluencerProfile & { profiles?: any })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<(InfluencerProfile & { profiles?: any }) | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({ search: '', city: '', niche: '', minFollowers: '', maxPrice: '' });

  React.useEffect(() => {
    supabase.from('influencer_profiles').select('*, profiles:user_id(*)').eq('is_complete', true).order('created_at', { ascending: false })
      .then(({ data }) => { setInfluencers(data || []); setIsLoading(false); });
  }, []);

  const filtered = influencers.filter((inf) => {
    const name = inf.profiles?.full_name?.toLowerCase() || '';
    if (filters.search && !name.includes(filters.search.toLowerCase())) return false;
    if (filters.city && inf.city !== filters.city) return false;
    if (filters.niche && !inf.niche?.includes(filters.niche)) return false;
    if (filters.minFollowers && (inf.instagram_followers || 0) < parseInt(filters.minFollowers)) return false;
    if (filters.maxPrice && (inf.price_per_post || 0) > parseInt(filters.maxPrice)) return false;
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleConnect = async (msg: string) => {
    if (!selected) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('connections').insert({ sender_id: user.id, receiver_id: selected.user_id, sender_type: 'brand', receiver_type: 'influencer', message: msg || null });
    if (!error || error.code === '23505') {
      await supabase.from('notifications').insert({ user_id: selected.user_id, type: 'new_connection', title: 'New Connection Request', message: 'A brand wants to connect with you', link: '/influencer/connections' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Find Creators</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {isLoading ? 'Loading...' : `${filtered.length} creator${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </motion.div>

      {/* Search + Filter bar */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={1} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-zinc-600 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <span className="bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white focus:border-zinc-600 focus:outline-none">
              <option value="">All Cities</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.niche} onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
              className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white focus:border-zinc-600 focus:outline-none">
              <option value="">All Niches</option>
              {CONTENT_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="number" placeholder="Min Followers" value={filters.minFollowers} onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
              className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none" />
            <input type="number" placeholder="Max Rate (₹)" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none" />
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters({ search: '', city: '', niche: '', minFollowers: '', maxPrice: '' })}
                className="col-span-2 md:col-span-4 text-xs text-zinc-500 hover:text-white transition-colors py-1">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inf, i) => (
            <motion.div key={inf.id} variants={fade} initial="hidden" animate="visible" custom={i % 9}
              onClick={() => setSelected(inf)}
              className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 cursor-pointer hover:border-zinc-700/80 hover:bg-zinc-900/80 transition-all group">
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400 shrink-0 overflow-hidden">
                  {inf.profiles?.avatar_url
                    ? <img src={inf.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    : inf.profiles?.full_name?.[0]?.toUpperCase() || 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white truncate text-sm">{inf.profiles?.full_name || 'Creator'}</p>
                    {inf.is_verified && <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                  </div>
                  {inf.city && (
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{inf.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {inf.bio && (
                <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{inf.bio}</p>
              )}

              {/* Niches */}
              {inf.niche && inf.niche.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {inf.niche.slice(0, 3).map((n) => (
                    <span key={n} className="text-xs px-2 py-0.5 rounded-full border border-zinc-700/80 text-zinc-400">{n}</span>
                  ))}
                  {inf.niche.length > 3 && <span className="text-xs text-zinc-600">+{inf.niche.length - 3}</span>}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60">
                <div className="flex gap-3">
                  {inf.instagram_followers && (
                    <div className="flex items-center gap-1">
                      <Instagram className="h-3.5 w-3.5 text-pink-400" />
                      <span className="text-xs font-semibold text-white">{fmtFollowers(inf.instagram_followers)}</span>
                    </div>
                  )}
                  {inf.youtube_subscribers && (
                    <div className="flex items-center gap-1">
                      <Youtube className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-semibold text-white">{fmtFollowers(inf.youtube_subscribers)}</span>
                    </div>
                  )}
                </div>
                {inf.price_per_post ? (
                  <span className="text-xs font-semibold text-white">₹{(inf.price_per_post / 1000).toFixed(0)}K/post</span>
                ) : (
                  <span className="text-xs text-zinc-600">No rate set</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={fade} initial="hidden" animate="visible" custom={0}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-16 text-center">
          <Search className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-white font-medium">No creators found</p>
          <p className="text-zinc-500 text-sm mt-1">
            {activeFilterCount > 0 ? 'Try adjusting your filters' : 'No creators have completed their profiles yet'}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={() => setFilters({ search: '', city: '', niche: '', minFollowers: '', maxPrice: '' })}
              className="mt-3 text-xs text-zinc-400 hover:text-white transition-colors underline">
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      {/* Profile modal */}
      {selected && (
        <ProfileModal
          influencer={selected}
          onClose={() => setSelected(null)}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}
