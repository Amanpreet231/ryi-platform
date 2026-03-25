'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Search, MapPin, Filter, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, Button, Input, Badge, Avatar, Modal, Textarea } from '@/components/ui';
import { formatCurrency, INDIAN_CITIES, CONTENT_NICHES } from '@/lib/utils';
import type { InfluencerProfile } from '@/types';

export default function FindInfluencersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [influencers, setInfluencers] = React.useState<(InfluencerProfile & { profiles?: any })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = React.useState<(InfluencerProfile & { profiles?: any }) | null>(null);
  const [connectionMessage, setConnectionMessage] = React.useState('');
  const [isConnecting, setIsConnecting] = React.useState(false);

  const [filters, setFilters] = React.useState({
    search: '',
    city: '',
    niche: '',
    minFollowers: '',
    maxPrice: '',
  });

  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    const { data } = await supabase
      .from('influencer_profiles')
      .select('*, profiles:user_id(*)')
      .eq('is_complete', true)
      .order('created_at', { ascending: false });

    setInfluencers(data || []);
    setIsLoading(false);
  };

  const filteredInfluencers = influencers.filter((inf) => {
    const profile = inf.profiles;
    const fullName = profile?.full_name?.toLowerCase() || '';
    
    if (filters.search && !fullName.includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.city && inf.city !== filters.city) {
      return false;
    }
    if (filters.niche && !inf.niche?.includes(filters.niche)) {
      return false;
    }
    if (filters.minFollowers && (inf.instagram_followers || 0) < parseInt(filters.minFollowers)) {
      return false;
    }
    if (filters.maxPrice && (inf.price_per_post || 0) > parseInt(filters.maxPrice)) {
      return false;
    }
    return true;
  });

  const handleConnect = async () => {
    if (!selectedInfluencer) return;
    
    setIsConnecting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from('connections').insert({
        sender_id: user.id,
        receiver_id: selectedInfluencer.user_id,
        sender_type: 'brand',
        receiver_type: 'influencer',
        message: connectionMessage || null,
      });

      if (error && error.code !== '23505') throw error;

      await supabase.from('notifications').insert({
        user_id: selectedInfluencer.user_id,
        type: 'new_connection',
        title: 'New Connection Request',
        message: 'A brand wants to connect with you',
        link: '/influencer/connections',
      });

      setSelectedInfluencer(null);
      setConnectionMessage('');
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      niche: '',
      minFollowers: '',
      maxPrice: '',
    });
  };

  const hasActiveFilters = filters.search || filters.city || filters.niche || filters.minFollowers || filters.maxPrice;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Find Influencers</h1>
          <p className="text-zinc-400">{filteredInfluencers.length} influencers available</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1">Active</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-800 grid gap-4 md:grid-cols-4">
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-white"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={filters.niche}
                onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
                className="h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-white"
              >
                <option value="">All Niches</option>
                {CONTENT_NICHES.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Min Followers"
                value={filters.minFollowers}
                onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="md:col-span-4">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredInfluencers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInfluencers.map((influencer) => (
            <Card 
              key={influencer.id}
              className="hover:border-zinc-600 transition-colors cursor-pointer"
              onClick={() => setSelectedInfluencer(influencer)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar 
                    src={influencer.profiles?.avatar_url}
                    fallback={influencer.profiles?.full_name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {influencer.profiles?.full_name || 'Influencer'}
                      </h3>
                      {influencer.is_verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </div>
                    {influencer.city && (
                      <p className="flex items-center gap-1 text-sm text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        {influencer.city}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
                  {influencer.bio || 'No bio available'}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {influencer.niche?.slice(0, 3).map((n) => (
                    <Badge key={n} variant="outline">{n}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex gap-4 text-sm">
                    {influencer.instagram_followers && (
                      <div>
                        <p className="font-semibold text-white">
                          {influencer.instagram_followers >= 1000 
                            ? `${(influencer.instagram_followers / 1000).toFixed(1)}K` 
                            : influencer.instagram_followers}
                        </p>
                        <p className="text-xs text-zinc-500">Instagram</p>
                      </div>
                    )}
                    {influencer.youtube_subscribers && (
                      <div>
                        <p className="font-semibold text-white">
                          {influencer.youtube_subscribers >= 1000 
                            ? `${(influencer.youtube_subscribers / 1000).toFixed(1)}K` 
                            : influencer.youtube_subscribers}
                        </p>
                        <p className="text-xs text-zinc-500">YouTube</p>
                      </div>
                    )}
                  </div>
                  {influencer.price_per_post && (
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(influencer.price_per_post)}/post
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No influencers found</h3>
            <p className="text-zinc-400">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No influencers available at the moment'}
            </p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={!!selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
        title={selectedInfluencer?.profiles?.full_name || 'Influencer Profile'}
        className="max-w-2xl"
      >
        {selectedInfluencer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <Avatar 
                src={selectedInfluencer.profiles?.avatar_url}
                fallback={selectedInfluencer.profiles?.full_name}
                size="xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedInfluencer.profiles?.full_name}
                  </h3>
                  {selectedInfluencer.is_verified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                {selectedInfluencer.city && (
                  <p className="text-sm text-zinc-400">{selectedInfluencer.city}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedInfluencer.instagram_followers && (
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500">Instagram</p>
                  <p className="font-semibold text-white">
                    {selectedInfluencer.instagram_followers.toLocaleString()} followers
                  </p>
                  {selectedInfluencer.instagram_handle && (
                    <p className="text-xs text-zinc-400">{selectedInfluencer.instagram_handle}</p>
                  )}
                </div>
              )}
              {selectedInfluencer.youtube_subscribers && (
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500">YouTube</p>
                  <p className="font-semibold text-white">
                    {selectedInfluencer.youtube_subscribers.toLocaleString()} subscribers
                  </p>
                  {selectedInfluencer.youtube_handle && (
                    <p className="text-xs text-zinc-400">{selectedInfluencer.youtube_handle}</p>
                  )}
                </div>
              )}
            </div>

            {selectedInfluencer.bio && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Bio</h4>
                <p className="text-white">{selectedInfluencer.bio}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Niches</h4>
              <div className="flex flex-wrap gap-2">
                {selectedInfluencer.niche?.map((n) => (
                  <Badge key={n} variant="outline">{n}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Content Types</h4>
              <div className="flex flex-wrap gap-2">
                {selectedInfluencer.content_types?.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </div>

            {selectedInfluencer.price_per_post && (
              <div className="p-4 bg-white/10 rounded-lg text-center">
                <p className="text-sm text-zinc-400">Price per Post</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedInfluencer.price_per_post)}
                </p>
              </div>
            )}

            <Textarea
              label="Message (Optional)"
              placeholder="Introduce yourself and explain why you'd like to collaborate..."
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
            />

            <Button 
              className="w-full" 
              onClick={handleConnect}
              isLoading={isConnecting}
            >
              Send Connection Request
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
