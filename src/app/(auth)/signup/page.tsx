'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Building2, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedType, setSelectedType] = React.useState<'influencer' | 'brand' | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-950 to-black">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-black">RYI</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">Join RYI Today</h1>
          <p className="mt-2 text-zinc-400">Choose how you want to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedType === 'influencer' 
                ? 'border-white ring-1 ring-white' 
                : 'hover:border-zinc-600'
            }`}
            onClick={() => router.push('/signup/influencer')}
          >
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">I&apos;m an Influencer</h2>
              <p className="text-sm text-zinc-400 mb-4">
                Find brand deals, grow your career, and monetize your audience.
              </p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Browse brand campaigns
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Direct brand deals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  AI content suggestions
                </li>
              </ul>
              <Button className="w-full mt-6" variant={selectedType === 'influencer' ? 'primary' : 'secondary'}>
                Continue as Influencer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedType === 'brand' 
                ? 'border-white ring-1 ring-white' 
                : 'hover:border-zinc-600'
            }`}
            onClick={() => router.push('/signup/brand')}
          >
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">I&apos;m a Brand</h2>
              <p className="text-sm text-zinc-400 mb-4">
                Find the perfect influencers for your campaigns and products.
              </p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Post campaigns
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Search influencers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Direct messaging
                </li>
              </ul>
              <Button className="w-full mt-6" variant={selectedType === 'brand' ? 'primary' : 'secondary'}>
                Continue as Brand
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
