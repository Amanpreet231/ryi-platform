import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <span className="text-lg font-bold text-black">RYI</span>
              </div>
              <span className="text-lg font-semibold text-white">RYI</span>
            </div>
            <p className="text-sm text-zinc-400">
              Connecting brands with influencers for meaningful collaborations.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">For Influencers</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/signup/influencer" className="hover:text-white transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/influencer/campaigns" className="hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">For Brands</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/signup/brand" className="hover:text-white transition-colors">
                  Register Brand
                </Link>
              </li>
              <li>
                <Link href="/brand/campaigns" className="hover:text-white transition-colors">
                  Post Campaign
                </Link>
              </li>
              <li>
                <Link href="/influencers" className="hover:text-white transition-colors">
                  Find Influencers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} RYI (ReachYourInfluencer). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
