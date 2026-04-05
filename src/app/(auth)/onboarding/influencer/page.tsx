'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

const STEPS = ['Your Profile', 'Social Media', 'Pricing'];

export default function InfluencerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [step, setStep] = React.useState(1);
  const [nicheSearch, setNicheSearch] = React.useState('');

  const [formData, setFormData] = React.useState({
    bio: '',
    city: '',
    niche: [] as string[],
    instagramHandle: '',
    instagramFollowers: '',
    youtubeHandle: '',
    youtubeSubscribers: '',
    twitterHandle: '',
    contentTypes: [] as string[],
    pricePerPost: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleNiche = (niche: string) => {
    if (formData.niche.includes(niche)) {
      setFormData({ ...formData, niche: formData.niche.filter(n => n !== niche) });
    } else if (formData.niche.length < 5) {
      setFormData({ ...formData, niche: [...formData.niche, niche] });
    }
  };

  const toggleContentType = (type: string) => {
    if (formData.contentTypes.includes(type)) {
      setFormData({ ...formData, contentTypes: formData.contentTypes.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, contentTypes: [...formData.contentTypes, type] });
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.bio.trim().length >= 20 && formData.city && formData.niche.length > 0;
    if (step === 2) return formData.contentTypes.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { error: err } = await supabase.from('influencer_profiles').update({
        bio: formData.bio,
        city: formData.city,
        niche: formData.niche,
        instagram_handle: formData.instagramHandle || null,
        instagram_followers: formData.instagramFollowers ? parseInt(formData.instagramFollowers) : null,
        youtube_handle: formData.youtubeHandle || null,
        youtube_subscribers: formData.youtubeSubscribers ? parseInt(formData.youtubeSubscribers) : null,
        twitter_handle: formData.twitterHandle || null,
        content_types: formData.contentTypes,
        price_per_post: formData.pricePerPost ? parseInt(formData.pricePerPost) : null,
        is_complete: true,
      }).eq('user_id', user.id);

      if (err) throw err;
      router.push('/influencer');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNiches = CONTENT_NICHES.filter(
    n => n.toLowerCase().includes(nicheSearch.toLowerCase()) && !formData.niche.includes(n)
  );

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <span className="text-sm font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white">ReachYourInfluencer</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-zinc-500 text-sm mt-1">Brands will see this when reviewing your applications</p>

          {/* Step progress */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${s < step ? 'bg-white text-black' : s === step ? 'bg-white text-black ring-4 ring-white/20' : 'bg-zinc-800 text-zinc-500'}`}>
                      {s < step ? '✓' : s}
                    </div>
                    <span className={`text-xs transition-colors ${s === step ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-12 mb-4 transition-colors ${s < step ? 'bg-white' : 'bg-zinc-800'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm rounded-2xl p-7">
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Bio <span className="text-zinc-600 font-normal">(min 20 chars)</span></label>
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                    value={formData.bio}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                  <p className={`text-xs mt-1 ${formData.bio.length >= 20 ? 'text-green-500' : 'text-zinc-600'}`}>
                    {formData.bio.length}/20 minimum characters
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Your City</label>
                  <select name="city" value={formData.city} onChange={handleChange} className={inputClass}>
                    <option value="">Select your city</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Content Niche <span className="text-zinc-600 font-normal">(up to 5)</span></label>
                  <input
                    placeholder="Search niches..."
                    value={nicheSearch}
                    onChange={(e) => setNicheSearch(e.target.value)}
                    className={`${inputClass} mb-3`}
                  />
                  {formData.niche.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {formData.niche.map((n) => (
                        <span key={n} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white text-black rounded-full font-medium">
                          {n}
                          <button type="button" onClick={() => toggleNiche(n)} className="opacity-60 hover:opacity-100">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {filteredNiches.slice(0, 20).map((niche) => (
                      <button key={niche} type="button" onClick={() => toggleNiche(niche)}
                        disabled={formData.niche.length >= 5}
                        className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40">
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className={labelClass}>Social Media Handles</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Instagram</label>
                        <input name="instagramHandle" placeholder="@username" value={formData.instagramHandle} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Followers</label>
                        <input name="instagramFollowers" type="number" placeholder="50000" value={formData.instagramFollowers} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">YouTube</label>
                        <input name="youtubeHandle" placeholder="channel name" value={formData.youtubeHandle} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Subscribers</label>
                        <input name="youtubeSubscribers" type="number" placeholder="10000" value={formData.youtubeSubscribers} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Twitter / X</label>
                      <input name="twitterHandle" placeholder="@username" value={formData.twitterHandle} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Content Types You Create <span className="text-zinc-600 font-normal">(select at least 1)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((type) => (
                      <button key={type} type="button" onClick={() => toggleContentType(type)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.contentTypes.includes(type) ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Your Rate per Post (₹)</label>
                  <p className="text-xs text-zinc-500 mb-3">Brands see this. You can still negotiate per deal. Typical range: ₹2,000–₹25,000 for micro-influencers.</p>
                  <input name="pricePerPost" type="number" placeholder="e.g. 5000" value={formData.pricePerPost} onChange={handleChange} className={inputClass} />
                </div>

                {/* Profile summary */}
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Profile Summary</p>
                  {[
                    ['City', formData.city || '—'],
                    ['Niches', formData.niche.join(', ') || '—'],
                    ['Content', formData.contentTypes.join(', ') || '—'],
                    ['Rate', formData.pricePerPost ? `₹${parseInt(formData.pricePerPost).toLocaleString('en-IN')}/post` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-zinc-500">{k}</span>
                      <span className="text-white text-right max-w-[60%] truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-7">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/influencer')}
                className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {step > 1 ? 'Back' : 'Skip for now'}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm">
                  {isLoading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" />Complete Profile</>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
