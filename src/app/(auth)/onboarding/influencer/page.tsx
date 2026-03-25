'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button, Input, Textarea, Select, Card, CardContent, Checkbox } from '@/components/ui';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

export default function InfluencerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  
  const [formData, setFormData] = React.useState({
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

  const [nicheSearch, setNicheSearch] = React.useState('');

  const filteredNiches = CONTENT_NICHES.filter(
    niche => niche.toLowerCase().includes(nicheSearch.toLowerCase()) && !formData.niche.includes(niche)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('influencer_profiles').update({
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
        is_complete: true,
      }).eq('user_id', user.id);

      if (error) throw error;

      window.location.href = '/influencer';
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.bio && formData.city && formData.niche.length > 0;
      case 2:
        return formData.contentTypes.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-950 to-black">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="mt-2 text-zinc-400">Step {step} of 3 - {step === 1 ? 'Basic Info' : step === 2 ? 'Content & Social' : 'Pricing'}</p>
          
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-white' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <Textarea
                  label="Bio"
                  placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                  value={formData.bio}
                  onChange={handleChange}
                  name="bio"
                />

                <Select
                  label="City"
                  placeholder="Select your city"
                  options={INDIAN_CITIES.map(city => ({ value: city, label: city }))}
                  value={formData.city}
                  onChange={handleChange}
                  name="city"
                />

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Content Niche (Select up to 5)
                  </label>
                  <Input
                    placeholder="Search niches..."
                    value={nicheSearch}
                    onChange={(e) => setNicheSearch(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filteredNiches.slice(0, 12).map((niche) => (
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
                  {formData.niche.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.niche.map((niche) => (
                          <span
                            key={niche}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full"
                          >
                            {niche}
                            <button type="button" onClick={() => toggleNiche(niche)}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Social Media Handles</h3>
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
                  <div className="grid grid-cols-2 gap-4 mt-4">
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
                    className="mt-4"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Content Types You Create</h3>
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
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Pricing</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Set your price per post. Brands will see this when reviewing your application.
                  </p>
                  <Input
                    label="Price per Post (INR)"
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.pricePerPost}
                    onChange={handleChange}
                    name="pricePerPost"
                  />
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Profile Preview</h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p><span className="text-zinc-500">Bio:</span> {formData.bio || 'Not set'}</p>
                    <p><span className="text-zinc-500">Location:</span> {formData.city || 'Not set'}</p>
                    <p><span className="text-zinc-500">Niches:</span> {formData.niche.join(', ') || 'Not set'}</p>
                    <p><span className="text-zinc-500">Content Types:</span> {formData.contentTypes.join(', ') || 'Not set'}</p>
                    <p><span className="text-zinc-500">Price:</span> ₹{formData.pricePerPost || 'Not set'} per post</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/influencer')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step > 1 ? 'Back' : 'Skip'}
              </Button>
              
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                >
                  Complete Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
