'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, MessageCircle, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Avatar, Button } from '@/components/ui';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'border-b border-zinc-800/80 bg-black/90 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.04)]'
        : 'border-b border-transparent bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-[0_0_16px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-shadow">
                <span className="text-sm font-black text-black tracking-tight">RYI</span>
              </div>
              <span className="hidden sm:block text-base font-semibold text-white">
                ReachYourInfluencer
              </span>
            </Link>

            {!isLoading && !user && (
              <div className="hidden md:flex items-center gap-1">
                {[
                  { href: '/#features', label: 'Features' },
                  { href: '/#how-it-works', label: 'How It Works' },
                  { href: '/#pricing', label: 'Pricing' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!isLoading && user && (
              <>
                <Link
                  href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-black" />
                </Link>
                <Link
                  href="/messages"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-black" />
                </Link>
              </>
            )}

            {!isLoading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors"
                  >
                    <Avatar size="sm" src={user.user_metadata?.avatar_url} fallback={user.email} />
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl z-50">
                        <div className="px-4 py-3 border-b border-zinc-800/80">
                          <p className="text-sm font-medium text-white truncate">
                            {user.user_metadata?.full_name || 'Creator'}
                          </p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        {[
                          { href: '/influencer', icon: LayoutDashboard, label: 'Dashboard' },
                          { href: '/influencer/profile', icon: User, label: 'Profile' },
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <item.icon className="h-4 w-4 text-zinc-500" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-zinc-800/80 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800/70 hover:text-white transition-colors"
                          >
                            <LogOut className="h-4 w-4 text-zinc-500" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm">Sign In</Button>
                  </Link>
                  <Link href="/signup/influencer">
                    <Button variant="primary" className="text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-zinc-800/60 py-4 md:hidden bg-black/95 backdrop-blur-md">
            <div className="space-y-1">
              {[
                { href: '/#features', label: 'Features' },
                { href: '/#how-it-works', label: 'How It Works' },
                { href: '/#pricing', label: 'Pricing' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-3 px-2 flex flex-col gap-2">
                  <Link href="/signup/influencer" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 bg-white text-black font-semibold rounded-xl text-sm">
                    Join as Influencer
                  </Link>
                  <Link href="/signup/brand" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 border border-zinc-700 text-white font-semibold rounded-xl text-sm">
                    Register as Brand
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
