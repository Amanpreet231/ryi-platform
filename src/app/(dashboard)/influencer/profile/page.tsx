'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const sectionClass = "bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5";

export default function InfluencerProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');

  const [formData, setFormData] = React.useState({
    fullName: '', bio: '', city: '', niche: [] as string[],
    instagramHandle: '', instagramFollowers: '',
    youtubeHandle: '', youtubeSubscribers: '',
    twitterHandle: '', contentTypes: [] as string[], pricePerPost: '',
  });

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      const { data: p } = await supabase.from('influencer_profiles').select('*').eq('user_id', user.id).single();
      if (p) setFormData({
        fullName: user.user_metadata?.full_name || '',
        bio: p.bio || '', city: p.city || '', niche: p.niche || [],
        instagramHandle: p.instagram_handle || '', instagramFollowers: p.instagram_followers?.toString() || '',
        youtubeHandle: p.youtube_handle || '', youtubeSubscribers: p.youtube_subscribers?.toString() || '',
        twitterHandle: p.twitter_handle || '', contentTypes: p.content_types || [],
        pricePerPost: p.price_per_post?.toString() || '',
      });
      setIsLoadingData(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleNiche = (n: string) => setFormData(prev => ({
    ...prev, niche: prev.niche.includes(n) ? prev.niche.filter(x => x !== n) : prev.niche.length < 5 ? [...prev.niche, n] : prev.niche
  }));

  const toggleContentType = (t: string) => setFormData(prev => ({
    ...prev, contentTypes: prev.contentTypes.includes(t) ? prev.contentTypes.filter(x => x !== t) : [...prev.contentTypes, t]
  }));

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url);
    if (user) await supabase.auth.updateUser({ data: { avatar_url: url } });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: formData.fullName }).eq('id', user.id);
      await supabase.from('influencer_profiles').update({
        bio: formData.bio, city: formData.city, niche: formData.niche,
        instagram_handle: formData.instagramHandle || null,
        instagram_followers: formData.instagramFollowers ? parseInt(formData.instagramFollowers) : null,
        youtube_handle: formData.youtubeHandle || null,
        youtube_subscribers: formData.youtubeSubscribers ? parseInt(formData.youtubeSubscribers) : null,
        twitter_handle: formData.twitterHandle || null,
        content_types: formData.contentTypes,
        price_per_post: formData.pricePerPost ? parseInt(formData.pricePerPost) : null,
      }).eq('user_id', user.id);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = formData.fullName ? formData.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  if (isLoadingData) return (
    <div className="space-y-4 max-w-3xl">
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="h-9 w-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Update your creator profile</p>
        </div>
      </motion.div>

      {/* Basic info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={sectionClass}>
        {/* Avatar */}
        <div className="flex items-center gap-5 pb-2">
          <div className="relative shrink-0">
            {avatarUrl
              ? <img src={avatarUrl} alt={formData.fullName} className="h-16 w-16 rounded-full object-cover border border-zinc-700" />
              : <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-lg">{initials}</div>
            }
            <div className="absolute -bottom-1 -right-1">
              <ImageUpload userId={user?.id || ''} currentImage={avatarUrl} bucket="avatars" folder="profiles" onUploadComplete={handleAvatarUpload} />
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">{formData.fullName || 'Your Name'}</p>
            <p className="text-sm text-zinc-500">{user?.email}</p>
            <p className="text-xs text-zinc-600 mt-0.5">Click camera to upload photo</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea name="bio" rows={3} placeholder="Tell brands about yourself..." value={formData.bio} onChange={handleChange} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <select name="city" value={formData.city} onChange={handleChange} className={inputClass}>
            <option value="">Select city</option>
            {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Content Niche <span className="text-zinc-600 font-normal">(up to 5)</span></label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
            {CONTENT_NICHES.map(n => (
              <button key={n} type="button" onClick={() => toggleNiche(n)}
                disabled={!formData.niche.includes(n) && formData.niche.length >= 5}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors disabled:opacity-40 ${formData.niche.includes(n) ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Social media */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
        <h3 className="font-semibold text-white text-sm">Social Media</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Instagram Handle</label>
            <input name="instagramHandle" placeholder="@username" value={formData.instagramHandle} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Followers</label>
            <input name="instagramFollowers" type="number" placeholder="50000" value={formData.instagramFollowers} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>YouTube Channel</label>
            <input name="youtubeHandle" placeholder="channel name" value={formData.youtubeHandle} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subscribers</label>
            <input name="youtubeSubscribers" type="number" placeholder="10000" value={formData.youtubeSubscribers} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Twitter / X</label>
          <input name="twitterHandle" placeholder="@username" value={formData.twitterHandle} onChange={handleChange} className={inputClass} />
        </div>
      </motion.div>

      {/* Content & pricing */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={sectionClass}>
        <h3 className="font-semibold text-white text-sm">Content & Pricing</h3>
        <div>
          <label className={labelClass}>Content Types You Create</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(t => (
              <button key={t} type="button" onClick={() => toggleContentType(t)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${formData.contentTypes.includes(t) ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Price per Post (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
            <input name="pricePerPost" type="number" placeholder="5000" value={formData.pricePerPost} onChange={handleChange} className={`${inputClass} pl-8`} />
          </div>
        </div>
      </motion.div>

      {/* Status banner */}
      {saveStatus === 'success' && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">Profile updated successfully!</div>
      )}
      {saveStatus === 'error' && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">Error saving profile. Please try again.</div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end gap-3 pb-2">
        <button onClick={() => router.back()}
          className="px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm font-medium transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm">
          {isSaving ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
        </button>
      </motion.div>
    </div>
  );
}
