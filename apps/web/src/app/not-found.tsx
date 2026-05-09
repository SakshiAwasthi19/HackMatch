import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <h1 className="text-8xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          404
        </h1>
      </div>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
      >
        Go Home
      </Link>
    </div>
  );
}
