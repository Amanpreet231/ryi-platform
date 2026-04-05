import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RYI – ReachYourInfluencer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: '#000' }}>RYI</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>ReachYourInfluencer</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          India's Fair-Pay Micro-Influencer Marketplace
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 24,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: 700,
            marginBottom: 48,
            lineHeight: 1.5,
          }}
        >
          No agencies. No middlemen. Real brand deals for real creators.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['10,000+ Creators', 'Paid in 72 Hours', 'Free to Join'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 50,
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: 600,
                color: '#e4e4e7',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
