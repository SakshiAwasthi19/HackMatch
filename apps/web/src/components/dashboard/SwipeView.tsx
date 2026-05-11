'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Filter } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import ProfileModal from '../shared/ProfileModal';
import ConnectInviteModal from './ConnectInviteModal';
import { apiFetch } from '@/lib/auth-client';
import { Hackathon, SwipeResult, SwipeDeckUser } from '@/lib/types';
import { useCallback } from 'react';

interface SwipeViewProps {
  selectedHackathonId: string | null;
  onMatch?: (data: SwipeResult) => void;
}

export default function SwipeView({ selectedHackathonId: initialHackathonId, onMatch }: SwipeViewProps) {
  const [users, setUsers] = useState<SwipeDeckUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchSwipeDeck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = activeHackathonId 
        ? `/api/hackathons/${activeHackathonId}/swipe-deck`
        : `/api/explore/swipe-deck`;
        
      const res = await apiFetch(endpoint);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to load swipe deck');
      }

      const data = await res.json();
      setUsers(data.map((u: SwipeDeckUser) => ({
        id: u.id,
        name: u.name,
        image: u.image || null,
        bio: u.bio || null,
        title: u.title || null,
        college: u.college || null,
        city: u.city || null,
        linkedinUrl: u.linkedinUrl || null,
        githubUrl: u.githubUrl || null,
        skills: u.skills || []
      })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load swipe deck');
    } finally {
      setLoading(false);
    }
  }, [activeHackathonId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialHackathonId !== activeHackathonId) {
        setActiveHackathonId(initialHackathonId);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialHackathonId, activeHackathonId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchHackathons();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHackathons]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSwipeDeck();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSwipeDeck]);

  const handleSwipe = async (userId: string, type: 'LEFT' | 'RIGHT'): Promise<SwipeResult> => {
    const res = await apiFetch('/api/swipes', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: userId,
        hackathonId: activeHackathonId,
        type
      })
    });

    if (!res.ok) {
      if (res.status === 409) return { matched: false }; 
      throw new Error('Failed to record swipe');
    }

    return res.json();
  };

  return (
    <div className="w-full mx-auto space-y-12 px-4 pb-20 flex flex-col items-center">
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

      {/* Swipe Area - Purely functional, no background boxes */}
      <div className="w-full flex justify-center py-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest animate-pulse">Loading Deck...</span>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl text-red-500 text-center max-w-md w-full">
            <p className="text-sm font-black uppercase tracking-widest mb-4">Connection Error</p>
            <p className="text-xs opacity-70 mb-8">{error}</p>
            <button 
              onClick={fetchSwipeDeck} 
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-red-500/20"
            >
              Retry Connection
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12">
            <div className="h-20 w-20 rounded-full bg-indigo-500/5 flex items-center justify-center mb-8 border border-indigo-500/10">
              <Zap className="h-8 w-8 text-indigo-500/50" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">No more matches!</h2>
            <p className="text-zinc-500 max-w-xs text-sm">
              You&apos;ve reached the end of the list. Try switching filters or check back later.
            </p>
          </div>
        ) : (
          <SwipeDeck 
            key={activeHackathonId || 'global'} 
            users={users} 
            onSwipe={handleSwipe}
            onConnect={(user) => setConnectingUser(user)}
            onEmpty={() => setUsers([])} 
            onMatch={(result) => onMatch?.(result)} 
            onViewProfile={(user) => setViewingUser(user)}
          />
        )}
      </div>

      <ProfileModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        user={viewingUser} 
      />

      <ConnectInviteModal
        isOpen={!!connectingUser}
        onClose={() => setConnectingUser(null)}
        user={connectingUser}
        onSuccess={() => {}}
      />
    </div>
  );
}
