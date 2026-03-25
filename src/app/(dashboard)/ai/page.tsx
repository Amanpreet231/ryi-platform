'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sparkles, Copy, Check, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui';
import { CONTENT_TYPES } from '@/lib/utils';

export default function AIAssistantPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  const [formData, setFormData] = React.useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    campaignType: '',
    influencerNiche: '',
    influencerBio: '',
    influencerFollowers: '',
    contentType: 'Instagram Reels',
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile?.user_type === 'influencer') {
      const { data: infProfile } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (infProfile) {
        setFormData(prev => ({
          ...prev,
          influencerNiche: infProfile.niche?.join(', ') || '',
          influencerBio: infProfile.bio || '',
          influencerFollowers: infProfile.instagram_followers 
            ? `${infProfile.instagram_followers} Instagram followers` 
            : infProfile.youtube_subscribers 
              ? `${infProfile.youtube_subscribers} YouTube subscribers`
              : '',
        }));
      }
    }

    setIsLoadingProfile(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.content);
      } else {
        setGeneratedContent(`Error: ${data.error || 'Failed to generate content. Please try again.'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedContent('Error: Failed to connect to AI service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedContent('');
    setFormData({
      productName: '',
      productDescription: '',
      targetAudience: '',
      campaignType: '',
      influencerNiche: formData.influencerNiche,
      influencerBio: formData.influencerBio,
      influencerFollowers: formData.influencerFollowers,
      contentType: 'Instagram Reels',
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Promotion Assistant</h1>
          <p className="text-zinc-400">Get creative content ideas and scripts for your brand collaborations</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-lg">🏷️</span> Product Details
            </h3>

            <Input
              label="Product/Brand Name"
              name="productName"
              placeholder="e.g., GlowUp Skincare"
              value={formData.productName}
              onChange={handleChange}
            />

            <Textarea
              label="Product Description"
              name="productDescription"
              placeholder="What is this product? What makes it unique?"
              value={formData.productDescription}
              onChange={handleChange}
            />

            <Input
              label="Target Audience"
              name="targetAudience"
              placeholder="e.g., Women aged 18-30 interested in skincare"
              value={formData.targetAudience}
              onChange={handleChange}
            />

            <Input
              label="Campaign Type"
              name="campaignType"
              placeholder="e.g., Product Review, Brand Awareness, Sale Promo"
              value={formData.campaignType}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-lg">👤</span> Your Profile (Auto-filled)
            </h3>

            <Input
              label="Your Niche"
              name="influencerNiche"
              placeholder="e.g., Fashion, Beauty, Fitness"
              value={formData.influencerNiche}
              onChange={handleChange}
            />

            <Textarea
              label="Your Bio"
              name="influencerBio"
              placeholder="Tell us about yourself"
              value={formData.influencerBio}
              onChange={handleChange}
            />

            <Input
              label="Followers/Subscribers"
              name="influencerFollowers"
              placeholder="e.g., 15K Instagram followers"
              value={formData.influencerFollowers}
              onChange={handleChange}
            />

            <Select
              label="Content Type"
              name="contentType"
              options={CONTENT_TYPES.map(t => ({ value: t, label: t }))}
              value={formData.contentType}
              onChange={handleChange}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !formData.productName || !formData.productDescription}
          isLoading={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content Ideas
        </Button>
        
        {generatedContent && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {generatedContent && (
        <Card className="border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Generated Content
              </h3>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {generatedContent.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('**')) {
                    return (
                      <p key={i} className="font-semibold text-purple-300 mt-3">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="ml-4">
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  return (
                    <p key={i} className="my-1">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedContent && !isLoading && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Ready to Create Amazing Content?</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Fill in the details on the left and click &quot;Generate Content Ideas&quot; to get AI-powered 
              promotion strategies and ready-to-use scripts for your brand collaborations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
