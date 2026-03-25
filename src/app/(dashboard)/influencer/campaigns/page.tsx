'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Search, MapPin, Filter, Briefcase, X } from 'lucide-react';
import { Card, CardContent, Button, Input, Badge, Modal, Textarea, Spinner } from '@/components/ui';
import { formatCurrency, formatRelativeTime, INDIAN_CITIES, CONTENT_NICHES } from '@/lib/utils';
import type { Campaign, Application } from '@/types';

export default function CampaignsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = React.useState<Application[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);
  const [applicationMessage, setApplicationMessage] = React.useState('');
  const [proposedPrice, setProposedPrice] = React.useState('');

  const [filters, setFilters] = React.useState({
    search: '',
    city: '',
    niche: '',
    minBudget: '',
    maxBudget: '',
  });

  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*, brand:profiles(full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*')
      .eq('influencer_id', user.id);

    setCampaigns(campaignsData || []);
    setMyApplications(applicationsData || []);
    setIsLoading(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filters.search && !campaign.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.city && campaign.location !== filters.city) {
      return false;
    }
    if (filters.niche && !campaign.niche?.includes(filters.niche)) {
      return false;
    }
    if (filters.minBudget && campaign.budget < parseInt(filters.minBudget)) {
      return false;
    }
    if (filters.maxBudget && campaign.budget > parseInt(filters.maxBudget)) {
      return false;
    }
    return true;
  });

  const hasApplied = (campaignId: string) => {
    return myApplications.some(app => app.campaign_id === campaignId);
  };

  const getApplicationStatus = (campaignId: string) => {
    const app = myApplications.find(a => a.campaign_id === campaignId);
    return app?.status;
  };

  const handleApply = async () => {
    if (!selectedCampaign) return;
    
    setIsApplying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from('applications').insert({
        campaign_id: selectedCampaign.id,
        influencer_id: user.id,
        brand_id: selectedCampaign.brand_id,
        message: applicationMessage || null,
        proposed_price: proposedPrice ? parseInt(proposedPrice) : null,
      });

      if (error) throw error;

      await supabase
        .from('campaigns')
        .update({ application_count: selectedCampaign.application_count + 1 })
        .eq('id', selectedCampaign.id);

      // Create notification for brand
      await supabase.from('notifications').insert({
        user_id: selectedCampaign.brand_id,
        type: 'application_received',
        title: 'New Application Received',
        message: `Someone applied to "${selectedCampaign.title}"`,
        link: '/brand/applications',
      });

      await fetchData();
      setSelectedCampaign(null);
      setApplicationMessage('');
      setProposedPrice('');
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      niche: '',
      minBudget: '',
      maxBudget: '',
    });
  };

  const hasActiveFilters = filters.search || filters.city || filters.niche || filters.minBudget || filters.maxBudget;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Campaigns</h1>
          <p className="text-zinc-400">{filteredCampaigns.length} campaigns available</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1">Active</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-800 grid gap-4 md:grid-cols-4">
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-white"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={filters.niche}
                onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
                className="h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-white"
              >
                <option value="">All Niches</option>
                {CONTENT_NICHES.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Min Budget"
                value={filters.minBudget}
                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Max Budget"
                value={filters.maxBudget}
                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
              />

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="md:col-span-4">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCampaigns.map((campaign) => {
            const applied = hasApplied(campaign.id);
            const status = getApplicationStatus(campaign.id);

            return (
              <Card 
                key={campaign.id}
                className="hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{campaign.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={campaign.status === 'open' ? 'success' : 'warning'}>
                          {campaign.status}
                        </Badge>
                        {campaign.location && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            {campaign.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(campaign.budget)}</p>
                      <p className="text-xs text-zinc-500">Budget</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {campaign.niche?.slice(0, 3).map((n) => (
                      <Badge key={n} variant="outline">{n}</Badge>
                    ))}
                    {campaign.niche?.length > 3 && (
                      <Badge variant="outline">+{campaign.niche.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">
                      {formatRelativeTime(campaign.created_at)}
                    </span>
                    
                    {applied ? (
                      <Badge 
                        variant={status === 'accepted' ? 'success' : status === 'rejected' ? 'error' : 'warning'}
                      >
                        {status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Applied'}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCampaign(campaign); }}>
                        Apply Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No campaigns found</h3>
            <p className="text-zinc-400 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No campaigns available at the moment'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.title || ''}
        description="Campaign Details"
        className="max-w-2xl"
      >
        {selectedCampaign && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-sm text-zinc-400">Budget</p>
                <p className="text-xl font-bold text-white">{formatCurrency(selectedCampaign.budget)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Applications</p>
                <p className="text-xl font-bold text-white">{selectedCampaign.application_count}</p>
              </div>
              {selectedCampaign.location && (
                <div>
                  <p className="text-sm text-zinc-400">Location</p>
                  <p className="text-xl font-bold text-white">{selectedCampaign.location}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Description</h4>
              <p className="text-white">{selectedCampaign.description}</p>
            </div>

            {selectedCampaign.requirements && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Requirements</h4>
                <p className="text-white">{selectedCampaign.requirements}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Content Types</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCampaign.content_type?.map((type) => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>

            {hasApplied(selectedCampaign.id) ? (
              <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                <Badge 
                  size="lg"
                  variant={getApplicationStatus(selectedCampaign.id) === 'accepted' ? 'success' : 'warning'}
                >
                  You&apos;ve already applied to this campaign
                </Badge>
              </div>
            ) : (
              <>
                <Textarea
                  label="Your Message (Optional)"
                  placeholder="Introduce yourself and explain why you're a great fit for this campaign..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                />

                <Input
                  label="Your Proposed Price (Optional)"
                  type="number"
                  placeholder="Leave blank to accept campaign budget"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                />

                <Button 
                  className="w-full" 
                  onClick={handleApply}
                  isLoading={isApplying}
                >
                  Submit Application
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
