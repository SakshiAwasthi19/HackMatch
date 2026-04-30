'use client';

import React, { useEffect, useState } from 'react';
import { Compass, Zap, Filter, LayoutGrid } from 'lucide-react';
import SwipeDeck, { SwipeResult } from '@/components/swipe/SwipeDeck';
import ProfileModal from '../shared/ProfileModal';
import { apiFetch } from '@/lib/auth-client';

import { Hackathon, User } from '@/lib/types';
import { useCallback } from 'react';

interface SwipeViewProps {
  selectedHackathonId: string | null;
  user: { id: string; role?: string } | null;
  onRequestHackathonSelection: () => void;
  onMatch?: (data: unknown) => void;
}

export default function SwipeView({ selectedHackathonId: initialHackathonId, user: _user, onRequestHackathonSelection: _onRequestHackathonSelection, onMatch }: SwipeViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<{
    name: string;
    image: string | null;
    title: string | null;
    bio: string | null;
    college: string | null;
    city: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    skills: string[] | { skill: { name: string } }[];
  } | null>(null);
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
        : `/api/swipes/deck`;
        
      const res = await apiFetch(endpoint);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to load swipe deck');
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load swipe deck');
    } finally {
      setLoading(false);
    }
  }, [activeHackathonId]);

  // Sync with initialHackathonId if it changes from parent
  useEffect(() => {
    if (initialHackathonId !== activeHackathonId) {
      setActiveHackathonId(initialHackathonId);
    }
  }, [initialHackathonId, activeHackathonId]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  useEffect(() => {
    fetchSwipeDeck();
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
    <div className="max-w-4xl mx-auto space-y-8 px-4 pb-20">
      {/* Hackathon Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Filter by Hackathon</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          <button
            onClick={() => setActiveHackathonId(null)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
              activeHackathonId === null
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:border-zinc-700'
            }`}
          >
            Global Swipe
          </button>
          {hackathons.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHackathonId(h.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeHackathonId === h.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:border-zinc-700'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center max-w-lg mx-auto">
            <p>Error loading deck: {error}</p>
            <button onClick={fetchSwipeDeck} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Try Again</button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 p-6">
            <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <Zap className="h-12 w-12 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Out of People!</h2>
            <p className="text-zinc-500 max-w-sm mb-8 text-lg font-medium">
              You&apos;ve swiped through all available developers {activeHackathonId ? 'for this hackathon' : 'globally'}. Check back later or try a different filter!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm relative z-10">
            <SwipeDeck 
              key={activeHackathonId || 'global'} 
              users={users} 
              onSwipe={handleSwipe} 
              onEmpty={() => setUsers([])} 
              onMatch={(result) => onMatch?.(result)} 
              onViewProfile={(user) => setViewingUser(user)}
            />
          </div>
        )}
      </div>

      <ProfileModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        user={viewingUser} 
      />
    </div>
  );
}
