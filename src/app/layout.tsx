import type { Metadata } from 'next';
import './globals.css';
import { Navbar, Footer } from '@/components/layout';

export const metadata: Metadata = {
  title: 'RYI - ReachYourInfluencer | Brand-Influencer Marketplace',
  description: 'Connect with influencers and brands for brand deals. Get paid brand deals even with 1K followers. The easiest way to find brand collaborations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
