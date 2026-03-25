'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { Spinner } from '@/components/ui';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardProvider({ 
  children, 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [userType, setUserType] = React.useState<'influencer' | 'brand' | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUser({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      });

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserType(profileData.user_type);
        setProfile(profileData);

        if (profileData.user_type === 'influencer') {
          const { data: influencerProfile } = await supabase
            .from('influencer_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          setProfile({ ...profileData, ...influencerProfile });

          if (!influencerProfile?.is_complete && !pathname.includes('/onboarding')) {
            window.location.href = '/onboarding/influencer';
            return;
          }
        } else if (profileData.user_type === 'brand') {
          const { data: brandProfile } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          setProfile({ ...profileData, ...brandProfile });

          if (!brandProfile?.is_complete && !pathname.includes('/onboarding')) {
            window.location.href = '/onboarding/brand';
            return;
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !userType) {
    return null;
  }

  return (
    <DashboardLayout userType={userType} user={user} profile={profile}>
      {children}
    </DashboardLayout>
  );
}
