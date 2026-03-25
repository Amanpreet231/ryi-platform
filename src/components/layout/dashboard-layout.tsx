'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Avatar, Badge } from '@/components/ui';
import { 
  LayoutDashboard, 
  Briefcase, 
  Handshake, 
  User, 
  Search, 
  Bell,
  MessageCircle,
  ChevronLeft,
  Menu,
  Sparkles
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'influencer' | 'brand';
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  profile: {
    is_complete?: boolean;
    company_name?: string;
    city?: string;
    niche?: string[];
  };
}

export function DashboardLayout({ children, userType, user, profile }: DashboardLayoutProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const influencerNav: NavItem[] = [
    { label: 'Dashboard', href: '/influencer', icon: LayoutDashboard },
    { label: 'Browse Campaigns', href: '/influencer/campaigns', icon: Briefcase },
    { label: 'My Deals', href: '/influencer/deals', icon: Handshake },
    { label: 'AI Assistant', href: '/ai', icon: Sparkles },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Messages', href: '/messages', icon: MessageCircle },
    { label: 'Profile', href: '/influencer/profile', icon: User },
  ];

  const brandNav: NavItem[] = [
    { label: 'Dashboard', href: '/brand', icon: LayoutDashboard },
    { label: 'My Campaigns', href: '/brand/campaigns', icon: Briefcase },
    { label: 'Applications', href: '/brand/applications', icon: Handshake },
    { label: 'Deals', href: '/brand/deals', icon: Handshake },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Messages', href: '/messages', icon: MessageCircle },
    { label: 'Profile', href: '/brand/profile', icon: User },
  ];

  const navItems = userType === 'influencer' ? influencerNav : brandNav;

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <aside
          className={cn(
            'fixed top-0 left-0 z-40 h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300',
            isSidebarOpen ? 'w-64' : 'w-20',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800">
            {isSidebarOpen && (
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <span className="text-sm font-bold text-black">RYI</span>
                </div>
                <span className="font-semibold text-white">RYI</span>
              </Link>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', !isSidebarOpen && 'rotate-180')} />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {item.badge && item.badge > 0 && (
                    <Badge variant="error" className={isSidebarOpen ? 'ml-auto' : 'absolute right-2'}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
            <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
              <Avatar 
                src={user.avatar_url} 
                fallback={user.full_name || user.email} 
                size="sm" 
              />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate capitalize">
                    {userType}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={cn('flex-1 transition-all duration-300', isSidebarOpen ? 'md:ml-64' : 'md:ml-20')}>
          <header className="sticky top-0 z-30 h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
            <div className="flex h-full items-center justify-between px-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 md:gap-4">
                <Link 
                  href="/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <Link 
                  href="/messages"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
