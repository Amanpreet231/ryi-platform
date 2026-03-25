'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui';
import { CONTENT_NICHES, CONTENT_TYPES, INDIAN_CITIES } from '@/lib/utils';

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleContentType = (type: string) => {
    if (selectedContentTypes.includes(type)) {
      setSelectedContentTypes(selectedContentTypes.filter(t => t !== type));
    } else {
      setSelectedContentTypes([...selectedContentTypes, type]);
    }
  };

  const toggleNiche = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(n => n !== niche));
    } else if (selectedNiches.length < 5) {
      setSelectedNiches([...selectedNiches, niche]);
    }
  };

  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { error: insertError } = await supabase.from('campaigns').insert({
        brand_id: user.id,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || null,
        budget: parseInt(formData.budget),
        deadline: formData.deadline || null,
        location: formData.location || null,
        niche: selectedNiches,
        content_type: selectedContentTypes,
        status: 'open',
      });

      if (insertError) throw insertError;

      window.location.href = '/brand/campaigns';
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Campaign</h1>
          <p className="text-zinc-400">Post a campaign to find influencers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Campaign Details</h3>
            
            <Input
              label="Campaign Title"
              name="title"
              placeholder="e.g., Summer Fashion Collection Launch"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Description"
              name="description"
              placeholder="Describe your campaign, brand, and what you're looking for..."
              value={formData.description}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Requirements"
              name="requirements"
              placeholder="List specific requirements for the content (e.g., 30-second reel, mention brand 3 times, etc.)"
              value={formData.requirements}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Budget & Timeline</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Budget (INR)"
                name="budget"
                type="number"
                placeholder="e.g., 10000"
                value={formData.budget}
                onChange={handleChange}
                required
              />

              <Input
                label="Deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Preferences</h3>
            
            <Select
              label="Preferred Location"
              placeholder="Select city (optional)"
              options={INDIAN_CITIES.map(city => ({ value: city, label: city }))}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              name="location"
            />

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Preferred Content Types
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleContentType(type)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedContentTypes.includes(type)
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Preferred Niches (up to 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_NICHES.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedNiches.includes(niche)
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Campaign
          </Button>
        </div>
      </form>
    </div>
  );
}
