'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass, Zap, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';
import { SwipeDeckUser, SwipeResult } from '@/lib/types';
import ProfileModal from '../shared/ProfileModal';
import ExploreCard from './ExploreCard';
import ConnectInviteModal from './ConnectInviteModal';

interface ExploreViewProps {
  onMatch: (data: SwipeResult) => void;
  onStartChat: (userId: string) => void;
}

interface UserWithStatus extends SwipeDeckUser {
  isMatched?: boolean;
  hasSentRequest?: boolean;
  receivedRequest?: boolean;
  hasInviteSent?: boolean;
}

export default function ExploreView({ onMatch, onStartChat }: ExploreViewProps) {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<SwipeDeckUser | null>(null);
  const [connectingUser, setConnectingUser] = useState<SwipeDeckUser | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sentInviteIds, setSentInviteIds] = useState<Set<string>>(new Set());
  
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async (pageNum: number, skillFilter: string | null = null, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const query = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (skillFilter) query.append('skill', skillFilter.replace('#', ''));

      const res = await apiFetch(`/api/explore/swipe-deck?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to load networking hub');
      const data = await res.json();
      
      if (data.length < 20) setHasMore(false);
      
      setUsers(prev => isInitial ? data : [...prev, ...data]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await apiFetch('/api/explore/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (e) {
      console.error('Failed to load skills:', e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, null, true);
      fetchSkills();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, fetchSkills]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => {
            const next = prev + 1;
            fetchUsers(next, activeFilter);
            return next;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchUsers, activeFilter]);

  const handleFilterClick = (skillName: string) => {
    const newFilter = activeFilter === skillName ? null : skillName;
    setActiveFilter(newFilter);
    setPage(1);
    setHasMore(true);
    fetchUsers(1, newFilter, true);
  };

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
    
    // Update user status in state instead of removing
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, isMatched: result.matched, hasSentRequest: type === 'RIGHT' && !result.matched } 
        : u
    ));
    
    if (result.matched) {
      onMatch({ ...result, matchType: 'dm' });
    }
    
    return result;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tight mb-4">
              Find your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dream Team</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl leading-relaxed">
              Connect with developers, designers, and visionaries from around the globe to build the next big thing.
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-bold group shadow-xl">
            <Filter className="h-4 w-4 group-hover:text-indigo-400" />
            Advanced Filters
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Skill Filter Pills */}
      <div className="mb-12 relative">
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleFilterClick(skill.name)}
                className={`flex-none px-6 py-2.5 rounded-2xl text-xs font-black transition-all border whitespace-nowrap ${
                  activeFilter === skill.name
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                #{skill.name}
              </button>
            ))
          ) : (
            ['#Frontend', '#Blockchain', '#AI/ML', '#UX-Design', '#Fullstack'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`flex-none px-6 py-2.5 rounded-2xl text-xs font-black transition-all border whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {filter}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="text-center p-12 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <p className="text-red-500 font-bold mb-6 text-lg">{error}</p>
            <button 
              onClick={() => fetchUsers(1, activeFilter, true)}
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
            <h3 className="text-3xl font-black text-white mb-3">No matching dreamers</h3>
            <p className="text-zinc-500 max-w-sm text-lg mb-8">Try adjusting your filters to find more networking opportunities.</p>
            <button 
              onClick={() => handleFilterClick(activeFilter || '')}
              className="text-indigo-400 font-black hover:text-indigo-300 transition-colors flex items-center gap-2 group"
            >
              <Zap className="h-4 w-4 group-hover:animate-pulse" />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {users.map((user) => (
                <ExploreCard 
                  key={user.id}
                  user={{
                    ...user,
                    hasInviteSent: sentInviteIds.has(user.id)
                  }}
                  onConnect={(id) => setConnectingUser(user)}
                  onCollaborate={(id) => handleAction(id, 'RIGHT', null)}
                  onMessage={async (id) => {
                    try {
                      await apiFetch('/api/chat/dm', {
                        method: 'POST',
                        body: JSON.stringify({ targetUserId: id })
                      });
                      onStartChat(id);
                    } catch (err) {
                      console.error('Failed to ensure DM chat:', err);
                      onStartChat(id); // Fallback to just opening messages
                    }
                  }}
                  onViewProfile={(u) => setViewingUser(u)}
                />
              ))}
            </div>

            {/* Infinite Scroll Target */}
            {hasMore && (
              <div 
                ref={observerTarget} 
                className="flex items-center justify-center py-10"
              >
                {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-indigo-500/50" />}
              </div>
            )}
          </>
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
        onSuccess={(userId) => {
          setSentInviteIds(prev => new Set(prev).add(userId));
        }}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
