'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, CardContent, Avatar } from '@/components/ui';
import { ImageUpload } from '@/components/dashboard/image-upload';
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/utils';

const INDUSTRIES_OPTIONS = INDUSTRIES.map((i: string) => ({ value: i, label: i }));
const COMPANY_SIZES_OPTIONS = COMPANY_SIZES;

export default function BrandProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [logoUrl, setLogoUrl] = React.useState<string>('');

  const [formData, setFormData] = React.useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    description: '',
    gstin: '',
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    setLogoUrl(user.user_metadata?.avatar_url || '');

    const { data: profileData } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        companyName: profileData.company_name || '',
        website: profileData.website || '',
        industry: profileData.industry || '',
        companySize: profileData.company_size || '',
        description: profileData.description || '',
        gstin: profileData.gstin || '',
      });
    }

    setIsLoadingData(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (url: string) => {
    setLogoUrl(url);
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
        full_name: formData.companyName,
      }).eq('id', user.id);

      await supabase.from('brand_profiles').update({
        company_name: formData.companyName,
        website: formData.website || null,
        industry: formData.industry,
        company_size: formData.companySize,
        description: formData.description,
        gstin: formData.gstin || null,
      }).eq('user_id', user.id);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
          <h1 className="text-2xl font-bold text-white">Brand Profile</h1>
          <p className="text-zinc-400">Update your company information</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar 
                src={logoUrl}
                fallback={formData.companyName}
                size="2xl"
              />
              <div className="absolute -bottom-2 -right-2">
                <ImageUpload
                  userId={user?.id || ''}
                  currentImage={logoUrl}
                  bucket="avatars"
                  folder="brands"
                  onUploadComplete={handleLogoUpload}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white">{formData.companyName}</h3>
              <p className="text-sm text-zinc-400">{user?.email}</p>
              <p className="text-xs text-zinc-500 mt-1">Click the camera icon to upload logo</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />

            <Input
              label="Website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Industry"
                options={INDUSTRIES_OPTIONS}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                name="industry"
              />

              <Select
                label="Company Size"
                options={COMPANY_SIZES_OPTIONS}
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                name="companySize"
              />
            </div>

            <Input
              label="GSTIN (Optional)"
              name="gstin"
              placeholder="27AABCU9603R1ZM"
              value={formData.gstin}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-4">About Your Brand</h3>
          <Textarea
            label="Description"
            name="description"
            placeholder="Tell influencers about your brand, what you sell, and what kind of partnerships you're looking for..."
            value={formData.description}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      {saveStatus === 'success' && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
          Profile updated successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          Error saving profile. Please try again.
        </div>
      )}
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
