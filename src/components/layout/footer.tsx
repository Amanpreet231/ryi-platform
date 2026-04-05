import Link from 'next/link';
import { Instagram, Twitter, Linkedin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-sm font-black text-black">RYI</span>
              </div>
              <span className="font-semibold text-white">ReachYourInfluencer</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              India&apos;s first fair-pay micro-influencer marketplace. No agencies, no middlemen — just real deals.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">For Creators</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {[
                { label: 'Create Profile', href: '/signup/influencer' },
                { label: 'Browse Brand Deals', href: '/signup/influencer' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'AI Content Tool', href: '/signup/influencer' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Brands */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">For Brands</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {[
                { label: 'Register Brand', href: '/signup/brand' },
                { label: 'Post a Campaign', href: '/signup/brand' },
                { label: 'Find Creators', href: '/signup/brand' },
                { label: 'Pricing', href: '/#pricing' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Contact', href: 'mailto:hello@ryi.in' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <p>&copy; {new Date().getFullYear()} RYI (ReachYourInfluencer). All rights reserved.</p>
          <p className="flex items-center gap-1">Made with ❤️ in Bangalore, India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
