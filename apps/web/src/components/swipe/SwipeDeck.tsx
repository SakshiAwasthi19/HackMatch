'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart, Zap, Users, Globe, Loader2, ArrowRight } from 'lucide-react';
import { SwipeResult, SwipeDeckUser, SwipeDeckContext } from '@/lib/types';
import SwipeCard from './SwipeCard';
import { apiFetch } from '@/lib/auth-client';
import Link from 'next/link';

interface SwipeDeckProps {
  context: SwipeDeckContext;
  onMatch: (result: SwipeResult) => void;
  onConnect: (user: SwipeDeckUser) => void;
  onViewProfile?: (user: SwipeDeckUser) => void;
}

const physics = {
  drag: { tension: 500, friction: 30, mass: 1 },
  exit: { tension: 200, friction: 25, mass: 1 },
  snap: { tension: 400, friction: 35 },
};

export default function SwipeDeck({ 
  context,
  onMatch,
  onConnect,
  onViewProfile 
}: SwipeDeckProps) {
  const [users, setUsers] = useState<SwipeDeckUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAnimating = useRef(false);
  
  const sessionKey = context.mode === 'hackathon' 
    ? `swipe-seen-hackathon-${context.hackathonId}`
    : 'swipe-seen-explore';

  const fetchDeck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = context.mode === 'hackathon'
        ? `/api/hackathons/${context.hackathonId}/swipe-deck`
        : '/api/explore/swipe-deck';

      const res = await apiFetch(endpoint);
      if (!res.ok) throw new Error('Failed to load swipe deck');
      
      const data: SwipeDeckUser[] = await res.json();
      
      // Filter out seen users from this session
      const seenIdsRaw = sessionStorage.getItem(sessionKey);
      const seenIds = seenIdsRaw ? JSON.parse(seenIdsRaw) : [];
      const filteredData = data.filter(u => !seenIds.includes(u.id));
      
      setUsers(filteredData);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [context, sessionKey]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const markSeen = (userId: string) => {
    const seenIdsRaw = sessionStorage.getItem(sessionKey);
    const seenIds = seenIdsRaw ? JSON.parse(seenIdsRaw) : [];
    if (!seenIds.includes(userId)) {
      seenIds.push(userId);
      sessionStorage.setItem(sessionKey, JSON.stringify(seenIds));
    }
  };

  const getStackStyle = useCallback((i: number, curIndex: number) => {
    const diff = i - curIndex;
    if (diff < 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 0, zIndex: 0 }; 
    if (diff === 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 30 };
    if (diff === 1) return { x: 0, y: 12, scale: 0.95, rotate: 0, opacity: 1, zIndex: 20 };
    if (diff === 2) return { x: 0, y: 24, scale: 0.90, rotate: 0, opacity: 1, zIndex: 10 };
    return { x: 0, y: 24, scale: 0.90, rotate: 0, opacity: 0, zIndex: 0 };
  }, []);

  const [springs, api] = useSprings(users.length, (i: number) => ({
    ...getStackStyle(i, currentIndex),
    from: { x: 0, y: -1000, scale: 1.5, rotate: 0, opacity: 0 },
    config: physics.snap,
  }), [users.length, currentIndex, getStackStyle]);

  useEffect(() => {
    api.start(i => ({
      ...getStackStyle(i, currentIndex),
      config: physics.snap,
    }));
  }, [currentIndex, api, getStackStyle]);

  const handleSwipeRecord = async (userId: string, type: 'LEFT' | 'RIGHT') => {
    try {
      const res = await apiFetch('/api/swipes', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: userId,
          type,
          hackathonId: context.mode === 'hackathon' ? context.hackathonId : null
        })
      });
      
      if (res.ok) {
        const result: SwipeResult = await res.json();
        if (result.matched) onMatch(result);
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  const triggerSwipe = async (dir: number) => {
    if (isAnimating.current || currentIndex >= users.length) return;
    isAnimating.current = true;

    const user = users[currentIndex];
    const swipeType = dir > 0 ? 'RIGHT' : 'LEFT';
    const exitX = dir * (window.innerWidth * 1.5);
    const exitRotate = dir * 25;

    markSeen(user.id);

    api.start(i => {
      if (i !== currentIndex) return;
      return {
        x: exitX,
        rotate: exitRotate,
        opacity: 0,
        config: physics.exit,
        onRest: () => {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          isAnimating.current = false;
          handleSwipeRecord(user.id, swipeType);
        },
      };
    });
  };

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      if (isAnimating.current || currentIndex >= users.length) return;

      const trigger = vx > 0.5 || Math.abs(mx) > 150;

      if (!active && trigger) {
        triggerSwipe(xDir > 0 ? 1 : -1);
        return;
      }

      api.start(i => {
        if (i !== currentIndex) return;
        return {
          x: active ? mx : 0,
          rotate: active ? Math.max(Math.min(mx / 20, 20), -20) : 0,
          scale: active ? 1.05 : 1,
          config: active ? physics.drag : physics.snap,
          immediate: false,
        };
      });
    },
    { 
      filterTaps: true, 
      threshold: 10,
      pointer: { touch: true }
    }
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">Scanning the matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <X className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Sync Error</h3>
        <p className="text-zinc-500 mb-8 max-w-xs">{error}</p>
        <button 
          onClick={fetchDeck}
          className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    if (context.mode === 'hackathon') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8 animate-in fade-in zoom-in duration-700">
          <div className="h-24 w-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">You&apos;ve seen everyone</h2>
          <p className="text-zinc-500 text-lg max-w-sm leading-relaxed mb-10">
            You&apos;ve gone through all interested members for this hackathon. Check back later or invite others to join.
          </p>
          <Link 
            href="/dashboard/hackathons"
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all group"
          >
            Back to Hackathons
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <Globe className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">You&apos;re all caught up</h2>
        <p className="text-zinc-500 text-lg max-w-sm leading-relaxed mb-10">
          You&apos;ve connected with everyone active on HackMatch right now. New members join every day.
        </p>
        <Link 
          href="/dashboard/hackathons"
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all group"
        >
          Browse Hackathons
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-[400px] aspect-[2/3] h-[min(580px,80vh)] perspective-1000 z-10 flex items-center justify-center">
        {springs.map((style, i) => {
          if (i < currentIndex || i > currentIndex + 2) return null;
          return (
            <SwipeCard
              key={users[i].id}
              user={users[i]}
              style={style}
              bind={bind}
              isTop={i === currentIndex}
              onViewProfile={onViewProfile}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 z-20 mt-4">
        <button
          onClick={() => triggerSwipe(-1)}
          className="group w-14 h-14 rounded-full bg-[#14141c] border-[1.5px] border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.2)] hover:border-red-500/80 hover:shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-200 active:scale-90"
        >
          <X className="w-[22px] h-[22px]" />
        </button>

        <button
          onClick={() => onConnect(users[currentIndex])}
          className="group w-12 h-12 rounded-full bg-[#14141c] border-[1.5px] border-indigo-500/40 flex items-center justify-center text-indigo-500 shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:border-indigo-500/80 transition-all duration-200 active:scale-90"
        >
          <Zap className="w-[18px] h-[18px] fill-indigo-500/20 group-hover:fill-indigo-500/40 transition-colors" />
        </button>

        <button
          onClick={() => triggerSwipe(1)}
          className="group w-14 h-14 rounded-full bg-[#14141c] border-[1.5px] border-green-500/40 flex items-center justify-center text-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.2)] hover:border-green-500/80 hover:shadow-[0_4px_25px_rgba(34,197,94,0.4)] transition-all duration-200 active:scale-90"
        >
          <Heart className="w-[22px] h-[22px] group-hover:fill-green-500/20 transition-all" />
        </button>
      </div>
    </div>
  );
}
