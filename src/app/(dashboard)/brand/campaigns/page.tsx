'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Plus, Briefcase, Users, Trash2, ToggleLeft, ToggleRight, ArrowRight, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Campaign } from '@/types';

const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.05 } }) };

const statusStyles: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border border-green-500/20',
  closed: 'bg-zinc-800 text-zinc-500',
  paused: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
};

export default function BrandCampaignsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const fetchCampaigns = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('campaigns').select('*').eq('brand_id', user.id).order('created_at', { ascending: false });
    setCampaigns(data || []);
    setIsLoading(false);
  }, []);

  React.useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from('campaigns').delete().eq('id', id);
    setConfirmDeleteId(null);
    setDeletingId(null);
    await fetchCampaigns();
  };

  const handleToggle = async (campaign: Campaign) => {
    setTogglingId(campaign.id);
    await supabase.from('campaigns').update({ status: campaign.status === 'open' ? 'closed' : 'open' }).eq('id', campaign.id);
    setTogglingId(null);
    await fetchCampaigns();
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">My Campaigns</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {campaigns.length === 0 ? 'No campaigns yet' : `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} · ${campaigns.filter(c => c.status === 'open').length} open`}
          </p>
        </div>
        <button onClick={() => router.push('/brand/campaigns/new')}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm shrink-0">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Post Campaign</span>
        </button>
      </motion.div>

      {campaigns.length === 0 ? (
        /* Empty state */
        <motion.div variants={fade} initial="hidden" animate="visible" custom={1}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-10 text-center">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Post your first campaign</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Describe what you need and get applications from matched creators within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-zinc-500 mb-7">
            {['Takes 2 minutes', 'Free to post', 'Reach 10K+ creators'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><span className="text-green-400">✓</span>{t}</span>
            ))}
          </div>
          <button onClick={() => router.push('/brand/campaigns/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm">
            <Plus className="h-4 w-4" /> Create First Campaign
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign, i) => (
            <motion.div key={campaign.id} variants={fade} initial="hidden" animate="visible" custom={i + 1}
              className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{campaign.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[campaign.status] || statusStyles.closed}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">{campaign.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-zinc-500">
                    <span className="font-semibold text-white">₹{campaign.budget.toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{campaign.application_count} applied</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(campaign.created_at)}</span>
                    {campaign.niche?.length > 0 && (
                      <span className="text-zinc-600">{campaign.niche.slice(0, 2).join(', ')}{campaign.niche.length > 2 ? ` +${campaign.niche.length - 2}` : ''}</span>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Applications */}
                  <Link href={`/brand/applications?campaign=${campaign.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-colors">
                    <Users className="h-3.5 w-3.5" />
                    {campaign.application_count > 0 && <span className="bg-white text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">{campaign.application_count}</span>}
                    Applications
                  </Link>

                  {/* Toggle open/close */}
                  <button onClick={() => handleToggle(campaign)} disabled={togglingId === campaign.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-colors disabled:opacity-40">
                    {campaign.status === 'open'
                      ? <ToggleRight className="h-3.5 w-3.5 text-green-400" />
                      : <ToggleLeft className="h-3.5 w-3.5" />}
                    {campaign.status === 'open' ? 'Close' : 'Open'}
                  </button>

                  {/* Delete */}
                  {confirmDeleteId === campaign.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-500">Delete?</span>
                      <button onClick={() => handleDelete(campaign.id)} disabled={deletingId === campaign.id}
                        className="px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors disabled:opacity-40">
                        {deletingId === campaign.id ? '...' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(campaign.id)}
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/40 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
