'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Users, Check, X, Eye, MessageCircle } from 'lucide-react';
import { Card, CardContent, Button, Badge, Avatar, Modal, Textarea, Input, Spinner } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Application, InfluencerProfile } from '@/types';

export default function BrandApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [applications, setApplications] = React.useState<(Application & { influencer?: any })[]>([]);
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCampaign, setSelectedCampaign] = React.useState<string>(searchParams.get('campaign') || '');
  const [selectedApplication, setSelectedApplication] = React.useState<(Application & { influencer?: any }) | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [selectedCampaign]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('brand_id', user.id);

    setCampaigns(campaignsData || []);

    let query = supabase
      .from('applications')
      .select('*, campaign:campaigns(*)')
      .eq('brand_id', user.id);

    if (selectedCampaign) {
      query = query.eq('campaign_id', selectedCampaign);
    }

    const { data } = await query.order('created_at', { ascending: false });

    if (data) {
      const enrichedApplications = await Promise.all(
        data.map(async (app) => {
          const { data: influencer } = await supabase
            .from('influencer_profiles')
            .select('*, profiles:user_id(full_name, email)')
            .eq('user_id', app.influencer_id)
            .single();
          return { ...app, influencer };
        })
      );
      setApplications(enrichedApplications);
    }

    setIsLoading(false);
  };

  const handleAccept = async (application: Application & { influencer?: any }) => {
    setIsProcessing(true);
    
    try {
      await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      await supabase.from('deals').insert({
        campaign_id: application.campaign_id,
        application_id: application.id,
        influencer_id: application.influencer_id,
        brand_id: application.brand_id,
        title: application.campaign?.title || 'Campaign Deal',
        description: `Deal for ${application.campaign?.title}`,
        amount: application.proposed_price || application.campaign?.budget || 0,
        status: 'active',
      });

      // Create conversation for messaging
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${application.brand_id},participant_2.eq.${application.influencer_id}),and(participant_1.eq.${application.influencer_id},participant_2.eq.${application.brand_id})`)
        .single();

      if (!existingConvo) {
        await supabase.from('conversations').insert({
          type: 'campaign',
          participant_1: application.brand_id,
          participant_2: application.influencer_id,
          campaign_id: application.campaign_id,
        });
      }

      // Notify influencer about acceptance
      await supabase.from('notifications').insert({
        user_id: application.influencer_id,
        type: 'application_accepted',
        title: 'Application Accepted! 🎉',
        message: `Your application for "${application.campaign?.title}" has been accepted!`,
        link: '/influencer/deals',
      });

      await fetchData();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error accepting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicationId: string, influencerId: string, campaignTitle: string) => {
    setIsProcessing(true);
    
    await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    // Notify influencer about rejection
    await supabase.from('notifications').insert({
      user_id: influencerId,
      type: 'application_rejected',
      title: 'Application Update',
      message: `Your application for "${campaignTitle}" was not accepted. Keep applying!`,
    });

    await fetchData();
    setIsProcessing(false);
  };

  const groupedApplications = {
    pending: applications.filter(a => a.status === 'pending'),
    accepted: applications.filter(a => a.status === 'accepted'),
    rejected: applications.filter(a => a.status === 'rejected'),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-zinc-400">Review and manage influencer applications</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-zinc-400">Filter by campaign:</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-white"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending ({groupedApplications.pending.length})
          </h2>
          {groupedApplications.pending.length > 0 ? (
            <div className="grid gap-4">
              {groupedApplications.pending.map((app) => (
                <Card key={app.id} className="hover:border-zinc-600 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar 
                          src={app.influencer?.avatar_url} 
                          fallback={app.influencer?.profiles?.full_name}
                          size="lg"
                        />
                        <div>
                          <h3 className="font-semibold text-white">
                            {app.influencer?.profiles?.full_name || 'Influencer'}
                          </h3>
                          <p className="text-sm text-zinc-400">{app.influencer?.bio}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {app.influencer?.niche?.slice(0, 3).map((n: string) => (
                              <Badge key={n} variant="outline">{n}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">Campaign</p>
                          <p className="font-medium text-white">{app.campaign?.title}</p>
                          {app.proposed_price && (
                            <p className="text-sm text-green-400">
                              Offered: {formatCurrency(app.proposed_price)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAccept(app)}
                            disabled={isProcessing}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(app.id, app.influencer_id, app.campaign?.title || 'Campaign')}
                            disabled={isProcessing}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-zinc-400">
                No pending applications
              </CardContent>
            </Card>
          )}
        </div>

        {groupedApplications.accepted.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Accepted ({groupedApplications.accepted.length})
            </h2>
            <div className="grid gap-4">
              {groupedApplications.accepted.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={app.influencer?.avatar_url} 
                          fallback={app.influencer?.profiles?.full_name}
                        />
                        <div>
                          <h3 className="font-medium text-white">
                            {app.influencer?.profiles?.full_name}
                          </h3>
                          <p className="text-sm text-zinc-400">{app.campaign?.title}</p>
                        </div>
                      </div>
                      <Badge variant="success">Accepted</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        title="Application Details"
        className="max-w-2xl"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <Avatar 
                src={selectedApplication.influencer?.avatar_url} 
                fallback={selectedApplication.influencer?.profiles?.full_name}
                size="xl"
              />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedApplication.influencer?.profiles?.full_name}
                </h3>
                <p className="text-sm text-zinc-400">{selectedApplication.influencer?.city}</p>
              </div>
            </div>

            {selectedApplication.influencer && (
              <div className="grid grid-cols-2 gap-4">
                {selectedApplication.influencer.instagram_followers && (
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500">Instagram</p>
                    <p className="font-semibold text-white">
                      {selectedApplication.influencer.instagram_followers.toLocaleString()} followers
                    </p>
                  </div>
                )}
                {selectedApplication.influencer.youtube_subscribers && (
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500">YouTube</p>
                    <p className="font-semibold text-white">
                      {selectedApplication.influencer.youtube_subscribers.toLocaleString()} subscribers
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Bio</h4>
              <p className="text-white">{selectedApplication.influencer?.bio || 'No bio available'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Niches</h4>
              <div className="flex flex-wrap gap-2">
                {selectedApplication.influencer?.niche?.map((n: string) => (
                  <Badge key={n} variant="outline">{n}</Badge>
                ))}
              </div>
            </div>

            {selectedApplication.message && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Message</h4>
                <p className="text-white">{selectedApplication.message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={() => handleAccept(selectedApplication)}
                isLoading={isProcessing}
              >
                Accept Application
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  handleReject(selectedApplication.id, selectedApplication.influencer_id, selectedApplication.campaign?.title || 'Campaign');
                  setSelectedApplication(null);
                }}
                isLoading={isProcessing}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
