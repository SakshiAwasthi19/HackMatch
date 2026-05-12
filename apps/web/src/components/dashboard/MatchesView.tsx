'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/auth-client';
import ProfileModal from '../shared/ProfileModal';
import ProfileCard from '../shared/ProfileCard';
import { User } from '@/lib/types';
import { TabType } from './TopNavbar';

interface DisplayMatch {
  id: string;
  matchedUser: User;
  hackathonName: string;
}

interface MatchesViewProps {
  initialHackathonId?: string | null;
  onTabChange: (tab: TabType) => void;
}

export default function MatchesView({ initialHackathonId, onTabChange }: MatchesViewProps) {
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const url = initialHackathonId 
        ? `/api/matches?hackathonId=${initialHackathonId}`
        : '/api/matches';
      const res = await apiFetch(url);
      if (res.ok) {
        setMatches(await res.json());
      } else {
        console.error('API Error:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }, [initialHackathonId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatches();
  }, [fetchMatches]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Your Matches</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">People who liked you back! Start a conversation and build something amazing.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👋</span>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No matches yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
            Keep swiping! Your perfect teammates are just one right-swipe away.
          </p>
          <button 
            onClick={() => onTabChange('swipe')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            Go Swiping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="relative flex flex-col">
              <ProfileCard 
                {...match.matchedUser} 
                onViewProfile={() => setViewingUser(match.matchedUser)}
              />
              
              {/* Contextual Overlay Badge */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <div className="px-2 py-1 bg-indigo-600/90 text-white text-[8px] font-black uppercase tracking-widest rounded-md backdrop-blur-md shadow-lg flex items-center gap-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  {match.hackathonName}
                </div>
              </div>

              {/* Quick Action Footer - Highly Integrated */}
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => onTabChange('messages')}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/10"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingUser && (
        <ProfileModal 
          user={viewingUser} 
          isOpen={!!viewingUser} 
          onClose={() => setViewingUser(null)} 
        />
      )}
    </div>
  );
}
