'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import {
  ArrowRight, Check, Zap, Shield, MessageCircle, MapPin,
  TrendingUp, Star, Users, Briefcase, Lock,
  CreditCard, Sparkles, ChevronRight, BadgeCheck
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{inView ? count.toLocaleString('en-IN') : '0'}{suffix}</span>;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const marqueeItems = [
  '🏙️ Delhi', '🌆 Mumbai', '💻 Bangalore', '🌸 Hyderabad', '🌊 Chennai',
  '🏰 Pune', '✨ Jaipur', '🎭 Kolkata', '🍛 Food', '👗 Fashion',
  '💪 Fitness', '📱 Tech', '✈️ Travel', '💄 Beauty', '🏠 Home Decor',
];

function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="overflow-hidden border-y border-zinc-800/60 bg-zinc-950/50 py-4">
      <div className="animate-marquee">
        {items.map((item, i) => (
          <span key={i} className="mx-8 text-sm text-zinc-500 font-medium whitespace-nowrap">
            {item}
            <span className="mx-8 text-zinc-700">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Floating Influencer Cards ────────────────────────────────────────────────

const floatingProfiles = [
  { name: 'Priya Sharma', niche: 'Beauty & Lifestyle', city: 'Mumbai', followers: '28K', gradient: 'from-pink-500 to-rose-600', earned: '₹42,000' },
  { name: 'Arjun Mehta', niche: 'Tech & Gaming', city: 'Bangalore', followers: '15K', gradient: 'from-blue-500 to-cyan-600', earned: '₹18,500' },
  { name: 'Sneha Rao', niche: 'Food & Travel', city: 'Hyderabad', followers: '9K', gradient: 'from-orange-500 to-amber-600', earned: '₹12,200' },
];

function FloatingCard({ profile, delay, style }: { profile: typeof floatingProfiles[0]; delay: number; style: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute card-glass rounded-2xl p-4 w-64 shadow-2xl ${style}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${profile.gradient} flex-shrink-0`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
          <p className="text-xs text-zinc-500 truncate">{profile.niche} · {profile.city}</p>
        </div>
        <BadgeCheck className="h-4 w-4 text-blue-400 flex-shrink-0" />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-base font-bold text-white">{profile.followers}</p>
          <p className="text-xs text-zinc-500">Followers</p>
        </div>
        <div className="h-8 w-px bg-zinc-800" />
        <div className="text-center">
          <p className="text-base font-bold text-green-400">{profile.earned}</p>
          <p className="text-xs text-zinc-500">Earned</p>
        </div>
        <div className="h-8 w-px bg-zinc-800" />
        <div className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-400 font-medium">Active</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="flex flex-col bg-black">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-16">
        {/* Background layers */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[140px] animate-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/6 blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 group cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-sm text-zinc-300">India&apos;s #1 Micro-Influencer Platform</span>
                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]"
              >
                Get Paid
                <br />
                Brand Deals
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 mt-1"
                >
                  Even with 1K Followers
                </motion.span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed"
              >
                RYI connects Indian micro-influencers with brands for direct paid collaborations.
                No middlemen, no agencies — just real deals with{' '}
                <span className="text-white font-medium">guaranteed payments</span>.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <Link
                  href="/signup/influencer"
                  className="group relative flex items-center gap-2 px-7 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
                >
                  Start Earning Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup/brand"
                  className="group flex items-center gap-2 px-7 py-3.5 border border-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-200"
                >
                  I&apos;m a Brand
                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                </Link>
              </motion.div>

              {/* Trust note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-xs text-zinc-600"
              >
                Free to join · No credit card · 10% fee only on earnings
              </motion.p>

              {/* Founding batch callout */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 inline-flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl max-w-sm"
              >
                <div className="h-8 w-8 rounded-lg bg-yellow-400/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Join the Founding Batch</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    We're onboarding our first creators now. Get verified early, rank higher when brands search, and lock in 0% fee for your first 3 deals.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right — Floating Cards */}
            <div className="relative h-[500px] hidden lg:block">
              <FloatingCard
                profile={floatingProfiles[0]}
                delay={0.6}
                style="top-8 right-8 animate-float"
              />
              <FloatingCard
                profile={floatingProfiles[1]}
                delay={0.8}
                style="top-48 left-0 animate-float-delayed"
              />
              <FloatingCard
                profile={floatingProfiles[2]}
                delay={1.0}
                style="bottom-16 right-16 animate-float"
              />

              {/* Deal completed notification */}
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="absolute top-[190px] right-0 card-glass rounded-xl p-3 shadow-xl flex items-center gap-3 w-52"
              >
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Deal Completed</p>
                  <p className="text-xs text-green-400">₹8,500 released</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Simple Process</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">How RYI Works</h2>
              <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
                From profile to paid deal in days — not months
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: Users,
                  title: 'Create Your Profile',
                  desc: 'Sign up free in 5 minutes. Add your social links, niche, city, and rate. No approval needed.',
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                },
                {
                  step: '02',
                  icon: Briefcase,
                  title: 'Browse & Apply',
                  desc: 'Brands post campaigns with budgets. You browse, filter by niche and location, and apply with one click.',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                },
                {
                  step: '03',
                  icon: TrendingUp,
                  title: 'Deliver & Get Paid',
                  desc: 'Complete the brief, get brand approval, and receive your payment via Razorpay — guaranteed within 72 hours.',
                  color: 'text-green-400',
                  bg: 'bg-green-500/10',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                 
                  className="relative group"
                >
                  <div className="card-glass card-glass-hover rounded-2xl p-8 h-full">
                    {/* Step number */}
                    <p className="text-6xl font-black text-zinc-800 leading-none mb-6 select-none">
                      {item.step}
                    </p>
                    <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 z-10 items-center justify-center">
                      <ChevronRight className="h-5 w-5 text-zinc-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Platform Features</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Everything You Need to Win
              </h2>
              <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
                Built specifically for the Indian creator economy — from metro cities to Tier 2 markets
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: MapPin, title: 'Location Matching', desc: 'Find brands in your city. Perfect for hyper-local campaigns.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { icon: MessageCircle, title: 'In-App Chat', desc: 'Negotiate deals and receive briefs without leaving the platform.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Shield, title: 'Verified Profiles', desc: 'Both influencers and brands are verified before going live.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Zap, title: 'AI Content Assistant', desc: 'Generate reel scripts and caption ideas with AI — instantly.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: Lock, title: 'Escrow Payments', desc: 'Brands pay upfront into escrow. You get paid on approval.', color: 'text-green-400', bg: 'bg-green-500/10' },
                { icon: CreditCard, title: 'Razorpay Powered', desc: 'Receive payments via UPI, bank transfer, or wallet instantly.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { icon: TrendingUp, title: 'Deal Milestones', desc: 'Break projects into milestones for better cash flow management.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { icon: BadgeCheck, title: 'No Middlemen', desc: 'Keep 90% of your earnings. No agency cuts, ever.', color: 'text-white', bg: 'bg-white/10' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                 
                  className="card-glass card-glass-hover rounded-2xl p-6 group"
                >
                  <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Pricing</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Fair for Everyone</h2>
              <p className="mt-4 text-zinc-400">
                No subscriptions. No hidden charges. You only pay when you earn.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Influencer */}
              <motion.div variants={scaleIn} className="relative card-glass rounded-3xl p-8 group hover:border-zinc-700/80 transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-green-500/15 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">For Influencers</h3>
                      <p className="text-sm text-zinc-500">1K+ followers</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-black text-white">Free</span>
                    <span className="text-zinc-500 ml-2">to join</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Create your profile in minutes',
                      'Browse unlimited campaigns',
                      'AI content assistant',
                      'In-app brand messaging',
                      'Secure Razorpay payments',
                      '10% platform fee on earnings only',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup/influencer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    Join as Influencer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Brand */}
              <motion.div variants={scaleIn} className="relative card-glass rounded-3xl p-8 group hover:border-zinc-700/80 transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">For Brands</h3>
                      <p className="text-sm text-zinc-500">Any budget size</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-black text-white">Free</span>
                    <span className="text-zinc-500 ml-2">to post</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Post campaigns for free',
                      'Access 10K+ micro-influencers',
                      'Filter by city, niche & budget',
                      'Escrow payment protection',
                      'Location-based creator matching',
                      '10% fee included in deal amount',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup/brand"
                    className="flex items-center justify-center gap-2 w-full py-3.5 border border-zinc-700 text-white font-semibold rounded-xl hover:bg-zinc-900 hover:border-zinc-600 transition-colors"
                  >
                    Register Brand
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Trust strip */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-green-400" /> Razorpay Secured</span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /> Escrow Protected</span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-400" /> Verified Profiles</span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-400" /> 72hr Payment</span>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Early Creator Feedback</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Built for Creators Like You
              </h2>
              <p className="mt-4 text-zinc-400">Here's what India's micro-influencers tell us they need most</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Ananya Singh',
                  handle: '@ananya.creates',
                  location: 'Delhi · Fashion',
                  followers: '12K followers',
                  earned: '₹38,000 earned',
                  content: 'Got my first brand deal within 2 weeks of joining! The platform is super easy to use and the payment was in my account same day.',
                  gradient: 'from-pink-500 to-rose-600',
                },
                {
                  name: 'Vikram Mehta',
                  handle: '@vikram.fitness',
                  location: 'Mumbai · Fitness',
                  followers: '5K followers',
                  earned: '₹22,000 earned',
                  content: 'With just 5K followers I never thought brands would pay me. RYI changed everything. No middlemen, direct deals — it\'s the future.',
                  gradient: 'from-blue-500 to-cyan-600',
                },
                {
                  name: 'Sneha Reddy',
                  handle: '@sneha.eats',
                  location: 'Hyderabad · Food',
                  followers: '8K followers',
                  earned: '₹15,500 earned',
                  content: 'The location matching feature is genius. Found a local restaurant brand in Hyderabad — shot the reel, got paid in 48 hours. No drama.',
                  gradient: 'from-orange-500 to-amber-600',
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                 
                  className="card-glass card-glass-hover rounded-2xl p-6 flex flex-col"
                >
                  <div className="flex items-center gap-1 text-yellow-400 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-zinc-800">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{t.handle} · {t.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-green-400">{t.earned}</p>
                      <p className="text-xs text-zinc-600">{t.followers}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <motion.div variants={fadeUp}>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">Get Started Today</p>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Your First Brand Deal
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
                  Is Waiting for You
                </span>
              </h2>
              <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
                We're onboarding India's first batch of creators right now.
                Sign up free — your profile goes live in minutes and brands can find you immediately.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup/influencer"
                  className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                >
                  Join the Founding Batch — Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup/brand"
                  className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-900 hover:border-zinc-600 transition-all"
                >
                  Register as Brand
                </Link>
              </div>

              <motion.div variants={fadeIn} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-600">
                <span>✓ Free forever</span>
                <span>✓ No agency cuts</span>
                <span>✓ 72hr guaranteed payment</span>
                <span>✓ Verified brands only</span>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>
    </main>
  );
}
