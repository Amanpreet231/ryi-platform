'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, CardContent, Avatar } from '@/components/ui';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

export default function InfluencerProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');

  const [formData, setFormData] = React.useState({
    fullName: '',
    bio: '',
    city: '',
    niche: [] as string[],
    instagramHandle: '',
    instagramFollowers: '',
    youtubeHandle: '',
    youtubeSubscribers: '',
    twitterHandle: '',
    contentTypes: [] as string[],
    pricePerPost: '',
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    setAvatarUrl(user.user_metadata?.avatar_url || '');

    const { data: profileData } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        bio: profileData.bio || '',
        city: profileData.city || '',
        niche: profileData.niche || [],
        instagramHandle: profileData.instagram_handle || '',
        instagramFollowers: profileData.instagram_followers?.toString() || '',
        youtubeHandle: profileData.youtube_handle || '',
        youtubeSubscribers: profileData.youtube_subscribers?.toString() || '',
        twitterHandle: profileData.twitter_handle || '',
        contentTypes: profileData.content_types || [],
        pricePerPost: profileData.price_per_post?.toString() || '',
      });
    }

    setIsLoadingData(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleNiche = (niche: string) => {
    if (formData.niche.includes(niche)) {
      setFormData({ ...formData, niche: formData.niche.filter(n => n !== niche) });
    } else if (formData.niche.length < 5) {
      setFormData({ ...formData, niche: [...formData.niche, niche] });
    }
  };

  const toggleContentType = (type: string) => {
    if (formData.contentTypes.includes(type)) {
      setFormData({ ...formData, contentTypes: formData.contentTypes.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, contentTypes: [...formData.contentTypes, type] });
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url);
    if (user) {
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await supabase.from('profiles').update({
        full_name: formData.fullName,
      }).eq('id', user.id);

      await supabase.from('influencer_profiles').update({
        bio: formData.bio,
        city: formData.city,
        niche: formData.niche,
        instagram_handle: formData.instagramHandle || null,
        instagram_followers: formData.instagramFollowers ? parseInt(formData.instagramFollowers) : null,
        youtube_handle: formData.youtubeHandle || null,
        youtube_subscribers: formData.youtubeSubscribers ? parseInt(formData.youtubeSubscribers) : null,
        twitter_handle: formData.twitterHandle || null,
        content_types: formData.contentTypes,
        price_per_post: formData.pricePerPost ? parseInt(formData.pricePerPost) : null,
      }).eq('user_id', user.id);

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-zinc-400">Update your influencer profile</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar 
                src={avatarUrl}
                fallback={formData.fullName}
                size="2xl"
              />
              <div className="absolute -bottom-2 -right-2">
                <ImageUpload
                  userId={user?.id || ''}
                  currentImage={avatarUrl}
                  bucket="avatars"
                  folder="profiles"
                  onUploadComplete={handleAvatarUpload}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white">{formData.fullName}</h3>
              <p className="text-sm text-zinc-400">{user?.email}</p>
              <p className="text-xs text-zinc-500 mt-1">Click the camera icon to upload photo</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />

            <Textarea
              label="Bio"
              name="bio"
              placeholder="Tell brands about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />

            <Select
              label="City"
              options={INDIAN_CITIES.map(city => ({ value: city, label: city }))}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              name="city"
            />

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Content Niche (Select up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_NICHES.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      formData.niche.includes(niche)
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-4">Social Media</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Instagram"
                placeholder="@username"
                value={formData.instagramHandle}
                onChange={handleChange}
                name="instagramHandle"
              />
              <Input
                label="Followers"
                type="number"
                placeholder="e.g. 50000"
                value={formData.instagramFollowers}
                onChange={handleChange}
                name="instagramFollowers"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="YouTube"
                placeholder="channel name"
                value={formData.youtubeHandle}
                onChange={handleChange}
                name="youtubeHandle"
              />
              <Input
                label="Subscribers"
                type="number"
                placeholder="e.g. 10000"
                value={formData.youtubeSubscribers}
                onChange={handleChange}
                name="youtubeSubscribers"
              />
            </div>
            <Input
              label="Twitter/X"
              placeholder="@username"
              value={formData.twitterHandle}
              onChange={handleChange}
              name="twitterHandle"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-4">Content & Pricing</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Content Types You Create
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleContentType(type)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      formData.contentTypes.includes(type)
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Price per Post (INR)"
              type="number"
              placeholder="e.g. 5000"
              value={formData.pricePerPost}
              onChange={handleChange}
              name="pricePerPost"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
