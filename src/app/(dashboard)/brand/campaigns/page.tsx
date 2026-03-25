'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Plus, Briefcase, Edit, Trash2, Users } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Campaign } from '@/types';

export default function BrandCampaignsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCampaigns = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false });

    setCampaigns(data || []);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    await fetchCampaigns();
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'open' ? 'closed' : 'open';
    
    await supabase
      .from('campaigns')
      .update({ status: newStatus })
      .eq('id', campaign.id);

    await fetchCampaigns();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Campaigns</h1>
          <p className="text-zinc-400">{campaigns.length} campaigns created</p>
        </div>
        <Button onClick={() => router.push('/brand/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{campaign.title}</h3>
                      <Badge 
                        variant={campaign.status === 'open' ? 'success' : 'default'}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400 line-clamp-1">
                      {campaign.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-zinc-500">
                        Budget: {formatCurrency(campaign.budget)}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-zinc-500">
                        <Users className="h-3 w-3" />
                        {campaign.application_count} applications
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatRelativeTime(campaign.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(campaign)}
                    >
                      {campaign.status === 'open' ? 'Close' : 'Open'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/brand/applications?campaign=${campaign.id}`)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(campaign.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
            <p className="text-zinc-400 mb-4">Create your first campaign to start finding influencers</p>
            <Button onClick={() => router.push('/brand/campaigns/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
