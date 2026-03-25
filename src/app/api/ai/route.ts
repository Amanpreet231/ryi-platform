import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { 
      productName,
      productDescription,
      targetAudience,
      campaignType,
      influencerNiche,
      influencerBio,
      influencerFollowers,
      contentType,
    } = await req.json();

    const systemPrompt = `You are an expert social media marketing consultant specializing in influencer marketing in India. You help influencers create engaging content for brand collaborations. Be creative, specific, and actionable in your suggestions.`;

    const userPrompt = `Help me create content for a brand collaboration:

BRAND/PRODUCT INFO:
- Product Name: ${productName || 'Not specified'}
- Product Description: ${productDescription || 'Not specified'}
- Target Audience: ${targetAudience || 'General audience'}
- Campaign Type: ${campaignType || 'General promotion'}

INFLUENCER PROFILE:
- Niche: ${influencerNiche || 'Not specified'}
- Bio: ${influencerBio || 'Not specified'}
- Followers: ${influencerFollowers || 'Not specified'}
- Content Type: ${contentType || 'Instagram Reels'}

Please provide:
1. **Promotion Strategy** - A clear approach to promote this product (2-3 sentences)
2. **Hook Ideas** - 3 creative opening hooks to grab attention in the first 2 seconds
3. **Script/Talking Points** - A complete ${contentType || 'Instagram Reel'} script with:
   - Opening hook (2-3 seconds)
   - Main content (what to say/do)
   - Call to action
   - Hashtags suggestions
4. **Content Tips** - 2-3 specific tips to make this content perform better

Format your response clearly with headings and bullet points. Keep the script conversational and authentic.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.8,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate content at this time.';

    return NextResponse.json({ success: true, content: response });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
