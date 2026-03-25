'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Briefcase, Handshake, TrendingUp, Eye, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Campaign, Deal } from '@/types';

export default function InfluencerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [stats, setStats] = React.useState({
    campaigns: 0,
    applications: 0,
    deals: 0,
    earnings: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = React.useState<Campaign[]>([]);
  const [activeDeals, setActiveDeals] = React.useState<Deal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCampaigns(campaigns || []);

      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('influencer_id', user.id);

      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('influencer_id', user.id);

      const totalEarnings = deals?.reduce((sum, deal) => 
        deal.status === 'paid' ? sum + deal.amount : sum, 0
      ) || 0;

      setStats({
        campaigns: campaigns?.length || 0,
        applications: applications?.length || 0,
        deals: deals?.length || 0,
        earnings: totalEarnings,
      });

      setActiveDeals(deals?.filter((d: Deal) => d.status === 'active' || d.status === 'completed') || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!</h1>
        <p className="text-zinc-400">Here&apos;s what&apos;s happening with your campaigns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Available Jobs</p>
                <p className="text-2xl font-bold text-white">{stats.campaigns}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Applications</p>
                <p className="text-2xl font-bold text-white">{stats.applications}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Deals</p>
                <p className="text-2xl font-bold text-white">{stats.deals}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Handshake className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Earned</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.earnings)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <button 
                onClick={() => router.push('/influencer/campaigns')}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{campaign.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={campaign.status === 'open' ? 'success' : 'warning'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-xs text-zinc-500">{formatRelativeTime(campaign.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-white">{formatCurrency(campaign.budget)}</p>
                      <p className="text-xs text-zinc-500">{campaign.application_count || 0} applied</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400">No campaigns available yet</p>
                <button 
                  onClick={() => router.push('/influencer/campaigns')}
                  className="mt-2 text-sm text-white hover:underline"
                >
                  Browse all campaigns
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Deals</CardTitle>
              <button 
                onClick={() => router.push('/influencer/deals')}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {activeDeals.length > 0 ? (
              <div className="space-y-4">
                {activeDeals.map((deal) => (
                  <div 
                    key={deal.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-zinc-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{deal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={deal.status === 'active' ? 'warning' : 'success'}>
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-white">{formatCurrency(deal.amount)}</p>
                      {deal.status === 'active' && (
                        <button className="mt-1 text-xs text-white bg-zinc-700 px-2 py-1 rounded hover:bg-zinc-600 transition-colors">
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Handshake className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400">No active deals yet</p>
                <p className="text-sm text-zinc-500 mt-1">Apply to campaigns to get deals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => router.push('/influencer/campaigns')}
              className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Browse Campaigns</h4>
                <p className="text-sm text-zinc-400">Find your next brand deal</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/influencers')}
              className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Complete Profile</h4>
                <p className="text-sm text-zinc-400">Update your portfolio</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/influencer/deals')}
              className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Track Earnings</h4>
                <p className="text-sm text-zinc-400">View your payments</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
