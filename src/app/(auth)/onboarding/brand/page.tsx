'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Globe, Building, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui';

const INDUSTRIES = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverages',
  'Health & Fitness',
  'Technology',
  'Travel & Tourism',
  'Home & Living',
  'Sports & Gaming',
  'Education',
  'Finance',
  'Entertainment',
  'Automotive',
  'Retail',
  'Other',
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function BrandOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  
  const [formData, setFormData] = React.useState({
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    description: '',
    gstin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('brand_profiles').update({
        company_name: formData.companyName,
        website: formData.website || null,
        industry: formData.industry,
        company_size: formData.companySize,
        description: formData.description,
        gstin: formData.gstin || null,
        is_complete: true,
      }).eq('user_id', user.id);

      if (error) throw error;

      window.location.href = '/brand';
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    return formData.companyName && formData.industry && formData.companySize;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-950 to-black">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Set Up Your Brand</h1>
          <p className="mt-2 text-zinc-400">Step {step} of 2 - {step === 1 ? 'Company Details' : 'About Your Brand'}</p>
          
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-24 rounded-full transition-colors ${
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Company Information</h3>
                    <p className="text-sm text-zinc-400">Tell us about your company</p>
                  </div>
                </div>

                <Input
                  label="Company Name"
                  placeholder="Fashion Forward Pvt Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  name="companyName"
                />

                <Input
                  label="Website"
                  type="url"
                  placeholder="https://fashionforward.com"
                  value={formData.website}
                  onChange={handleChange}
                  name="website"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Industry"
                    placeholder="Select industry"
                    options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                    value={formData.industry}
                    onChange={handleChange}
                    name="industry"
                  />

                  <Select
                    label="Company Size"
                    placeholder="Select size"
                    options={COMPANY_SIZES}
                    value={formData.companySize}
                    onChange={handleChange}
                    name="companySize"
                  />
                </div>

                <Input
                  label="GSTIN (Optional)"
                  placeholder="27AABCU9603R1ZM"
                  value={formData.gstin}
                  onChange={handleChange}
                  name="gstin"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">About Your Brand</h3>
                    <p className="text-sm text-zinc-400">Help influencers understand your brand</p>
                  </div>
                </div>

                <Textarea
                  label="Brand Description"
                  placeholder="Tell influencers about your brand, what you sell, your values, and what kind of partnerships you're looking for..."
                  value={formData.description}
                  onChange={handleChange}
                  name="description"
                />

                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Brand Preview</h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p><span className="text-zinc-500">Company:</span> {formData.companyName || 'Not set'}</p>
                    <p><span className="text-zinc-500">Industry:</span> {formData.industry || 'Not set'}</p>
                    <p><span className="text-zinc-500">Size:</span> {formData.companySize || 'Not set'} employees</p>
                    <p><span className="text-zinc-500">Website:</span> {formData.website || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/brand')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step > 1 ? 'Back' : 'Skip'}
              </Button>
              
              {step < 2 ? (
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
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
