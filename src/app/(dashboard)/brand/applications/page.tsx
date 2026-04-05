'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Users, Check, X, Eye, ChevronDown, MapPin, Clock, IndianRupee } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Application } from '@/types';

function IgIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
}
function YtIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
}

function fmtFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Avatar({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover border border-zinc-700 shrink-0" />;
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
      {initials}
    </div>
  );
}

type AppWithInfluencer = Application & { influencer?: any; campaign?: any };

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  accepted: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-zinc-800 text-zinc-500',
};

const fade = { hidden: { opacity: 0, y: 10 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.04 } }) };

function BrandApplicationsContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [applications, setApplications] = React.useState<AppWithInfluencer[]>([]);
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCampaign, setSelectedCampaign] = React.useState<string>(searchParams.get('campaign') || '');
  const [modalApp, setModalApp] = React.useState<AppWithInfluencer | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<'pending' | 'accepted' | 'rejected'>('pending');

  const fetchData = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: campaignsData } = await supabase.from('campaigns').select('id, title').eq('brand_id', user.id);
    setCampaigns(campaignsData || []);

    let query = supabase.from('applications').select('*, campaign:campaigns(*)').eq('brand_id', user.id);
    if (selectedCampaign) query = query.eq('campaign_id', selectedCampaign);

    const { data } = await query.order('created_at', { ascending: false });

    if (data) {
      const enriched = await Promise.all(data.map(async (app) => {
        const { data: influencer } = await supabase
          .from('influencer_profiles')
          .select('*, profiles:user_id(full_name, email)')
          .eq('user_id', app.influencer_id)
          .single();
        return { ...app, influencer };
      }));
      setApplications(enriched);
    }
    setIsLoading(false);
  }, [selectedCampaign]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleAccept = async (app: AppWithInfluencer) => {
    setProcessingId(app.id);
    try {
      await supabase.from('applications').update({ status: 'accepted' }).eq('id', app.id);
      await supabase.from('deals').insert({
        campaign_id: app.campaign_id,
        application_id: app.id,
        influencer_id: app.influencer_id,
        brand_id: app.brand_id,
        title: app.campaign?.title || 'Campaign Deal',
        description: `Deal for ${app.campaign?.title}`,
        amount: app.proposed_price || app.campaign?.budget || 0,
        status: 'active',
      });

      const { data: existingConvo } = await supabase.from('conversations').select('id')
        .or(`and(participant_1.eq.${app.brand_id},participant_2.eq.${app.influencer_id}),and(participant_1.eq.${app.influencer_id},participant_2.eq.${app.brand_id})`)
        .single();
      if (!existingConvo) {
        await supabase.from('conversations').insert({
          type: 'campaign', participant_1: app.brand_id, participant_2: app.influencer_id, campaign_id: app.campaign_id,
        });
      }

      await supabase.from('notifications').insert({
        user_id: app.influencer_id, type: 'application_accepted',
        title: 'Application Accepted!',
        message: `Your application for "${app.campaign?.title}" has been accepted!`,
        link: '/influencer/deals',
      });

      await fetchData();
      setModalApp(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: AppWithInfluencer) => {
    setProcessingId(app.id);
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', app.id);
    await supabase.from('notifications').insert({
      user_id: app.influencer_id, type: 'application_rejected',
      title: 'Application Update',
      message: `Your application for "${app.campaign?.title}" was not accepted this time.`,
    });
    await fetchData();
    setProcessingId(null);
    if (modalApp?.id === app.id) setModalApp(null);
  };

  const grouped = {
    pending: applications.filter(a => a.status === 'pending'),
    accepted: applications.filter(a => a.status === 'accepted'),
    rejected: applications.filter(a => a.status === 'rejected'),
  };

  const shown = grouped[tab];

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {applications.length === 0 ? 'No applications yet' : `${applications.length} total · ${grouped.pending.length} pending review`}
          </p>
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={1}
        className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm pr-8 appearance-none focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="">All campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-zinc-800/60 rounded-xl p-1">
          {(['pending', 'accepted', 'rejected'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)} {grouped[t].length > 0 && <span className={`ml-1 ${tab === t ? 'text-zinc-600' : 'text-zinc-600'}`}>({grouped[t].length})</span>}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Application list */}
      {shown.length === 0 ? (
        <motion.div variants={fade} initial="hidden" animate="visible" custom={2}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-10 text-center">
          <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-sm">No {tab} applications{selectedCampaign ? ' for this campaign' : ''}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {shown.map((app, i) => (
            <motion.div key={app.id} variants={fade} initial="hidden" animate="visible" custom={i + 2}
              className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-4 hover:border-zinc-700/80 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <Avatar name={app.influencer?.profiles?.full_name} url={app.influencer?.avatar_url} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{app.influencer?.profiles?.full_name || 'Creator'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[app.status] || statusStyles.rejected}`}>{app.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-zinc-500">
                      {app.influencer?.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.influencer.city}</span>}
                      {app.influencer?.instagram_followers > 0 && (
                        <span className="flex items-center gap-1"><IgIcon className="h-3 w-3" />{fmtFollowers(app.influencer.instagram_followers)}</span>
                      )}
                      {app.influencer?.youtube_subscribers > 0 && (
                        <span className="flex items-center gap-1"><YtIcon className="h-3 w-3" />{fmtFollowers(app.influencer.youtube_subscribers)}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(app.created_at)}</span>
                    </div>
                    {app.campaign?.title && (
                      <p className="text-xs text-zinc-600 mt-0.5 truncate max-w-xs">for: {app.campaign.title}</p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                  {app.proposed_price && (
                    <span className="text-xs font-semibold text-white flex items-center gap-0.5">
                      <IndianRupee className="h-3 w-3" />{app.proposed_price.toLocaleString('en-IN')}
                    </span>
                  )}

                  <button onClick={() => setModalApp(app)}
                    className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(app)} disabled={processingId === app.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs font-medium transition-colors disabled:opacity-40">
                        <Check className="h-3.5 w-3.5" />Accept
                      </button>
                      <button onClick={() => handleReject(app)} disabled={processingId === app.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors disabled:opacity-40">
                        <X className="h-3.5 w-3.5" />Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message preview */}
              {app.message && (
                <p className="mt-3 text-xs text-zinc-500 bg-zinc-800/60 rounded-xl p-3 line-clamp-2 border-l-2 border-zinc-700 italic">
                  "{app.message}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {modalApp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalApp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h3 className="font-semibold text-white">Application Details</h3>
                <button onClick={() => setModalApp(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Profile header */}
                <div className="flex items-center gap-4 p-4 bg-zinc-800/60 rounded-xl">
                  <Avatar name={modalApp.influencer?.profiles?.full_name} url={modalApp.influencer?.avatar_url} />
                  <div>
                    <p className="font-semibold text-white">{modalApp.influencer?.profiles?.full_name || 'Creator'}</p>
                    {modalApp.influencer?.city && <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{modalApp.influencer.city}</p>}
                  </div>
                  <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[modalApp.status] || statusStyles.rejected}`}>{modalApp.status}</span>
                </div>

                {/* Stats */}
                {(modalApp.influencer?.instagram_followers > 0 || modalApp.influencer?.youtube_subscribers > 0) && (
                  <div className="grid grid-cols-2 gap-3">
                    {modalApp.influencer?.instagram_followers > 0 && (
                      <div className="p-3 bg-zinc-800/60 rounded-xl">
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mb-1"><IgIcon className="h-3 w-3" />Instagram</p>
                        <p className="font-semibold text-white text-sm">{fmtFollowers(modalApp.influencer.instagram_followers)} followers</p>
                      </div>
                    )}
                    {modalApp.influencer?.youtube_subscribers > 0 && (
                      <div className="p-3 bg-zinc-800/60 rounded-xl">
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mb-1"><YtIcon className="h-3 w-3" />YouTube</p>
                        <p className="font-semibold text-white text-sm">{fmtFollowers(modalApp.influencer.youtube_subscribers)} subs</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                {modalApp.influencer?.bio && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Bio</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{modalApp.influencer.bio}</p>
                  </div>
                )}

                {/* Niches */}
                {modalApp.influencer?.niche?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Niches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {modalApp.influencer.niche.map((n: string) => (
                        <span key={n} className="px-2.5 py-1 rounded-full border border-zinc-700 text-xs text-zinc-300">{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application message */}
                {modalApp.message && (
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Their Message</p>
                    <p className="text-sm text-zinc-300 bg-zinc-800/60 rounded-xl p-3 leading-relaxed italic">"{modalApp.message}"</p>
                  </div>
                )}

                {/* Proposed price */}
                {modalApp.proposed_price && (
                  <div className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl">
                    <span className="text-sm text-zinc-400">Proposed fee</span>
                    <span className="font-semibold text-white flex items-center gap-0.5"><IndianRupee className="h-4 w-4" />{modalApp.proposed_price.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* For campaign */}
                {modalApp.campaign?.title && (
                  <div className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl">
                    <span className="text-sm text-zinc-400">For campaign</span>
                    <span className="font-semibold text-white text-sm">{modalApp.campaign.title}</span>
                  </div>
                )}
              </div>

              {/* Modal actions */}
              {modalApp.status === 'pending' && (
                <div className="flex gap-3 px-6 py-4 border-t border-zinc-800">
                  <button onClick={() => handleAccept(modalApp)} disabled={processingId === modalApp.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm">
                    {processingId === modalApp.id ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing...</> : <><Check className="h-4 w-4" />Accept Application</>}
                  </button>
                  <button onClick={() => handleReject(modalApp)} disabled={processingId === modalApp.id}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50 text-sm">
                    <X className="h-4 w-4" />Reject
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrandApplicationsPage() {
  return (
    <React.Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>}>
      <BrandApplicationsContent />
    </React.Suspense>
  );
}
