'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import {
  LayoutDashboard, Briefcase, Handshake, User, Bell,
  MessageCircle, Menu, X, Sparkles, LogOut, Users,
  FileText, ChevronLeft, Search
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'influencer' | 'brand';
  user: { id: string; email: string; full_name?: string; avatar_url?: string };
  profile: { is_complete?: boolean; company_name?: string; city?: string; niche?: string[] };
}

const influencerNav: NavItem[] = [
  { label: 'Dashboard', href: '/influencer', icon: LayoutDashboard },
  { label: 'Find Deals', href: '/influencer/campaigns', icon: Briefcase },
  { label: 'My Deals', href: '/influencer/deals', icon: Handshake },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'AI Assistant', href: '/ai', icon: Sparkles },
  { label: 'Profile', href: '/influencer/profile', icon: User },
];

const brandNav: NavItem[] = [
  { label: 'Dashboard', href: '/brand', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/brand/campaigns', icon: FileText },
  { label: 'Applications', href: '/brand/applications', icon: Users },
  { label: 'Deals', href: '/brand/deals', icon: Handshake },
  { label: 'Find Creators', href: '/influencers', icon: Search },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'AI Assistant', href: '/ai', icon: Sparkles },
  { label: 'Profile', href: '/brand/profile', icon: User },
];

export function DashboardLayout({ children, userType, user, profile }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navItems = userType === 'influencer' ? influencerNav : brandNav;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = profile?.company_name || user.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-black flex">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen bg-zinc-950 border-r border-zinc-800/60 z-40 transition-all duration-300',
        isSidebarOpen ? 'w-60' : 'w-[68px]'
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800/60 shrink-0">
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shrink-0">
                <span className="text-sm font-black text-black">RYI</span>
              </div>
              <span className="font-semibold text-white text-sm">ReachYourInfluencer</span>
            </Link>
          ) : (
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white mx-auto">
              <span className="text-sm font-black text-black">R</span>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors shrink-0',
              !isSidebarOpen && 'hidden'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/influencer' && item.href !== '/brand' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                  !isSidebarOpen && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="p-3 border-t border-zinc-800/60 shrink-0 space-y-1">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-full flex items-center justify-center px-2 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
            <Avatar src={user.avatar_url} fallback={displayName} size="sm" />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-zinc-500 truncate capitalize">{userType}</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-800/60 flex flex-col">
            <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800/60">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <span className="text-sm font-black text-black">RYI</span>
                </div>
                <span className="font-semibold text-white text-sm">ReachYourInfluencer</span>
              </Link>
              <button onClick={() => setIsMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/influencer' && item.href !== '/brand' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-zinc-800/60 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar src={user.avatar_url} fallback={displayName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-zinc-500 capitalize">{userType}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors text-sm">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', isSidebarOpen ? 'md:ml-60' : 'md:ml-[68px]')}>
        {/* Mobile top bar */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 border-b border-zinc-800/60 bg-zinc-950 sticky top-0 z-30">
          <button onClick={() => setIsMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <span className="text-xs font-black text-black">RYI</span>
            </div>
          </Link>
          <Link href="/notifications" className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800">
            <Bell className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
