'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/utils';

const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const sectionClass = "bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5";

export default function BrandProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [logoUrl, setLogoUrl] = React.useState<string>('');

  const [formData, setFormData] = React.useState({
    companyName: '', website: '', industry: '', companySize: '', description: '', gstin: '',
  });

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      setLogoUrl(user.user_metadata?.avatar_url || '');
      const { data: p } = await supabase.from('brand_profiles').select('*').eq('user_id', user.id).single();
      if (p) setFormData({
        companyName: p.company_name || '', website: p.website || '',
        industry: p.industry || '', companySize: p.company_size || '',
        description: p.description || '', gstin: p.gstin || '',
      });
      setIsLoadingData(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (url: string) => {
    setLogoUrl(url);
    if (user) await supabase.auth.updateUser({ data: { avatar_url: url } });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: formData.companyName }).eq('id', user.id);
      await supabase.from('brand_profiles').update({
        company_name: formData.companyName,
        website: formData.website || null,
        industry: formData.industry,
        company_size: formData.companySize,
        description: formData.description,
        gstin: formData.gstin || null,
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

  const initials = formData.companyName ? formData.companyName.slice(0, 2).toUpperCase() : 'B';

  if (isLoadingData) return (
    <div className="space-y-4 max-w-3xl">
      {[...Array(2)].map((_, i) => <div key={i} className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />)}
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
          <h1 className="text-2xl font-bold text-white">Brand Profile</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Update your company information</p>
        </div>
      </motion.div>

      {/* Company info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={sectionClass}>
        {/* Logo */}
        <div className="flex items-center gap-5 pb-2">
          <div className="relative shrink-0">
            {logoUrl
              ? <img src={logoUrl} alt={formData.companyName} className="h-16 w-16 rounded-full object-cover border border-zinc-700" />
              : <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-lg">{initials}</div>
            }
            <div className="absolute -bottom-1 -right-1">
              <ImageUpload userId={user?.id || ''} currentImage={logoUrl} bucket="avatars" folder="brands" onUploadComplete={handleLogoUpload} />
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">{formData.companyName || 'Company Name'}</p>
            <p className="text-sm text-zinc-500">{user?.email}</p>
            <p className="text-xs text-zinc-600 mt-0.5">Click camera to upload logo</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Company Name</label>
          <input name="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input name="website" type="url" placeholder="https://example.com" value={formData.website} onChange={handleChange} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Industry</label>
            <select name="industry" value={formData.industry} onChange={handleChange} className={inputClass}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i: string) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Company Size</label>
            <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClass}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s: { value: string; label: string }) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>GSTIN <span className="text-zinc-600 font-normal">(optional)</span></label>
          <input name="gstin" placeholder="27AABCU9603R1ZM" value={formData.gstin} onChange={handleChange} className={inputClass} />
        </div>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
        <h3 className="font-semibold text-white text-sm">About Your Brand</h3>
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={4} placeholder="Tell influencers about your brand, what you sell, and what kind of partnerships you're looking for..."
            value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} />
        </div>
      </motion.div>

      {/* Status banners */}
      {saveStatus === 'success' && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">Profile updated successfully!</div>
      )}
      {saveStatus === 'error' && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">Error saving profile. Please try again.</div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-end gap-3 pb-2">
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
