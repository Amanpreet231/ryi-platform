'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Briefcase, Users, Handshake, IndianRupee, Plus, ArrowRight, Clock, CheckCircle2, Circle } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }) };

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div variants={fade} initial="hidden" animate="visible" custom={delay}
      className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function BrandDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = React.useState({ campaigns: 0, applications: 0, deals: 0, spent: 0 });
  const [recentApps, setRecentApps] = React.useState<any[]>([]);
  const [recentDeals, setRecentDeals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ count: campaigns }, { data: applications }, { data: deals }] = await Promise.all([
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('brand_id', user.id),
        supabase.from('applications').select('id, status, proposed_price, created_at, campaign:campaigns(title), influencer:profiles!influencer_id(full_name)').eq('brand_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('deals').select('*').eq('brand_id', user.id),
      ]);

      const spent = deals?.reduce((s, d) => d.status === 'paid' ? s + d.amount : s, 0) || 0;
      setStats({ campaigns: campaigns || 0, applications: applications?.length || 0, deals: deals?.length || 0, spent });
      setRecentApps(applications || []);
      setRecentDeals(deals?.slice(0, 3) || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-zinc-800 text-zinc-400',
      accepted: 'bg-green-500/10 text-green-400 border border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
      active: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      completed: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
    };
    return map[s] || 'bg-zinc-800 text-zinc-400';
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">Brand Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your campaigns and collaborations</p>
        </div>
        <button onClick={() => router.push('/brand/campaigns/new')}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm shrink-0">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Post Campaign</span>
        </button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Campaigns" value={stats.campaigns} color="bg-blue-500/10 text-blue-400" delay={1} />
        <StatCard icon={Users} label="Applications" value={stats.applications} color="bg-purple-500/10 text-purple-400" delay={2} />
        <StatCard icon={Handshake} label="Deals" value={stats.deals} color="bg-green-500/10 text-green-400" delay={3} />
        <StatCard icon={IndianRupee} label="Total Spent" value={`₹${stats.spent.toLocaleString('en-IN')}`} color="bg-orange-500/10 text-orange-400" delay={4} />
      </div>

      {/* Getting Started checklist — only when brand has no campaigns */}
      {stats.campaigns === 0 && (
        <motion.div variants={fade} initial="hidden" animate="visible" custom={5}
          className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-700/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-sm font-black text-white">🚀</span>
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">Getting Started</h2>
              <p className="text-xs text-zinc-500">4 steps to your first influencer collaboration</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Complete your brand profile', desc: 'Add logo, website, and company description', href: '/brand/profile', done: false },
              { step: 2, label: 'Post your first campaign', desc: 'Describe what you need and set your budget', href: '/brand/campaigns/new', done: false },
              { step: 3, label: 'Review creator applications', desc: 'Choose the best fit for your brand', href: '/brand/applications', done: false },
              { step: 4, label: 'Approve and pay on delivery', desc: 'Escrow payment — only pay when happy', href: '/brand/deals', done: false },
            ].map((item) => (
              <Link key={item.step} href={item.href}
                className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-zinc-800/60 transition-colors group">
                <div className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {item.done ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Circle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white group-hover:text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <Link href="/brand/campaigns/new"
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm">
              <Plus className="h-4 w-4" />Post Your First Campaign
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={5}
          className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <Link href="/brand/applications" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No applications yet</p>
              <Link href="/brand/campaigns/new" className="text-xs text-zinc-400 hover:text-white mt-2 inline-block">Post a campaign to get applications →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{(app.influencer as any)?.full_name || 'Creator'}</p>
                    <p className="text-xs text-zinc-500 truncate">{(app.campaign as any)?.title || 'Campaign'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {app.proposed_price && <p className="text-sm text-white font-medium">₹{app.proposed_price.toLocaleString('en-IN')}</p>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(app.status)}`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fade} initial="hidden" animate="visible" custom={6} className="space-y-4">
          {[
            { href: '/brand/campaigns', icon: Briefcase, label: 'My Campaigns', desc: 'Create and manage campaigns', color: 'bg-blue-500/10 text-blue-400' },
            { href: '/brand/applications', icon: Users, label: 'Applications', desc: 'Review creator applications', color: 'bg-purple-500/10 text-purple-400' },
            { href: '/brand/deals', icon: Handshake, label: 'Active Deals', desc: 'Track your collaborations', color: 'bg-green-500/10 text-green-400' },
            { href: '/influencers', icon: Clock, label: 'Find Creators', desc: 'Search 10,000+ creators', color: 'bg-orange-500/10 text-orange-400' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl hover:border-zinc-700/80 hover:bg-zinc-900/80 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
