'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Handshake, CheckCircle, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

const fade = { hidden: { opacity: 0, y: 10 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } }) };

const statusStyles: Record<string, string> = {
  active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-zinc-800 text-zinc-500',
};

export default function BrandDealsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed' | 'paid'>('all');

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('deals').select('*').eq('brand_id', user.id).order('created_at', { ascending: false });
      setDeals(data || []);
      setIsLoading(false);
    })();
  }, []);

  const stats = {
    active: deals.filter(d => d.status === 'active').length,
    completed: deals.filter(d => d.status === 'completed').length,
    paid: deals.filter(d => d.status === 'paid').length,
    totalSpent: deals.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
  };

  const filteredDeals = filter === 'all' ? deals : deals.filter(d => d.status === filter);

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0}>
        <h1 className="text-2xl font-bold text-white">Deals</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your influencer collaborations</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: stats.active, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Awaiting Payment', value: stats.completed, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Paid', value: stats.paid, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString('en-IN')}`, icon: Handshake, color: 'text-white', bg: 'bg-zinc-800' },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fade} initial="hidden" animate="visible" custom={i + 1}
            className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
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

      {/* Filter tabs */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={5}
        className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-1 overflow-x-auto">
        {(['all', 'active', 'completed', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Deals list */}
      {filteredDeals.length === 0 ? (
        <motion.div variants={fade} initial="hidden" animate="visible" custom={6}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-10 text-center">
          <Handshake className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">{filter === 'all' ? 'No deals yet' : `No ${filter} deals`}</p>
          <p className="text-zinc-500 text-sm">{filter === 'all' ? 'Accept applications to create your first deal' : `Nothing here at the moment`}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal, i) => (
            <motion.div key={deal.id} variants={fade} initial="hidden" animate="visible" custom={i + 6}
              onClick={() => router.push(`/brand/deals/${deal.id}`)}
              className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 hover:border-zinc-700/80 transition-all cursor-pointer group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{deal.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[deal.status] || statusStyles.cancelled}`}>{deal.status}</span>
                  </div>
                  {deal.description && <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">{deal.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 mt-2 text-xs text-zinc-600">
                    <span>Created {formatDate(deal.created_at)}</span>
                    {deal.completed_at && <span>Completed {formatDate(deal.completed_at)}</span>}
                    {deal.paid_at && <span>Paid {formatDate(deal.paid_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">₹{deal.amount.toLocaleString('en-IN')}</p>
                    {deal.status === 'paid' && <p className="text-xs text-zinc-500">Paid</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
