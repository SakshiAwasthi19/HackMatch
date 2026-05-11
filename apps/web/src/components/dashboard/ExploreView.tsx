'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Zap, Filter, ChevronDown } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';
import { SwipeDeckUser, SwipeResult } from '@/lib/types';
import ProfileModal from '../shared/ProfileModal';
import ExploreCard from './ExploreCard';

interface ExploreViewProps {
  onMatch: (data: SwipeResult) => void;
}

const FILTERS = ['#Frontend', '#Blockchain', '#AI/ML', '#UX-Design', '#Fullstack'];

export default function ExploreView({ onMatch }: ExploreViewProps) {
  const [users, setUsers] = useState<(SwipeDeckUser & { receivedRequest?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<SwipeDeckUser | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchExploreDeck = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) {
        setLoading(true);
        setError(null);
      }
      const res = await apiFetch('/api/explore/swipe-deck');
      if (!res.ok) throw new Error('Failed to load explore deck');
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreDeck(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchExploreDeck]);

  const handleAction = async (userId: string, type: 'LEFT' | 'RIGHT', hackathonId: string | null = null): Promise<SwipeResult> => {
    const res = await apiFetch('/api/swipes', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: userId,
        hackathonId,
        type
      })
    });

    if (!res.ok) throw new Error('Failed to record action');
    const result = await res.json();
    
    if (result.matched) {
      onMatch(result);
    }
    
    // Remove user from the list after a brief delay if it's a match
    // to allow the match overlay to transition smoothly.
    const delay = result.matched ? 500 : 0;
    setTimeout(() => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }, delay);
    
    return result;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-8 bg-indigo-500" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Networking Hub</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tight mb-4">
              Find your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dream Team</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl leading-relaxed">
              Connect with developers, designers, and visionaries from around the globe to build the next big thing.
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-bold group">
            <Filter className="h-4 w-4 group-hover:text-indigo-400" />
            Advanced Filters
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-10">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border ${
              activeFilter === filter
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="text-center p-12 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <p className="text-red-500 font-bold mb-6 text-lg">{error}</p>
            <button 
              onClick={() => fetchExploreDeck()}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
            <div className="h-24 w-24 rounded-[2rem] bg-zinc-900 flex items-center justify-center mb-8 border border-zinc-800 shadow-inner">
              <Compass className="h-10 w-10 text-zinc-700" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">That&apos;s everyone for now!</h3>
            <p className="text-zinc-500 max-w-sm text-lg mb-8">Check back later for new networking opportunities across the globe.</p>
            <button 
              onClick={() => fetchExploreDeck()}
              className="text-indigo-400 font-black hover:text-indigo-300 transition-colors flex items-center gap-2 group"
            >
              <Zap className="h-4 w-4 group-hover:animate-pulse" />
              Refresh Networking Hub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <ExploreCard 
                key={user.id}
                user={user}
                onConnect={(id) => handleAction(id, 'RIGHT', null)}
                onCollaborate={(id) => handleAction(id, 'RIGHT', null)} // Connect back
                onRequest={(id) => {
                  // For now, general connect, but could open hackathon picker
                  handleAction(id, 'RIGHT', null);
                }}
                onMessage={(id) => {
                  // Navigate to chat
                  window.location.href = `/dashboard/messages?userId=${id}`;
                }}
                onViewProfile={(u) => setViewingUser(u)}
              />
            ))}
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
