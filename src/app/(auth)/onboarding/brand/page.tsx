'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Building2, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

const INDUSTRIES = ['Fashion & Apparel', 'Beauty & Cosmetics', 'Food & Beverages', 'Health & Fitness', 'Technology', 'Travel & Tourism', 'Home & Living', 'Sports & Gaming', 'Education', 'Finance', 'Entertainment', 'Automotive', 'Retail', 'Other'];
const COMPANY_SIZES = [{ value: '1-10', label: '1–10 employees' }, { value: '11-50', label: '11–50 employees' }, { value: '51-200', label: '51–200 employees' }, { value: '201-500', label: '201–500 employees' }, { value: '500+', label: '500+ employees' }];
const STEPS = ['Company Info', 'Brand Story'];

export default function BrandOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [step, setStep] = React.useState(1);

  const [formData, setFormData] = React.useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    description: '',
    gstin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const canProceed = () => formData.companyName.trim() && formData.industry && formData.companySize;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { error: err } = await supabase.from('brand_profiles').update({
        company_name: formData.companyName,
        website: formData.website || null,
        industry: formData.industry,
        company_size: formData.companySize,
        description: formData.description,
        gstin: formData.gstin || null,
        is_complete: true,
      }).eq('user_id', user.id);

      if (err) throw err;
      window.location.href = '/brand';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <span className="text-sm font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white">ReachYourInfluencer</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Set Up Your Brand</h1>
          <p className="text-zinc-500 text-sm mt-1">Creators will see this when reviewing your campaigns</p>

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
                    <div className={`h-px w-16 mb-4 transition-colors ${s < step ? 'bg-white' : 'bg-zinc-800'}`} />
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
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Company Information</p>
                    <p className="text-xs text-zinc-500">Tell us about your company</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                  <input name="companyName" placeholder="Fashion Forward Pvt Ltd" value={formData.companyName} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Website</label>
                  <input name="website" type="url" placeholder="https://fashionforward.com" value={formData.website} onChange={handleChange} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Industry <span className="text-red-500">*</span></label>
                    <select name="industry" value={formData.industry} onChange={handleChange} className={inputClass}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Company Size <span className="text-red-500">*</span></label>
                    <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClass}>
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>GSTIN <span className="text-zinc-600 font-normal">(optional)</span></label>
                  <input name="gstin" placeholder="27AABCU9603R1ZM" value={formData.gstin} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Target className="h-4.5 w-4.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">About Your Brand</p>
                    <p className="text-xs text-zinc-500">Help creators understand your brand vision</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Brand Description</label>
                  <p className="text-xs text-zinc-500 mb-2">What do you sell? What are your brand values? What kind of collaborations work best for you?</p>
                  <textarea
                    name="description"
                    rows={5}
                    placeholder="We're a Bangalore-based skincare brand focused on natural ingredients. We're looking for authentic creators who connect with health-conscious audiences..."
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Summary */}
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Brand Preview</p>
                  {[
                    ['Company', formData.companyName || '—'],
                    ['Industry', formData.industry || '—'],
                    ['Size', formData.companySize ? `${formData.companySize} employees` : '—'],
                    ['Website', formData.website || '—'],
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
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/brand')}
                className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {step > 1 ? 'Back' : 'Skip for now'}
              </button>

              {step < 2 ? (
                <button
                  onClick={() => setStep(2)}
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
                    <><CheckCircle2 className="h-4 w-4" />Complete Setup</>
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
