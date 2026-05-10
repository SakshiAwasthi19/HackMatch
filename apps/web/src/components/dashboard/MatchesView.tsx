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
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(true); // Wait, this should be false!
      setLoading(false);
    }
  }, [initialHackathonId]);

  useEffect(() => {
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border-b-4 border-b-transparent hover:border-b-indigo-500"
            >
              <ProfileCard 
                {...match.matchedUser} 
                onViewProfile={() => setViewingUser(match.matchedUser)}
              />
              <div className="px-6 pb-6 pt-2 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  Match for {match.hackathonName}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onTabChange('messages')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  >
                    Message
                  </button>
                  <button 
                    onClick={() => setViewingUser(match.matchedUser)}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  >
                    View Profile
                  </button>
                </div>
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
