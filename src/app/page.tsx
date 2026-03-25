import Link from 'next/link';
import { ArrowRight, Check, Zap, Shield, MessageCircle, MapPin, TrendingUp, Star, Users, Briefcase, IndianRupee, Lock, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-zinc-300">India&apos;s #1 Micro-Influencer Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              Get Paid Brand Deals
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                Even with 1K Followers
              </span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              RYI connects micro-influencers with brands for direct collaborations. 
              No middlemen, no agencies. Just real deals that pay.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup/influencer"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
              >
                I&apos;m an Influencer
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signup/brand"
                className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-800 transition-colors"
              >
                I&apos;m a Brand
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-zinc-500">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-sm">Influencers</p>
              </div>
              <div className="w-px h-12 bg-zinc-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">2K+</p>
                <p className="text-sm">Brands</p>
              </div>
              <div className="w-px h-12 bg-zinc-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">₹5Cr+</p>
                <p className="text-sm">Paid to Creators</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            <p className="mt-4 text-zinc-400">Simple, transparent, effective</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Create Profile</h3>
              <p className="text-zinc-400">
                Sign up as an influencer or brand. Add your details, social links, and portfolio.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-6">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Post or Apply</h3>
              <p className="text-zinc-400">
                Brands post campaigns with budgets. Influencers browse and apply to relevant deals.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Collaborate & Earn</h3>
              <p className="text-zinc-400">
                Connect, agree on terms, complete the work, and get paid. Simple as that.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-zinc-400">We keep it fair for everyone</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Influencers</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Create your profile for <span className="text-white font-semibold">FREE</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Browse and apply to unlimited campaigns</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Direct messaging with brands</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Get paid via secure payment gateway</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-yellow-500/20 shrink-0">
                    <IndianRupee className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="text-zinc-300"><span className="text-white font-semibold">10% platform fee</span> on earnings only</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">For Brands</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Register and post campaigns for <span className="text-white font-semibold">FREE</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Access thousands of micro-influencers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Filter by location, niche, and budget</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Secure escrow payment protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-yellow-500/20 shrink-0">
                    <IndianRupee className="h-3 w-3 text-yellow-400" />
                  </div>
                  <span className="text-zinc-300"><span className="text-white font-semibold">10% platform fee</span> included in deal amount</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-zinc-400">
                Powerful features designed for the Indian creator economy
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Location-Based Matching</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Find influencers in your city or target local markets. Perfect for businesses with physical stores.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">In-App Messaging</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Chat directly with brands or influencers. Discuss deals without leaving the platform.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Verified Profiles</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      We verify both influencers and brands. Know who you&apos;re working with.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Content Assistant</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Get AI-generated promotion ideas and reel scripts based on product details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Rahul Sharma</p>
                      <p className="text-sm text-zinc-400">Fashion & Lifestyle • Delhi</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">15K</p>
                      <p className="text-xs text-zinc-500">Followers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Priya Patel</p>
                      <p className="text-sm text-zinc-400">Food & Travel • Mumbai</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">42K</p>
                      <p className="text-xs text-zinc-500">Followers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-white">Amit Kumar</p>
                      <p className="text-sm text-zinc-400">Tech & Gaming • Bangalore</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">8K</p>
                      <p className="text-xs text-zinc-500">Followers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Trusted & Secure
            </h2>
            <p className="mt-4 text-zinc-400">
              Your payments and data are protected
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure Payments</h3>
              <p className="text-sm text-zinc-400">Powered by Razorpay with bank-grade security</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Escrow Protection</h3>
              <p className="text-sm text-zinc-400">Brand pays upfront, influencer paid on completion</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Data Privacy</h3>
              <p className="text-sm text-zinc-400">Your personal data is encrypted and protected</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Trusted by Creators Across India
            </h2>
            <p className="mt-4 text-zinc-400">
              Join thousands of influencers already earning on RYI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Singh',
                handle: '@ananya.creates',
                content: 'Got my first brand deal within 2 weeks of joining! The platform is super easy to use.',
                platform: 'Instagram Reels',
              },
              {
                name: 'Vikram Mehta',
                handle: '@vikram.fitness',
                content: 'As a fitness influencer with 5K followers, I never thought brands would pay me. RYI changed that.',
                platform: 'YouTube Shorts',
              },
              {
                name: 'Sneha Reddy',
                handle: '@sneha.eats',
                content: 'Love the location feature! Found a local restaurant brand in Hyderabad for collaboration.',
                platform: 'Instagram Stories',
              },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-zinc-500">{testimonial.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
            Join RYI today and start earning or finding the perfect influencers for your brand.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup/influencer"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Join as Influencer
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/signup/brand"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-800 transition-colors"
            >
              Register as Brand
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
