'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Zap } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import { apiFetch } from '@/lib/auth-client';
import { SwipeDeckUser, SwipeResult } from '@/lib/types';
import ProfileModal from '../shared/ProfileModal';
import MatchOverlay from '../match/MatchOverlay';

export default function ExploreView() {
  const [users, setUsers] = useState<SwipeDeckUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [matchData, setMatchData] = useState<SwipeResult | null>(null);

  const fetchExploreDeck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/api/explore/swipe-deck');
      if (!res.ok) throw new Error('Failed to load explore deck');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreDeck();
  }, [fetchExploreDeck]);

  const handleSwipe = async (userId: string, type: 'LEFT' | 'RIGHT'): Promise<SwipeResult> => {
    const res = await apiFetch('/api/swipes', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: userId,
        hackathonId: null, // Explore mode
        type
      })
    });

    if (!res.ok) throw new Error('Failed to record swipe');
    return res.json();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
          <Compass className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Global Discovery</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Networking Explore</h2>
        <p className="text-zinc-500 mt-2">Swipe to find developers across the platform</p>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[600px]">
        {error ? (
          <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button 
              onClick={fetchExploreDeck}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
              <Zap className="h-12 w-12 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">That's everyone for now!</h3>
            <p className="text-zinc-500 max-w-xs">Check back later for new people.</p>
            <button 
              onClick={fetchExploreDeck}
              className="mt-6 text-indigo-500 font-bold hover:underline"
            >
              Refresh Deck
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <SwipeDeck 
              users={users} 
              onSwipe={handleSwipe} 
              onEmpty={() => setUsers([])} 
              onMatch={(result) => setMatchData(result)}
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

      {matchData && (
        <MatchOverlay 
          match={matchData} 
          onClose={() => setMatchData(null)} 
        />
      )}
    </div>
  );
}
