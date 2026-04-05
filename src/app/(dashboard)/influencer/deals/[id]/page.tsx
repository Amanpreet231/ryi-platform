'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Check, Clock, IndianRupee, Upload, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  active: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-zinc-800 text-zinc-500',
};

export default function InfluencerDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [deal, setDeal] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [workSubmission, setWorkSubmission] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  const fetchDeal = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('deals')
      .select('*, brand:profiles!deals_brand_id_fkey(*)')
      .eq('id', params.id).eq('influencer_id', user.id).single();
    if (data) {
      const { data: bp } = await supabase.from('brand_profiles').select('*').eq('user_id', data.brand_id).single();
      setDeal({ ...data, brand: { ...data.brand, ...bp } });
    }
    setIsLoading(false);
  }, [params.id]);

  React.useEffect(() => { fetchDeal(); }, [fetchDeal]);

  const handleMarkComplete = async () => {
    if (!deal || !workSubmission.trim()) return;
    setIsSubmitting(true);
    await supabase.from('deals').update({ status: 'completed', completed_at: new Date().toISOString(), work_submitted: workSubmission }).eq('id', deal.id);
    await supabase.from('notifications').insert({
      user_id: deal.brand_id, type: 'deal_completed',
      title: 'Work Submitted for Review!',
      message: `Influencer has completed work for "${deal.title}". Please review and approve.`,
      link: `/brand/deals/${deal.id}`,
    });
    await fetchDeal();
    setShowSubmitModal(false);
    setIsSubmitting(false);
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="h-9 w-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Deal with {deal.brand?.company_name || 'Brand'}</p>
        </div>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[deal.status] || statusStyles.cancelled}`}>{deal.status}</span>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-0">
          {[
            { label: 'In Progress', sublabel: 'Create the content', icon: Clock, s: 1 },
            { label: 'Under Review', sublabel: 'Brand reviews work', icon: Check, s: 2 },
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

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Deal details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">Deal Details</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Total Amount', value: `₹${deal.amount.toLocaleString('en-IN')}`, bold: true },
              ...(deal.status === 'paid' ? [
                { label: 'Platform fee (10%)', value: `-₹${commission.toLocaleString('en-IN')}`, bold: false, red: true },
                { label: 'You received', value: `₹${influencerGets.toLocaleString('en-IN')}`, bold: true, green: true },
              ] : []),
              { label: 'Created', value: formatDate(deal.created_at), bold: false },
              ...(deal.completed_at ? [{ label: 'Submitted', value: formatDate(deal.completed_at), bold: false }] : []),
              ...(deal.paid_at ? [{ label: 'Paid on', value: formatDate(deal.paid_at), bold: false }] : []),
            ].map((row: any) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-zinc-400">{row.label}</span>
                <span className={row.green ? 'font-bold text-green-400' : row.red ? 'text-red-400' : row.bold ? 'font-bold text-white' : 'text-white'}>{row.value}</span>
              </div>
            ))}
          </div>

          {deal.status === 'active' && (
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3">Once you've completed all deliverables, submit your work for brand review.</p>
              <button onClick={() => setShowSubmitModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm">
                <Upload className="h-4 w-4" />Submit Work
              </button>
            </div>
          )}
        </motion.div>

        {/* Brand info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">Brand</h3>
          <div className="flex items-center gap-3 p-3 bg-zinc-800/60 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center font-bold text-zinc-300">
              {(deal.brand?.company_name?.[0] || 'B').toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white text-sm">{deal.brand?.company_name || 'Brand'}</p>
              {deal.brand?.industry && <p className="text-xs text-zinc-500">{deal.brand.industry}</p>}
            </div>
          </div>
          {deal.brand?.website && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Website</span>
              <span className="text-white">{deal.brand.website}</span>
            </div>
          )}
          {deal.brand?.description && (
            <p className="text-xs text-zinc-500 leading-relaxed">{deal.brand.description}</p>
          )}
          <button onClick={() => router.push('/messages')}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
            <MessageCircle className="h-4 w-4" />Message Brand
          </button>
        </motion.div>
      </div>

      {/* Deliverables */}
      {deal.description && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
          <h3 className="font-semibold text-white text-sm mb-2">Deliverables Expected</h3>
          <p className="text-zinc-400 text-sm">{deal.description}</p>
        </motion.div>
      )}

      {/* Submitted work */}
      {deal.work_submitted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-zinc-900/60 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <h3 className="font-semibold text-white text-sm">Your Submitted Work</h3>
          </div>
          <p className="text-zinc-400 text-sm whitespace-pre-wrap">{deal.work_submitted}</p>
        </motion.div>
      )}

      {/* Revision request */}
      {deal.rejection_reason && (
        <div className="bg-zinc-900/60 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-semibold text-red-400 text-sm mb-2">Revision Requested</h3>
          <p className="text-zinc-400 text-sm">{deal.rejection_reason}</p>
          {deal.status === 'cancelled' && (
            <button onClick={() => setShowSubmitModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors text-sm">
              <Upload className="h-4 w-4" />Resubmit Work
            </button>
          )}
        </div>
      )}

      {/* Submit modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSubmitModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h3 className="font-semibold text-white">Submit Your Work</h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-400">Describe your work and include links to the content you've created.</p>
                <textarea
                  rows={5}
                  placeholder="Describe your work, include links to content, screenshots, etc..."
                  value={workSubmission}
                  onChange={(e) => setWorkSubmission(e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 resize-none transition-colors"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleMarkComplete} disabled={!workSubmission.trim() || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm">
                    {isSubmitting ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</> : 'Submit Work'}
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
