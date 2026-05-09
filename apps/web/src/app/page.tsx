'use client';

import dynamic from 'next/dynamic';

const LandingHero = dynamic(() => import('@/components/home/LandingHero'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>
  ),
});

export default function Home() {
  return <LandingHero />;
}
