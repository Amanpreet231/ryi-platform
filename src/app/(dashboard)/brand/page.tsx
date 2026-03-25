'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Briefcase, Users, Handshake, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

export default function BrandDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = React.useState({
    campaigns: 0,
    applications: 0,
    deals: 0,
    spent: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: campaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', user.id);

      const { data: applications } = await supabase
        .from('applications')
        .select('*, campaign:campaigns(*)')
        .eq('brand_id', user.id);

      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('brand_id', user.id);

      const totalSpent = deals?.reduce((sum, deal) => 
        deal.status === 'paid' ? sum + deal.amount : sum, 0
      ) || 0;

      setStats({
        campaigns: campaigns || 0,
        applications: applications?.length || 0,
        deals: deals?.length || 0,
        spent: totalSpent,
      });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Dashboard</h1>
          <p className="text-zinc-400">Manage your campaigns and find influencers</p>
        </div>
        <Button onClick={() => router.push('/brand/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Post Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Campaigns</p>
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
                <Users className="h-6 w-6 text-white" />
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
                <p className="text-sm text-zinc-400">Total Spent</p>
                <p className="text-2xl font-bold text-white">₹{stats.spent.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="cursor-pointer hover:border-zinc-600 transition-colors"
          onClick={() => router.push('/brand/campaigns')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">My Campaigns</h3>
                  <p className="text-sm text-zinc-400">Create and manage your campaigns</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-zinc-600 transition-colors"
          onClick={() => router.push('/brand/applications')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Applications</h3>
                  <p className="text-sm text-zinc-400">Review influencer applications</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-zinc-600 transition-colors"
          onClick={() => router.push('/brand/deals')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Deals</h3>
                  <p className="text-sm text-zinc-400">Track your active collaborations</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-zinc-600 transition-colors"
          onClick={() => router.push('/influencers')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Find Influencers</h3>
                  <p className="text-sm text-zinc-400">Search and connect with creators</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
