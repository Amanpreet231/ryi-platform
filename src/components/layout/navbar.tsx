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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <span className="text-lg font-bold text-black">RYI</span>
              </div>
              <span className="hidden sm:block text-lg font-semibold text-white">ReachYourInfluencer</span>
            </Link>

            {!isLoading && !user && (
              <div className="hidden md:flex items-center gap-6">
                <Link href="/#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isLoading && user && (
              <>
                <Link href="/notifications" className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </Link>
                <Link href="/messages" className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </Link>
              </>
            )}

            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-zinc-800 transition-colors"
                    >
                      <Avatar size="sm" src={user.user_metadata?.avatar_url} fallback={user.email} />
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    </button>

                    {isProfileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileOpen(false)} 
                        />
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl z-50">
                          <div className="px-4 py-2 border-b border-zinc-800">
                            <p className="text-sm font-medium text-white truncate">
                              {user.user_metadata?.full_name || user.email}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/influencer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/influencer/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/signup/influencer">
                      <Button variant="primary">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-zinc-800 py-4 md:hidden">
            <div className="space-y-2">
              <Link
                href="/#features"
                className="block rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="block rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="block rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
