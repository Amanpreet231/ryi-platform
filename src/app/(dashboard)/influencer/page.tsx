'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Briefcase, Handshake, TrendingUp, Eye, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Campaign, Deal } from '@/types';

const fade = { hidden: { opacity: 0, y: 10 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } }) };

const dealStatusStyles: Record<string, string> = {
  active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
};

export default function InfluencerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [stats, setStats] = React.useState({ campaigns: 0, applications: 0, deals: 0, earnings: 0 });
  const [recentCampaigns, setRecentCampaigns] = React.useState<Campaign[]>([]);
  const [activeDeals, setActiveDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [completingDeal, setCompletingDeal] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const [{ data: campaigns }, { data: applications }, { data: deals }] = await Promise.all([
        supabase.from('campaigns').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
        supabase.from('applications').select('*').eq('influencer_id', user.id),
        supabase.from('deals').select('*').eq('influencer_id', user.id),
      ]);

      const earnings = deals?.filter((d: Deal) => d.status === 'paid').reduce((s: number, d: Deal) => s + d.amount, 0) || 0;
      setStats({ campaigns: campaigns?.length || 0, applications: applications?.length || 0, deals: deals?.length || 0, earnings });
      setRecentCampaigns(campaigns || []);
      setActiveDeals(deals?.filter((d: Deal) => d.status === 'active' || d.status === 'completed') || []);
      setIsLoading(false);
    })();
  }, []);

  const handleMarkComplete = async (dealId: string, brandId: string, dealTitle: string) => {
    setCompletingDeal(dealId);
    await supabase.from('deals').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', dealId);
    await supabase.from('notifications').insert({
      user_id: brandId, type: 'deal_completed',
      title: 'Deal Marked Complete',
      message: `The influencer has marked "${dealTitle}" as complete. Please review and release payment.`,
      link: `/brand/deals/${dealId}`,
    });
    setActiveDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'completed' } : d));
    setCompletingDeal(null);
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0}>
        <h1 className="text-2xl font-bold text-white">Welcome back{firstName ? `, ${firstName}` : ''}!</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Here's your performance overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open Jobs', value: stats.campaigns, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', action: () => router.push('/influencer/campaigns') },
          { label: 'Applications', value: stats.applications, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', action: null },
          { label: 'Active Deals', value: stats.deals, icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10', action: () => router.push('/influencer/deals') },
          { label: 'Total Earned', value: `₹${stats.earnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', action: null },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fade} initial="hidden" animate="visible" custom={i + 1}
            onClick={s.action || undefined}
            className={`bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 ${s.action ? 'cursor-pointer hover:border-zinc-700/80 transition-all' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-0.5">{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent campaigns */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={5}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <h3 className="font-semibold text-white text-sm">Recent Campaigns</h3>
            <button onClick={() => router.push('/influencer/campaigns')}
              className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-3">
            {recentCampaigns.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No campaigns available yet</p>
              </div>
            ) : recentCampaigns.map((c) => (
              <button key={c.id} onClick={() => router.push('/influencer/campaigns')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 transition-colors text-left">
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">{c.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatRelativeTime(c.created_at)}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-semibold text-white text-sm">₹{c.budget.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-zinc-600">{c.application_count || 0} applied</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active deals */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={6}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <h3 className="font-semibold text-white text-sm">Active Deals</h3>
            <button onClick={() => router.push('/influencer/deals')}
              className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-3">
            {activeDeals.length === 0 ? (
              <div className="py-8 text-center">
                <Handshake className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No active deals yet</p>
                <p className="text-xs text-zinc-600 mt-1">Apply to campaigns to get deals</p>
              </div>
            ) : activeDeals.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">{d.title}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${dealStatusStyles[d.status] || 'bg-zinc-800 text-zinc-500'}`}>{d.status}</span>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="font-semibold text-white text-sm">₹{d.amount.toLocaleString('en-IN')}</p>
                  {d.status === 'active' && (
                    <button onClick={() => handleMarkComplete(d.id, d.brand_id, d.title)} disabled={completingDeal === d.id}
                      className="mt-1 text-xs px-2 py-1 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors disabled:opacity-40">
                      {completingDeal === d.id ? '...' : 'Mark Done'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={7}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Browse Campaigns', sub: 'Find your next brand deal', icon: Eye, action: () => router.push('/influencer/campaigns'), color: 'bg-blue-500/10', iconColor: 'text-blue-400' },
            { label: 'Update Profile', sub: 'Improve your visibility', icon: CheckCircle, action: () => router.push('/influencer/profile'), color: 'bg-purple-500/10', iconColor: 'text-purple-400' },
            { label: 'Track Earnings', sub: 'View all payments', icon: TrendingUp, action: () => router.push('/influencer/deals'), color: 'bg-green-500/10', iconColor: 'text-green-400' },
          ].map((qa) => (
            <button key={qa.label} onClick={qa.action}
              className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors text-left">
              <div className={`h-10 w-10 rounded-xl ${qa.color} flex items-center justify-center shrink-0`}>
                <qa.icon className={`h-5 w-5 ${qa.iconColor}`} />
              </div>
              <div>
                <p className="font-medium text-white text-sm">{qa.label}</p>
                <p className="text-xs text-zinc-500">{qa.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
