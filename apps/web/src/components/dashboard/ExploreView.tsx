'use client';

import React from 'react';
import { Compass } from 'lucide-react';

export default function ExploreView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
        <Compass className="h-12 w-12 text-indigo-500" />
      </div>
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-tighter">Explore Mode</h2>
      <p className="text-zinc-500 max-w-md mb-8 text-lg">
        Explore is coming soon! This section will allow you to discover hackathons and communities in a whole new way.
      </p>
    </div>
  );
}
