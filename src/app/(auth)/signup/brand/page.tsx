'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function BrandSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '', companyName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName, phone: formData.phone, user_type: 'brand' } },
      });
      if (signUpError) { setError(signUpError.message); setIsLoading(false); return; }
      if (data.user) {
        await supabase.from('profiles').update({ user_type: 'brand', full_name: formData.fullName, phone: formData.phone }).eq('id', data.user.id);
        await supabase.from('brand_profiles').insert({ user_id: data.user.id, company_name: formData.companyName });
        setSuccess(true);
        setTimeout(() => { window.location.href = '/onboarding/brand'; }, 1500);
      }
    } catch { setError('An unexpected error occurred'); setIsLoading(false); }
  };

  const inputClass = "w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:border-zinc-600 focus:outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <span className="text-sm font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white">ReachYourInfluencer</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create brand account</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Start finding creators for your campaigns — free</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm rounded-2xl p-7">
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm mb-5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />Account created! Setting up your profile...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Your Name</label>
                <input name="fullName" type="text" placeholder="Amit Kumar" value={formData.fullName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company Name</label>
                <input name="companyName" type="text" placeholder="Acme Inc." value={formData.companyName} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Work Email</label>
              <input name="email" type="email" placeholder="amit@acme.com" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={formData.password} onChange={handleChange} required className={`${inputClass} pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input name="confirmPassword" type="password" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} />
            </div>

            <button type="submit" disabled={isLoading || success}
              className="w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</>
              ) : 'Create Brand Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
