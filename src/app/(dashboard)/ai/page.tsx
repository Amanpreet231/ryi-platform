'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { CONTENT_TYPES } from '@/lib/utils';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const sectionClass = "bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5";

export default function AIAssistantPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  const [formData, setFormData] = React.useState({
    productName: '', productDescription: '', targetAudience: '', campaignType: '',
    influencerNiche: '', influencerBio: '', influencerFollowers: '',
    contentType: 'Instagram Reels',
  });

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile?.user_type === 'influencer') {
        const { data: ip } = await supabase.from('influencer_profiles').select('*').eq('user_id', user.id).single();
        if (ip) {
          setFormData(prev => ({
            ...prev,
            influencerNiche: ip.niche?.join(', ') || '',
            influencerBio: ip.bio || '',
            influencerFollowers: ip.instagram_followers ? `${ip.instagram_followers} Instagram followers`
              : ip.youtube_subscribers ? `${ip.youtube_subscribers} YouTube subscribers` : '',
          }));
        }
      }
      setIsLoadingProfile(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      setGeneratedContent(data.success ? data.content : `Error: ${data.error || 'Failed to generate content.'}`);
    } catch {
      setGeneratedContent('Error: Failed to connect to AI service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedContent('');
    setFormData(prev => ({ ...prev, productName: '', productDescription: '', targetAudience: '', campaignType: '', contentType: 'Instagram Reels' }));
  };

  if (isLoadingProfile) return (
    <div className="space-y-4 max-w-4xl">
      {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Promotion Assistant</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Generate scripts and content ideas for your brand collaborations</p>
        </div>
      </motion.div>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Product details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={sectionClass}>
          <div className="flex items-center gap-2.5 pb-1">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-sm">🏷️</span>
            </div>
            <p className="font-semibold text-white text-sm">Product Details</p>
          </div>
          <div>
            <label className={labelClass}>Product / Brand Name</label>
            <input name="productName" placeholder="e.g., GlowUp Skincare" value={formData.productName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Product Description</label>
            <textarea name="productDescription" rows={3} placeholder="What is this product? What makes it unique?" value={formData.productDescription} onChange={handleChange} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Target Audience</label>
            <input name="targetAudience" placeholder="e.g., Women aged 18-30 interested in skincare" value={formData.targetAudience} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Campaign Type</label>
            <input name="campaignType" placeholder="e.g., Product Review, Brand Awareness, Sale Promo" value={formData.campaignType} onChange={handleChange} className={inputClass} />
          </div>
        </motion.div>

        {/* Creator profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
          <div className="flex items-center gap-2.5 pb-1">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <p className="font-semibold text-white text-sm">Your Profile <span className="text-zinc-600 font-normal">(auto-filled)</span></p>
          </div>
          <div>
            <label className={labelClass}>Your Niche</label>
            <input name="influencerNiche" placeholder="e.g., Fashion, Beauty, Fitness" value={formData.influencerNiche} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Your Bio</label>
            <textarea name="influencerBio" rows={3} placeholder="Tell us about yourself" value={formData.influencerBio} onChange={handleChange} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Followers / Subscribers</label>
            <input name="influencerFollowers" placeholder="e.g., 15K Instagram followers" value={formData.influencerFollowers} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Content Type</label>
            <select name="contentType" value={formData.contentType} onChange={handleChange} className={inputClass}>
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-3">
        <button onClick={handleGenerate} disabled={isLoading || !formData.productName || !formData.productDescription}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 text-sm">
          {isLoading
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</>
            : <><Sparkles className="h-4 w-4" />Generate Content Ideas</>
          }
        </button>
        {generatedContent && (
          <button onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="h-4 w-4" />Reset
          </button>
        )}
      </motion.div>

      {/* Generated content */}
      {generatedContent ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 border border-purple-500/20 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />Generated Content
            </h3>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg text-xs font-medium transition-colors">
              {copied ? <><Check className="h-3.5 w-3.5 text-green-400" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>
          </div>
          <div className="p-6">
            <div className="text-zinc-300 text-sm leading-relaxed space-y-1">
              {generatedContent.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} className="text-base font-bold text-white mt-4 mb-2 first:mt-0">{line.replace(/\*\*/g, '')}</h3>;
                if (line.startsWith('**')) return <p key={i} className="font-semibold text-purple-300 mt-3">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        </motion.div>
      ) : !isLoading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900/60 border border-dashed border-zinc-700 rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-purple-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Ready to create amazing content?</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
            Fill in the product details and click Generate to get AI-powered promotion strategies and ready-to-use scripts.
          </p>
        </motion.div>
      )}
    </div>
  );
}
