'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Check, Clock, DollarSign, Upload, MessageCircle, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, Textarea, Badge, Spinner, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

export default function InfluencerDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [deal, setDeal] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [workSubmission, setWorkSubmission] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  React.useEffect(() => {
    fetchDeal();
  }, []);

  const fetchDeal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('deals')
      .select('*, brand:profiles!deals_brand_id_fkey(*)')
      .eq('id', params.id)
      .eq('influencer_id', user.id)
      .single();

    if (data) {
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', data.brand_id)
        .single();
      
      setDeal({ ...data, brand: { ...data.brand, ...brandProfile } });
    }
    
    setIsLoading(false);
  };

  const handleMarkComplete = async () => {
    if (!deal) return;
    setIsSubmitting(true);

    await supabase
      .from('deals')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        work_submitted: workSubmission,
      })
      .eq('id', deal.id);

    await supabase.from('notifications').insert({
      user_id: deal.brand_id,
      type: 'deal_completed',
      title: 'Work Submitted for Review! 🎉',
      message: `Influencer has completed work for "${deal.title}". Please review and approve.`,
      link: `/brand/deals/${deal.id}`,
    });

    await fetchDeal();
    setShowSubmitModal(false);
    setIsSubmitting(false);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'active': return 1;
      case 'completed': return 2;
      case 'paid': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Deal not found</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStep = getStatusStep(deal.status);
  const commission = deal.amount * 0.1;
  const influencerGets = deal.amount - commission;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
          <p className="text-zinc-400">Deal with {deal.brand?.company_name || 'Brand'}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">In Progress</p>
                <p className="text-sm text-zinc-500">Working on the content</p>
              </div>
            </div>

            <div className="flex-1 h-1 bg-zinc-800 mx-4">
              <div 
                className={`h-full transition-all ${currentStep >= 2 ? 'bg-green-500' : 'bg-zinc-800'}`}
                style={{ width: currentStep >= 2 ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">Review</p>
                <p className="text-sm text-zinc-500">Brand reviews work</p>
              </div>
            </div>

            <div className="flex-1 h-1 bg-zinc-800 mx-4">
              <div 
                className={`h-full transition-all ${currentStep >= 3 ? 'bg-green-500' : 'bg-zinc-800'}`}
                style={{ width: currentStep >= 3 ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">Paid</p>
                <p className="text-sm text-zinc-500">Payment released</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Deal Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Deal Amount</span>
                <span className="font-bold text-white">{formatCurrency(deal.amount)}</span>
              </div>
              
              {deal.status === 'paid' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform Fee (10%)</span>
                    <span className="text-red-400">-{formatCurrency(commission)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-3">
                    <span className="font-medium text-white">You Receive</span>
                    <span className="font-bold text-green-400">{formatCurrency(influencerGets)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-zinc-400">Created</span>
                <span className="text-white">{formatDate(deal.created_at)}</span>
              </div>

              {deal.completed_at && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Submitted</span>
                  <span className="text-white">{formatDate(deal.completed_at)}</span>
                </div>
              )}

              {deal.paid_at && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Paid On</span>
                  <span className="text-white">{formatDate(deal.paid_at)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <Badge 
                  variant={
                    deal.status === 'paid' ? 'success' : 
                    deal.status === 'completed' ? 'warning' : 
                    'default'
                  }
                >
                  {deal.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Brand Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xl font-bold text-zinc-400">
                    {deal.brand?.company_name?.[0] || 'B'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{deal.brand?.company_name || 'Brand'}</p>
                  <p className="text-sm text-zinc-500">{deal.brand?.industry || 'Business'}</p>
                </div>
              </div>
              
              {deal.brand?.website && (
                <div>
                  <span className="text-zinc-400 text-sm">Website</span>
                  <p className="text-white">{deal.brand.website}</p>
                </div>
              )}

              {deal.brand?.description && (
                <div>
                  <span className="text-zinc-400 text-sm">About</span>
                  <p className="text-white text-sm">{deal.brand.description}</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => router.push('/messages')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {deal.description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-2">Deliverables</h3>
            <p className="text-zinc-400">{deal.description}</p>
          </CardContent>
        </Card>
      )}

      {deal.work_submitted && (
        <Card className="border-green-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-2">Submitted Work</h3>
            <p className="text-zinc-400 whitespace-pre-wrap">{deal.work_submitted}</p>
          </CardContent>
        </Card>
      )}

      {deal.status === 'active' && (
        <Card className="border-dashed border-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-2">Ready to Submit?</h3>
            <p className="text-zinc-400 mb-4">
              Once you submit your work, the brand will review and approve. Make sure you&apos;ve completed all requirements.
            </p>
            <Button onClick={() => setShowSubmitModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Submit Work
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Your Work"
        description="Describe what you've created or paste links to your content"
      >
        <div className="space-y-4">
          <Textarea
            label="Work Details"
            placeholder="Describe your work, include links to content, screenshots, etc."
            value={workSubmission}
            onChange={(e) => setWorkSubmission(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkComplete}
              isLoading={isSubmitting}
              disabled={!workSubmission.trim()}
            >
              Submit Work
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
