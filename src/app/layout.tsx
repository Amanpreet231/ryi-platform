import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar, Footer } from '@/components/layout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ryi-platform.vercel.app'),
  title: {
    default: "Get Paid Brand Deals with 1K Followers | RYI India",
    template: '%s | RYI',
  },
  description:
    "India's #1 micro-influencer marketplace. 10,000+ verified creators, 2,000+ brands, ₹5Cr+ paid out. Join free — no agencies, no middlemen, guaranteed 72hr payments.",
  keywords: [
    'micro influencer platform India',
    'brand deals India',
    'influencer marketing India',
    'get paid brand collaborations',
    'influencer marketplace India',
    'creator economy India',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ryi-platform.vercel.app',
    siteName: 'RYI — ReachYourInfluencer',
    title: 'Get Paid Brand Deals with 1K Followers | RYI India',
    description:
      "India's #1 micro-influencer marketplace. No agencies, direct deals, guaranteed 72hr payments.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RYI — ReachYourInfluencer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Paid Brand Deals with 1K Followers | RYI India',
    description: "India's micro-influencer marketplace. Free to join, 10% fee only on earnings.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://ryi-platform.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className={`min-h-screen bg-black antialiased font-sans ${inter.className}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
