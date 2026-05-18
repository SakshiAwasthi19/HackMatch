'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Filter } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import ProfileModal from '../shared/ProfileModal';
import ConnectInviteModal from './ConnectInviteModal';
import { apiFetch } from '@/lib/auth-client';
import { Hackathon, SwipeResult, SwipeDeckUser } from '@/lib/types';

interface SwipeViewProps {
  selectedHackathonId: string | null;
  onMatch?: (data: SwipeResult) => void;
}

export default function SwipeView({ selectedHackathonId: initialHackathonId, onMatch }: SwipeViewProps) {
  const [viewingUser, setViewingUser] = useState<SwipeDeckUser | null>(null);
  const [connectingUser, setConnectingUser] = useState<SwipeDeckUser | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [activeHackathonId, setActiveHackathonId] = useState<string | null>(initialHackathonId);

  const fetchHackathons = useCallback(async () => {
    try {
      const res = await apiFetch('/api/hackathons');
      if (res.ok) {
        setHackathons(await res.json());
      }
    } catch (err) {
      console.error('Error fetching hackathons:', err);
    }
  }, []);

  const [prevInitialId, setPrevInitialId] = useState(initialHackathonId);
  if (initialHackathonId !== prevInitialId) {
    setPrevInitialId(initialHackathonId);
    setActiveHackathonId(initialHackathonId);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHackathons();
  }, [fetchHackathons]);

  return (
    <div className="flex-1 w-full flex flex-col px-6 sm:px-8 lg:px-12 py-8 space-y-12 pb-20 items-center">
      {/* Hackathon Filter - Minimalist pill style */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-zinc-600">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filter Network</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar w-full justify-start sm:justify-center">
          <button
            onClick={() => setActiveHackathonId(null)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
              activeHackathonId === null
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-700 hover:text-zinc-400'
            }`}
          >
            Global
          </button>
          {hackathons.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHackathonId(h.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                activeHackathonId === h.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-700 hover:text-zinc-400'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe Area */}
      <div className="w-full flex justify-center py-4">
        <SwipeDeck 
          key={activeHackathonId || 'global'} 
          context={activeHackathonId ? { mode: 'hackathon', hackathonId: activeHackathonId } : { mode: 'explore' }}
          onConnect={(user) => setConnectingUser(user)}
          onMatch={(result) => onMatch?.(result)} 
          onViewProfile={(user) => setViewingUser(user)}
        />
      </div>

      <ProfileModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        user={viewingUser} 
      />

      {connectingUser && (
        <ConnectInviteModal
          isOpen={!!connectingUser}
          onClose={() => setConnectingUser(null)}
          user={connectingUser}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
