'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
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

// Bottom nav shows 5 primary items on mobile
const influencerBottomNav: NavItem[] = [
  { label: 'Home', href: '/influencer', icon: LayoutDashboard },
  { label: 'Deals', href: '/influencer/campaigns', icon: Briefcase },
  { label: 'My Deals', href: '/influencer/deals', icon: Handshake },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'More', href: '#more', icon: Menu },
];

const brandBottomNav: NavItem[] = [
  { label: 'Home', href: '/brand', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/brand/campaigns', icon: FileText },
  { label: 'Creators', href: '/influencers', icon: Search },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'More', href: '#more', icon: Menu },
];

function UserAvatar({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="h-7 w-7 rounded-full object-cover border border-zinc-700 shrink-0" />;
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
      {initials}
    </div>
  );
}

export function DashboardLayout({ children, userType, user, profile }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navItems = userType === 'influencer' ? influencerNav : brandNav;
  const bottomNavItems = userType === 'influencer' ? influencerBottomNav : brandBottomNav;

  // Close mobile drawer on route change
  React.useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = profile?.company_name || user.full_name || user.email?.split('@')[0] || 'User';

  const isActive = (href: string) =>
    href === '/influencer' || href === '/brand'
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── Desktop sidebar ── */}
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
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={!isSidebarOpen ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive(item.href)
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
                !isSidebarOpen && 'justify-center px-2'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
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
            <UserAvatar url={user.avatar_url} name={displayName} />
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

      {/* ── Mobile full-screen drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="absolute top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-800/60 flex flex-col"
              style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '18rem' }}
            >
              <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800/60 shrink-0">
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive(item.href) ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-3 border-t border-zinc-800/60 space-y-1 shrink-0">
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar url={user.avatar_url} name={displayName} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                    <p className="text-xs text-zinc-500 capitalize">{userType}</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors text-sm">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        isSidebarOpen ? 'md:ml-60' : 'md:ml-[68px]'
      )}>
        {/* Mobile top bar */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 border-b border-zinc-800/60 bg-zinc-950 sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <span className="text-xs font-black text-black">RYI</span>
            </div>
            <span className="font-semibold text-white text-sm">RYI</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/notifications" className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800">
              <Bell className="h-5 w-5" />
            </Link>
            <button onClick={() => setIsMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content — add bottom padding on mobile for the nav bar */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800/60 flex items-stretch safe-area-inset-bottom">
        {bottomNavItems.map((item) => {
          const active = item.href !== '#more' && isActive(item.href);
          if (item.href === '#more') {
            return (
              <button
                key="more"
                onClick={() => setIsMobileOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-zinc-500 hover:text-white transition-colors"
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors',
                active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-white' : 'text-zinc-500')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
