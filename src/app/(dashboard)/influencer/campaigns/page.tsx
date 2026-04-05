'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase';
import { Search, MapPin, Calendar, Users, Briefcase, CheckCircle2, X, SlidersHorizontal } from 'lucide-react';
import { Modal, Spinner } from '@/components/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Campaign } from '@/types';

const NICHES = ['Food', 'Fashion', 'Fitness', 'Tech', 'Travel', 'Beauty', 'Lifestyle', 'Gaming'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest_budget', label: 'Highest Budget' },
  { value: 'most_applications', label: 'Most Applications' },
];

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="bg-zinc-800 animate-pulse rounded-xl h-5 w-3/4" />
          <div className="bg-zinc-800 animate-pulse rounded-xl h-4 w-1/2" />
        </div>
        <div className="bg-zinc-800 animate-pulse rounded-xl h-8 w-20" />
      </div>
      <div className="bg-zinc-800 animate-pulse rounded-xl h-4 w-full" />
      <div className="bg-zinc-800 animate-pulse rounded-xl h-4 w-2/3" />
      <div className="flex gap-2">
        <div className="bg-zinc-800 animate-pulse rounded-full h-5 w-16" />
        <div className="bg-zinc-800 animate-pulse rounded-full h-5 w-16" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div className="bg-zinc-800 animate-pulse rounded-xl h-4 w-24" />
        <div className="bg-zinc-800 animate-pulse rounded-xl h-8 w-28" />
      </div>
    </div>
  );
}

export default function InfluencerCampaignsPage() {
  const supabase = createClient();

  const [campaigns, setCampaigns] = React.useState<(Campaign & { brand?: { full_name: string } })[]>([]);
  const [appliedIds, setAppliedIds] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState(true);

  // Filter state
  const [search, setSearch] = React.useState('');
  const [selectedNiches, setSelectedNiches] = React.useState<string[]>([]);
  const [city, setCity] = React.useState('');
  const [minBudget, setMinBudget] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest');
  const [showFilters, setShowFilters] = React.useState(false);

  // Apply modal state
  const [selectedCampaign, setSelectedCampaign] = React.useState<(Campaign & { brand?: { full_name: string } }) | null>(null);
  const [proposedPrice, setProposedPrice] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const [{ data: campaignsData }, { data: applicationsData }] = await Promise.all([
      supabase
        .from('campaigns')
        .select('*, brand:users!brand_id(full_name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('campaign_id')
        .eq('influencer_id', user.id),
    ]);

    setCampaigns(campaignsData || []);
    setAppliedIds(new Set((applicationsData || []).map((a: { campaign_id: string }) => a.campaign_id)));
    setIsLoading(false);
  };

  const filteredCampaigns = React.useMemo(() => {
    let result = [...campaigns];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (selectedNiches.length > 0) {
      result = result.filter((c) =>
        selectedNiches.some((n) => c.niche?.includes(n))
      );
    }

    if (city) {
      result = result.filter((c) => c.location === city);
    }

    if (minBudget && !isNaN(Number(minBudget))) {
      result = result.filter((c) => c.budget >= Number(minBudget));
    }

    if (sortBy === 'highest_budget') {
      result.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === 'most_applications') {
      result.sort((a, b) => b.application_count - a.application_count);
    }
    // 'newest' is already the default order from supabase

    return result;
  }, [campaigns, search, selectedNiches, city, minBudget, sortBy]);

  const hasActiveFilters = search || selectedNiches.length > 0 || city || minBudget || sortBy !== 'newest';

  const clearFilters = () => {
    setSearch('');
    setSelectedNiches([]);
    setCity('');
    setMinBudget('');
    setSortBy('newest');
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const openModal = (campaign: Campaign & { brand?: { full_name: string } }) => {
    setSelectedCampaign(campaign);
    setProposedPrice(String(campaign.budget));
    setMessage('');
    setSubmitSuccess(false);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setSubmitSuccess(false);
    setProposedPrice('');
    setMessage('');
  };

  const handleApply = async () => {
    if (!selectedCampaign || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('applications').insert({
        campaign_id: selectedCampaign.id,
        influencer_id: user.id,
        brand_id: selectedCampaign.brand_id,
        message: message.trim() || null,
        proposed_price: proposedPrice ? Number(proposedPrice) : null,
        status: 'pending',
      });

      if (error) throw error;

      await Promise.all([
        supabase
          .from('campaigns')
          .update({ application_count: selectedCampaign.application_count + 1 })
          .eq('id', selectedCampaign.id),
        supabase.from('notifications').insert({
          user_id: selectedCampaign.brand_id,
          type: 'application_received',
          title: 'New Application',
          message: `Someone applied to ${selectedCampaign.title}`,
          link: '/brand/applications',
        }),
      ]);

      setAppliedIds((prev) => new Set([...prev, selectedCampaign.id]));
      setSubmitSuccess(true);

      // Refresh campaign data in background
      fetchData();
    } catch (err) {
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-white">Find Brand Deals</h1>
        <p className="text-zinc-400 mt-1">
          Browse open campaigns and apply to the ones that match your niche
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-4 space-y-4"
      >
        {/* Top row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:border-zinc-600 focus:outline-none pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 text-white rounded-xl focus:border-zinc-600 focus:outline-none px-3 py-2 text-sm min-w-[170px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              showFilters || (selectedNiches.length > 0 || city || minBudget)
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {(selectedNiches.length > 0 || city || minBudget) && (
              <span className="bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {[selectedNiches.length > 0 ? 1 : 0, city ? 1 : 0, minBudget ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                {/* Niche multi-select */}
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Niches</p>
                  <div className="flex flex-wrap gap-2">
                    {NICHES.map((niche) => (
                      <button
                        key={niche}
                        onClick={() => toggleNiche(niche)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                          selectedNiches.includes(niche)
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* City */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">City</p>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl focus:border-zinc-600 focus:outline-none px-3 py-2 text-sm"
                    >
                      <option value="">All Cities</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Min budget */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Min Budget (₹)</p>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:border-zinc-600 focus:outline-none px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count */}
      {!isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm text-zinc-500"
        >
          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} available
        </motion.p>
      )}

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {filteredCampaigns.map((campaign, i) => {
            const applied = appliedIds.has(campaign.id);

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl hover:border-zinc-700/60 transition-all duration-200 flex flex-col"
              >
                <div className="p-5 flex flex-col flex-1">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white truncate">{campaign.title}</h3>
                        {applied ? (
                          <span className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded-full shrink-0">
                            Applied
                          </span>
                        ) : (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded-full shrink-0">
                            Open
                          </span>
                        )}
                      </div>
                      {campaign.brand?.full_name && (
                        <p className="text-sm text-zinc-400 mt-0.5 truncate">{campaign.brand.full_name}</p>
                      )}
                    </div>

                    {/* Budget */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-white">
                        ₹{campaign.budget.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-zinc-500">budget</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm text-zinc-400 line-clamp-2 flex-1">
                    {campaign.description}
                  </p>

                  {/* Niche tags */}
                  {campaign.niche && campaign.niche.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {campaign.niche.slice(0, 3).map((n) => (
                        <span
                          key={n}
                          className="bg-zinc-800/70 text-zinc-400 text-xs px-2 py-0.5 rounded-full border border-zinc-700/50"
                        >
                          {n}
                        </span>
                      ))}
                      {campaign.niche.length > 3 && (
                        <span className="bg-zinc-800/70 text-zinc-500 text-xs px-2 py-0.5 rounded-full border border-zinc-700/50">
                          +{campaign.niche.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-500">
                    {campaign.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {campaign.location}
                      </span>
                    )}
                    {campaign.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(campaign.deadline)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.application_count} applied
                    </span>
                    <span className="text-zinc-600 ml-auto">
                      {formatRelativeTime(campaign.created_at)}
                    </span>
                  </div>

                  {/* Divider + CTA */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/80">
                    <button
                      onClick={() => openModal(campaign)}
                      className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        applied
                          ? 'bg-zinc-800 text-zinc-500 cursor-default'
                          : 'bg-white text-black hover:bg-zinc-100'
                      }`}
                      disabled={applied}
                    >
                      {applied ? 'Already Applied' : 'View & Apply'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : campaigns.length === 0 ? (
        /* Zero campaigns in DB — founding creator empty state */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl py-16 px-8 text-center max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <Briefcase className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Be a Founding Creator</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Brands are being onboarded right now. The first 100 creators on RYI get a free <span className="text-white font-medium">verified badge</span> and priority visibility — making you the first brands see when they post campaigns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/80 rounded-xl text-zinc-300">
              <span className="text-green-400">✓</span> Profile complete
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/80 rounded-xl text-zinc-300">
              <span className="text-yellow-400">⏳</span> First campaigns arriving soon
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/80 rounded-xl text-zinc-300">
              <span className="text-blue-400">🔔</span> You&apos;ll be notified
            </div>
          </div>
        </motion.div>
      ) : (
        /* Campaigns exist but filters return nothing */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl py-16 text-center">
          <Briefcase className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No campaigns match your filters</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
            Try adjusting or clearing your filters to discover more opportunities.
          </p>
          <button onClick={clearFilters}
            className="bg-white text-black font-semibold hover:bg-zinc-100 rounded-xl px-4 py-2 text-sm transition-all duration-200">
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={closeModal}
        title={submitSuccess ? '' : selectedCampaign?.title ?? ''}
        description={submitSuccess ? '' : 'Campaign Details'}
        className="max-w-2xl"
      >
        {selectedCampaign && (
          <>
            {submitSuccess ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center py-6 gap-4"
              >
                <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
                  <p className="text-zinc-400 mt-1 text-sm">
                    Your application for <span className="text-white font-medium">{selectedCampaign.title}</span> has been sent to the brand.
                  </p>
                </div>
                <p className="text-zinc-500 text-xs">The brand will review your application and get back to you.</p>
                <button
                  onClick={closeModal}
                  className="mt-2 bg-white text-black font-semibold hover:bg-zinc-100 rounded-xl px-6 py-2 text-sm transition-all duration-200"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              /* Campaign details + apply form */
              <div className="space-y-5">
                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-0.5">Budget</p>
                    <p className="font-bold text-white text-lg">
                      ₹{selectedCampaign.budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-0.5">Applied</p>
                    <p className="font-bold text-white text-lg">{selectedCampaign.application_count}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-0.5">Location</p>
                    <p className="font-bold text-white text-sm truncate">{selectedCampaign.location || '—'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedCampaign.description}</p>
                </div>

                {/* Requirements */}
                {selectedCampaign.requirements && (
                  <div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1.5">Requirements</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedCampaign.requirements}</p>
                  </div>
                )}

                {/* Niche + Content type tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedCampaign.niche?.map((n) => (
                    <span key={n} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded-full">
                      {n}
                    </span>
                  ))}
                  {selectedCampaign.content_type?.map((t) => (
                    <span key={t} className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {selectedCampaign.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {formatDate(selectedCampaign.deadline)}
                    </span>
                  )}
                  {selectedCampaign.brand?.full_name && (
                    <span>Brand: <span className="text-zinc-400">{selectedCampaign.brand.full_name}</span></span>
                  )}
                </div>

                <div className="border-t border-zinc-800 pt-5 space-y-4">
                  <p className="text-sm font-semibold text-white">Your Application</p>

                  {/* Already applied check */}
                  {appliedIds.has(selectedCampaign.id) ? (
                    <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                      <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-zinc-300 font-medium">You have already applied to this campaign.</p>
                    </div>
                  ) : (
                    <>
                      {/* Proposed price */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300">
                          Your Proposed Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder={String(selectedCampaign.budget)}
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:border-zinc-600 focus:outline-none px-3 py-2 text-sm"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300">
                          Why are you a good fit?
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Introduce yourself and explain why you're the perfect creator for this campaign..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:border-zinc-600 focus:outline-none px-3 py-2 text-sm resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleApply}
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-semibold hover:bg-zinc-100 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
