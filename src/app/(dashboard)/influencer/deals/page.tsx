'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase';
import { Handshake, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

export default function InfluencerDealsPage() {
  const supabase = createClient();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'active' | 'completed' | 'paid'>('all');

  const fetchDeals = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false });

    setDeals(data || []);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    return deal.status === filter;
  });

  const stats = {
    active: deals.filter(d => d.status === 'active').length,
    completed: deals.filter(d => d.status === 'completed').length,
    paid: deals.filter(d => d.status === 'paid').length,
    total: deals.reduce((sum, d) => sum + d.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Deals</h1>
        <p className="text-zinc-400">Manage your brand collaborations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Paid</p>
                <p className="text-2xl font-bold text-white">{stats.paid}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.total)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Handshake className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'paid'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filteredDeals.length > 0 ? (
        <div className="grid gap-4">
          {filteredDeals.map((deal) => (
            <Card 
              key={deal.id}
              className="cursor-pointer hover:border-zinc-600 transition-colors"
              onClick={() => window.location.href = `/influencer/deals/${deal.id}`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white hover:text-zinc-300">{deal.title}</h3>
                      <Badge 
                        variant={
                          deal.status === 'paid' ? 'success' : 
                          deal.status === 'completed' ? 'warning' : 
                          deal.status === 'cancelled' ? 'error' :
                          'default'
                        }
                      >
                        {deal.status}
                      </Badge>
                    </div>
                    {deal.description && (
                      <p className="mt-1 text-sm text-zinc-400 line-clamp-1">{deal.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span>Created: {formatDate(deal.created_at)}</span>
                      {deal.completed_at && (
                        <span>Completed: {formatDate(deal.completed_at)}</span>
                      )}
                      {deal.paid_at && (
                        <span>Paid: {formatDate(deal.paid_at)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{formatCurrency(deal.amount)}</p>
                      {deal.status === 'paid' && (
                        <p className="text-xs text-green-400">You received {formatCurrency(deal.amount * 0.9)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Handshake className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No deals found</h3>
            <p className="text-zinc-400">
              {filter === 'all' 
                ? 'Apply to campaigns to get your first deal'
                : `No ${filter} deals at the moment`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
