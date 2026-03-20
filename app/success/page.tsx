export default function SuccessPage() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 You're In!</h1>
        <p className="text-gray-400 mb-6">
          Thanks for joining ReachYourInfluencer (RYI).
          <br />
          We’ll connect you soon.
        </p>

        <a href="/">
          <button className="bg-white text-black px-6 py-3 rounded-lg">
            Go Back Home
          </button>
        </a>
      </div>
    </div>
  );
}