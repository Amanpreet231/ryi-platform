'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Check, X, Clock, DollarSign, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Card, CardContent, Textarea, Badge, Spinner, Modal } from '@/components/ui';
import { RazorpayCheckout } from '@/components/dashboard/razorpay-checkout';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal } from '@/types';

export default function BrandDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [deal, setDeal] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rejectReason, setRejectReason] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showApproveModal, setShowApproveModal] = React.useState(false);

  React.useEffect(() => {
    fetchDeal();
  }, []);

  const fetchDeal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('deals')
      .select('*, influencer:profiles!deals_influencer_id_fkey(*)')
      .eq('id', params.id)
      .eq('brand_id', user.id)
      .single();

    if (data) {
      const { data: infProfile } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('user_id', data.influencer_id)
        .single();
      
      setDeal({ ...data, influencer: { ...data.influencer, ...infProfile } });
    }
    
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (!deal) return;
    setIsProcessing(true);

    await supabase
      .from('deals')
      .update({ 
        status: 'cancelled',
        rejection_reason: rejectReason,
      })
      .eq('id', deal.id);

    await supabase.from('notifications').insert({
      user_id: deal.influencer_id,
      type: 'application_rejected',
      title: 'Work Not Approved',
      message: `The brand has requested revisions: ${rejectReason}`,
      link: `/influencer/deals/${deal.id}`,
    });

    await fetchDeal();
    setShowRejectModal(false);
    setIsProcessing(false);
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
          <p className="text-zinc-400">Deal with {deal.influencer?.full_name || 'Influencer'}</p>
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
                <p className="text-sm text-zinc-500">Influencer working</p>
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
                currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">Review</p>
                <p className="text-sm text-zinc-500">Review submitted work</p>
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
                <p className="font-medium text-white">Payment</p>
                <p className="text-sm text-zinc-500">Release to influencer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Payment Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Amount</span>
                <span className="font-bold text-white">{formatCurrency(deal.amount)}</span>
              </div>
              
              {deal.status === 'paid' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform Fee (10%)</span>
                    <span className="text-green-400">+{formatCurrency(commission)} earned</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Influencer Receives</span>
                    <span className="font-bold text-white">{formatCurrency(influencerGets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform Fee (10%)</span>
                    <span className="text-zinc-400">{formatCurrency(commission)}</span>
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
                    deal.status === 'cancelled' ? 'error' :
                    'default'
                  }
                >
                  {deal.status}
                </Badge>
              </div>
            </div>

            {deal.status === 'completed' && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <p className="text-sm text-zinc-400">
                  Pay now to release payment to the influencer. The 10% platform fee is included in the total.
                </p>
                <RazorpayCheckout
                  dealId={deal.id}
                  amount={deal.amount}
                  dealTitle={deal.title}
                  brandName="Your Brand"
                  onSuccess={async (paymentId) => {
                    await supabase
                      .from('deals')
                      .update({ 
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                        payment_id: paymentId,
                      })
                      .eq('id', deal.id);

                    await supabase.from('notifications').insert({
                      user_id: deal.influencer_id,
                      type: 'deal_paid',
                      title: 'Payment Received!',
                      message: `Payment of ${formatCurrency(deal.amount * 0.9)} has been sent to your account.`,
                      link: `/influencer/deals/${deal.id}`,
                    });

                    await fetchDeal();
                    setShowApproveModal(false);
                  }}
                  onError={(error) => {
                    alert(error);
                  }}
                />
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Request Changes Instead
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Influencer Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xl font-bold text-zinc-400">
                    {deal.influencer?.full_name?.[0] || 'I'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{deal.influencer?.full_name || 'Influencer'}</p>
                  <p className="text-sm text-zinc-500">{deal.influencer?.niche?.join(', ')}</p>
                </div>
              </div>

              {deal.influencer?.instagram_followers && (
                <div>
                  <span className="text-zinc-400 text-sm">Instagram</span>
                  <p className="text-white">{deal.influencer.instagram_followers.toLocaleString()} followers</p>
                </div>
              )}

              {deal.influencer?.youtube_subscribers && (
                <div>
                  <span className="text-zinc-400 text-sm">YouTube</span>
                  <p className="text-white">{deal.influencer.youtube_subscribers.toLocaleString()} subscribers</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => router.push('/messages')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Influencer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {deal.description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-2">Deliverables Expected</h3>
            <p className="text-zinc-400">{deal.description}</p>
          </CardContent>
        </Card>
      )}

      {deal.work_submitted && (
        <Card className="border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Submitted Work</h3>
            </div>
            <p className="text-zinc-400 whitespace-pre-wrap">{deal.work_submitted}</p>
          </CardContent>
        </Card>
      )}

      {deal.rejection_reason && (
        <Card className="border-red-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-red-400 mb-2">Revision Requested</h3>
            <p className="text-zinc-400">{deal.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Info Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Payment Details"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400 mb-2">Payment Summary</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Amount</span>
                <span className="text-white">{formatCurrency(deal.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Influencer Gets</span>
                <span className="text-white">{formatCurrency(influencerGets)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-1">
                <span className="text-zinc-400">Platform Fee (10%)</span>
                <span className="text-zinc-400">{formatCurrency(commission)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-400">
            Click &quot;Pay Now&quot; above to complete the payment via Razorpay. Your payment will be securely processed.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Request Changes"
        description="Explain what needs to be changed"
      >
        <div className="space-y-4">
          <Textarea
            label="Feedback for Influencer"
            placeholder="Describe what changes are needed..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectReason.trim()}
            >
              Send Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
