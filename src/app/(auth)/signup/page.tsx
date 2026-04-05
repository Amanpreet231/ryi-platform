'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Briefcase, Check, ArrowRight, ChevronRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-sm font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white">ReachYourInfluencer</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Join RYI</h1>
          <p className="mt-2 text-zinc-500">Choose how you want to use the platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Creator card */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => router.push('/signup/influencer')}
            className="group text-left bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-7 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200"
          >
            <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Creator</h2>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Find paid brand deals, grow your income, and get paid in 72 hours.
            </p>
            <ul className="space-y-2.5 mb-6">
              {['Find brand deals with 1K+ followers', 'Get paid in 72 hours — guaranteed', 'Keep 90% of every deal'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all">
              Continue as Creator <ArrowRight className="h-4 w-4" />
            </div>
          </motion.button>

          {/* Brand card */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => router.push('/signup/brand')}
            className="group text-left bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm rounded-2xl p-7 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200"
          >
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <Briefcase className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">I&apos;m a Brand</h2>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Find verified micro-influencers by city, niche, and budget. Launch in 48 hours.
            </p>
            <ul className="space-y-2.5 mb-6">
              {['10,000+ verified creators across India', 'Location-based matching', 'Escrow payment protection'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-blue-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all">
              Continue as Brand <ChevronRight className="h-4 w-4" />
            </div>
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-zinc-600"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-300 hover:text-white transition-colors font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
