'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, AlertCircle, IndianRupee, Calendar, MapPin, Tag, FileText } from 'lucide-react';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const sectionClass = "bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5";

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleContentType = (type: string) => {
    setSelectedContentTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => {
      if (prev.includes(niche)) return prev.filter(n => n !== niche);
      if (prev.length >= 5) return prev;
      return [...prev, niche];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Campaign title is required.'); return; }
    if (!formData.description.trim()) { setError('Campaign description is required.'); return; }
    if (!formData.budget || parseInt(formData.budget) <= 0) { setError('Please enter a valid budget.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { error: insertError } = await supabase.from('campaigns').insert({
        brand_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        budget: parseInt(formData.budget),
        deadline: formData.deadline || null,
        location: formData.location || null,
        niche: selectedNiches,
        content_type: selectedContentTypes,
        status: 'open',
        application_count: 0,
      });

      if (insertError) throw insertError;
      router.push('/brand/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="h-9 w-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">New Campaign</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Post a campaign to find the right creators</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        {/* Campaign Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
          className={sectionClass}>
          <div className="flex items-center gap-2.5 pb-1">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <p className="font-semibold text-white text-sm">Campaign Details</p>
          </div>

          <div>
            <label className={labelClass}>Campaign Title <span className="text-red-500">*</span></label>
            <input name="title" placeholder="e.g. Summer Fashion Collection Launch" value={formData.title} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-red-500">*</span></label>
            <textarea name="description" rows={4} placeholder="Describe your brand, the campaign goal, and what kind of content you're looking for..." value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            <p className="text-xs text-zinc-600 mt-1">{formData.description.length} characters — be specific to attract the right creators</p>
          </div>

          <div>
            <label className={labelClass}>Content Requirements <span className="text-zinc-600 font-normal">(optional)</span></label>
            <textarea name="requirements" rows={3} placeholder="e.g. 30-second Reel, mention brand name twice, include link in bio for 48 hours..." value={formData.requirements} onChange={handleChange} className={`${inputClass} resize-none`} />
          </div>
        </motion.div>

        {/* Budget & Timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
          className={sectionClass}>
          <div className="flex items-center gap-2.5 pb-1">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-green-400" />
            </div>
            <p className="font-semibold text-white text-sm">Budget & Timeline</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Budget (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">₹</span>
                <input name="budget" type="number" min="0" placeholder="10000" value={formData.budget} onChange={handleChange} className={`${inputClass} pl-8`} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">Per creator for this campaign</p>
            </div>
            <div>
              <label className={labelClass}>Deadline <span className="text-zinc-600 font-normal">(optional)</span></label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
          className={sectionClass}>
          <div className="flex items-center gap-2.5 pb-1">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-purple-400" />
            </div>
            <p className="font-semibold text-white text-sm">Creator Preferences</p>
          </div>

          <div>
            <label className={labelClass}>Preferred City <span className="text-zinc-600 font-normal">(optional)</span></label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <select name="location" value={formData.location} onChange={handleChange} className={`${inputClass} pl-10`}>
                <option value="">Any location — all of India</option>
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Content Types <span className="text-zinc-600 font-normal">(select all that apply)</span></label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(type => (
                <button key={type} type="button" onClick={() => toggleContentType(type)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedContentTypes.includes(type) ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Target Niches <span className="text-zinc-600 font-normal">(up to 5)</span></label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {CONTENT_NICHES.map(niche => (
                <button key={niche} type="button" onClick={() => toggleNiche(niche)}
                  disabled={!selectedNiches.includes(niche) && selectedNiches.length >= 5}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors disabled:opacity-40 ${selectedNiches.includes(niche) ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'}`}>
                  {niche}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
          className="flex items-center justify-between gap-4 pt-2">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm">
            {isLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Posting...</>
            ) : 'Post Campaign'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
