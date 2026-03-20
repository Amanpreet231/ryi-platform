"use client";

export default function Home() {
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    await fetch("https://formspree.io/f/xojkbwor", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    window.location.href = "/success";
  };

  return (
    <main className="bg-black text-white min-h-screen">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">RYI</h1>
        <a href="#join">
          <button className="bg-white text-black px-4 py-2 rounded-lg">
            Get Started
          </button>
        </a>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Get Paid Brand Deals <br /> Even with 1K Followers
        </h1>

        <p className="text-gray-400 mb-4 text-lg">
          Connect with real brands. No agencies. No middlemen.
        </p>

        <p className="text-gray-500 mb-8">
          Join 100+ creators already signing up 🔥
        </p>

        <div className="flex gap-4 justify-center">
          <a href="#join">
            <button className="bg-white text-black px-6 py-3 rounded-xl">
              I’m an Influencer
            </button>
          </a>
          <a href="#join">
            <button className="border border-white px-6 py-3 rounded-xl">
              I’m a Brand
            </button>
          </a>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="text-center py-6 text-gray-400 text-sm">
        Trusted by growing creators & local businesses across India 🇮🇳
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="font-semibold mb-2">1. Sign Up</h3>
            <p className="text-gray-400">
              Fill your details in 30 seconds
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="font-semibold mb-2">2. Get Matched</h3>
            <p className="text-gray-400">
              We connect you with the right people
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="font-semibold mb-2">3. Earn & Grow</h3>
            <p className="text-gray-400">
              Close deals and build your network
            </p>
          </div>
        </div>
      </section>

      {/* FORMS */}
      <section id="join" className="py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-4">
          Join ReachYourInfluencer
        </h2>

        <p className="text-center text-gray-400 mb-12">
          Takes less than 1 minute ⏱️
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Influencer */}
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-semibold">Influencer</h3>

            <input name="type" value="influencer" hidden />

            <input name="name" placeholder="Full Name" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="email" type="email" placeholder="Email" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="whatsapp" placeholder="WhatsApp Number" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="instagram" placeholder="Instagram Handle" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="followers" placeholder="Followers" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="niche" placeholder="Niche (Fitness, Tech, Food...)" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="city" placeholder="City" className="w-full p-2 rounded bg-black border border-gray-700" required />

            <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg w-full">
              Get Brand Deals 🚀
            </button>
          </form>

          {/* Brand */}
          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-semibold">Brand</h3>

            <input name="type" value="brand" hidden />

            <input name="business_name" placeholder="Business Name" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="email" type="email" placeholder="Email" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="whatsapp" placeholder="WhatsApp Number" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="product" placeholder="Product / Service" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="budget" placeholder="Budget (₹)" className="w-full p-2 rounded bg-black border border-gray-700" required />
            <input name="city" placeholder="City" className="w-full p-2 rounded bg-black border border-gray-700" required />

            <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg w-full">
              Find Influencers 🔥
            </button>
          </form>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-gray-800 text-gray-500">
        © 2026 ReachYourInfluencer (RYI)
      </footer>

    </main>
  );
}