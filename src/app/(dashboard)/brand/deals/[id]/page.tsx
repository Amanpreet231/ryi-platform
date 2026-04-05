'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Check, X, Clock, IndianRupee, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { RazorpayCheckout } from '@/components/dashboard/razorpay-checkout';
import { formatDate } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-zinc-800 text-zinc-500',
};

export default function BrandDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [deal, setDeal] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rejectReason, setRejectReason] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState('');

  const fetchDeal = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('deals')
      .select('*, influencer:profiles!deals_influencer_id_fkey(*)')
      .eq('id', params.id).eq('brand_id', user.id).single();
    if (data) {
      const { data: ip } = await supabase.from('influencer_profiles').select('*').eq('user_id', data.influencer_id).single();
      setDeal({ ...data, influencer: { ...data.influencer, ...ip } });
    }
    setIsLoading(false);
  }, [params.id]);

  React.useEffect(() => { fetchDeal(); }, [fetchDeal]);

  const handleReject = async () => {
    if (!deal || !rejectReason.trim()) return;
    setIsProcessing(true);
    await supabase.from('deals').update({ status: 'cancelled', rejection_reason: rejectReason }).eq('id', deal.id);
    await supabase.from('notifications').insert({
      user_id: deal.influencer_id, type: 'application_rejected',
      title: 'Revision Requested',
      message: `The brand has requested revisions: ${rejectReason}`,
      link: `/influencer/deals/${deal.id}`,
    });
    await fetchDeal();
    setShowRejectModal(false);
    setIsProcessing(false);
  };

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (!deal) return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="h-14 w-14 text-zinc-700 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-3">Deal not found</h2>
      <button onClick={() => router.back()} className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm transition-colors">Go back</button>
    </div>
  );

  const step = deal.status === 'active' ? 1 : deal.status === 'completed' ? 2 : deal.status === 'paid' ? 3 : 0;
  const commission = deal.amount * 0.1;
  const influencerGets = deal.amount - commission;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="h-9 w-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{deal.title}</h1>
          <p className="text-zinc-500 text-sm mt-0.5 truncate">Deal with {deal.influencer?.full_name || 'Influencer'}</p>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[deal.status] || statusStyles.cancelled}`}>{deal.status}</span>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-0">
          {[
            { label: 'In Progress', sublabel: 'Influencer working', icon: Clock, s: 1 },
            { label: 'Under Review', sublabel: 'Review submitted work', icon: Check, s: 2 },
            { label: 'Paid', sublabel: 'Payment released', icon: IndianRupee, s: 3 },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= st.s ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                  <st.icon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${step >= st.s ? 'text-white' : 'text-zinc-500'}`}>{st.label}</p>
                  <p className="text-xs text-zinc-600">{st.sublabel}</p>
                </div>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-4 transition-colors ${step > st.s ? 'bg-green-500' : 'bg-zinc-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Payment card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">Payment Details</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Total Amount', value: `₹${deal.amount.toLocaleString('en-IN')}`, bold: true },
              { label: 'Influencer receives', value: `₹${influencerGets.toLocaleString('en-IN')}`, bold: false },
              { label: 'Platform fee (10%)', value: `₹${commission.toLocaleString('en-IN')}`, bold: false },
              { label: 'Created', value: formatDate(deal.created_at), bold: false },
              ...(deal.completed_at ? [{ label: 'Submitted', value: formatDate(deal.completed_at), bold: false }] : []),
              ...(deal.paid_at ? [{ label: 'Paid on', value: formatDate(deal.paid_at), bold: false }] : []),
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-zinc-400">{row.label}</span>
                <span className={row.bold ? 'font-bold text-white' : 'text-white'}>{row.value}</span>
              </div>
            ))}
          </div>

          {deal.status === 'completed' && (
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-500">Review the submitted work and release payment to the influencer.</p>
              <RazorpayCheckout
                dealId={deal.id}
                amount={deal.amount}
                dealTitle={deal.title}
                brandName="Your Brand"
                onSuccess={async (paymentId) => {
                  await supabase.from('deals').update({ status: 'paid', paid_at: new Date().toISOString(), payment_id: paymentId }).eq('id', deal.id);
                  await supabase.from('notifications').insert({
                    user_id: deal.influencer_id, type: 'deal_paid',
                    title: 'Payment Received!',
                    message: `Payment of ₹${influencerGets.toLocaleString('en-IN')} has been sent to your account.`,
                    link: `/influencer/deals/${deal.id}`,
                  });
                  await fetchDeal();
                }}
                onError={(err) => setPaymentError(String(err))}
              />
              {paymentError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{paymentError}</div>
              )}
              <button onClick={() => setShowRejectModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
                <X className="h-4 w-4" />Request Revisions Instead
              </button>
            </div>
          )}
        </motion.div>

        {/* Influencer info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">Influencer</h3>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/60 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center font-bold text-zinc-300">
              {(deal.influencer?.full_name?.[0] || 'I').toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white text-sm">{deal.influencer?.full_name || 'Influencer'}</p>
              {deal.influencer?.niche?.length > 0 && <p className="text-xs text-zinc-500">{deal.influencer.niche.slice(0, 2).join(', ')}</p>}
            </div>
          </div>
          {deal.influencer?.instagram_followers > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Instagram</span>
              <span className="text-white">{deal.influencer.instagram_followers.toLocaleString()} followers</span>
            </div>
          )}
          {deal.influencer?.youtube_subscribers > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">YouTube</span>
              <span className="text-white">{deal.influencer.youtube_subscribers.toLocaleString()} subscribers</span>
            </div>
          )}
          <button onClick={() => router.push('/messages')}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors mt-2">
            <MessageCircle className="h-4 w-4" />Message Influencer
          </button>
        </motion.div>
      </div>

      {/* Deliverables */}
      {deal.description && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
          <h3 className="font-semibold text-white text-sm mb-2">Deliverables</h3>
          <p className="text-zinc-400 text-sm">{deal.description}</p>
        </motion.div>
      )}

      {/* Submitted work */}
      {deal.work_submitted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-zinc-900/60 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Submitted Work</h3>
          </div>
          <p className="text-zinc-400 text-sm whitespace-pre-wrap">{deal.work_submitted}</p>
        </motion.div>
      )}

      {/* Rejection reason */}
      {deal.rejection_reason && (
        <div className="bg-zinc-900/60 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-semibold text-red-400 text-sm mb-2">Revision Requested</h3>
          <p className="text-zinc-400 text-sm">{deal.rejection_reason}</p>
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h3 className="font-semibold text-white">Request Revisions</h3>
                <button onClick={() => setShowRejectModal(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-400">Explain what needs to be changed so the influencer can revise their work.</p>
                <textarea
                  rows={4}
                  placeholder="Describe the changes needed..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 resize-none transition-colors"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleReject} disabled={!rejectReason.trim() || isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-40">
                    {isProcessing ? '...' : 'Send Feedback'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
