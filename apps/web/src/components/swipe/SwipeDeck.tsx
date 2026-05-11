'use client';

import React, { useState, useRef } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart } from 'lucide-react';
import { SwipeResult, SwipeDeckUser } from '@/lib/types';
import SwipeCard from './SwipeCard';

interface SwipeDeckProps {
  users: SwipeDeckUser[];
  onSwipe: (userId: string, type: 'LEFT' | 'RIGHT') => Promise<SwipeResult>;
  onConnect: (user: SwipeDeckUser) => void;
  onEmpty: () => void;
  onMatch: (result: SwipeResult) => void;
  onViewProfile?: (user: SwipeDeckUser) => void;
}

// Spring config for card at rest (stacked)
const to = (i: number, currentIndex: number) => ({
  x: 0,
  y: (i - currentIndex) * -8,
  scale: 1 - (i - currentIndex) * 0.04,
  rotate: 0,
  opacity: i - currentIndex < 3 ? 1 : 0,
  immediate: false,
});

// Spring config for card flying off screen
const flyOut = (dir: number) => ({
  x: dir * (window.innerWidth + 500),
  rotate: dir * 45,
  scale: 1,
  opacity: 0,
  immediate: false,
  config: { friction: 60, tension: 150 },
});

export default function SwipeDeck({ 
  users, 
  onSwipe, 
  onConnect,
  onEmpty, 
  onMatch,
  onViewProfile 
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const isAnimating = useRef(false);

  const [springs, api] = useSprings(users.length, (i: number) => ({
    ...to(i, currentIndex),
    from: { x: 0, y: -1000, scale: 1.5, rotate: 0, opacity: 0 },
  }), [users.length, currentIndex]);

  const triggerSwipe = async (dir: number) => {
    if (isAnimating.current || currentIndex >= users.length) return;
    isAnimating.current = true;
    setAnimating(true);

    const user = users[currentIndex];
    const swipeType = dir > 0 ? 'RIGHT' : 'LEFT';
    const nextIndex = currentIndex + 1;

    // Animate card off screen and shift others up immediately
    api.start((i: number) => {
      if (i === currentIndex) return flyOut(dir);
      if (i > currentIndex) return to(i, nextIndex);
      return {};
    });

    // Wait for animation, then process
    setTimeout(async () => {
      try {
        const result = await onSwipe(user.id, swipeType);
        if (result.matched) {
          onMatch(result);
        }
      } catch (err) {
        console.error('Swipe error:', err);
      }

      setCurrentIndex(nextIndex);
      isAnimating.current = false;
      setAnimating(false);

      if (nextIndex >= users.length) {
        onEmpty();
      }
    }, 500);
  };

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      if (isAnimating.current) return;

      const trigger = vx > 0.3 || Math.abs(mx) > 150;

      if (!active && trigger) {
        triggerSwipe(xDir > 0 ? 1 : -1);
        return;
      }

      // Update spring while dragging
      api.start((i: number) => {
        if (i !== currentIndex) return {};
        return {
          x: active ? mx : 0,
          rotate: active ? mx / 12 : 0,
          scale: active ? 1.03 : 1,
          immediate: (name: string) => active && name === 'x',
          config: { friction: 50, tension: active ? 800 : 500 },
        };
      });
    },
    { filterTaps: true, threshold: 10 }
  );

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
        <div className="h-24 w-24 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">No one here yet</h3>
        <p className="text-zinc-500 max-w-xs">
          Check back later — new people are joining all the time!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      {/* Card Stack */}
      <div className="relative w-[400px] h-[580px] perspective-1000">
        {springs.map((style, i) => {
          if (i < currentIndex || i - currentIndex >= 3) return null;
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

        {/* Empty state when all cards swiped */}
        {currentIndex >= users.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2.5rem]">
            <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-700">
              <Heart className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-zinc-500">No more potential teammates in this category for now.</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Premium Design Split */}
      {currentIndex < users.length && (
        <div className="flex items-center gap-6">
          {/* Dislike/Pass */}
          <button
            onClick={() => triggerSwipe(-1)}
            disabled={animating}
            className="group h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center
                       hover:border-red-500/50 hover:bg-red-500/5 hover:scale-110
                       active:scale-95 transition-all duration-300 shadow-xl"
          >
            <X className="h-6 w-6 text-zinc-500 group-hover:text-red-400 transition-colors" />
          </button>

          {/* Collaborate (Low Friction) */}
          <button
            onClick={() => triggerSwipe(1)}
            disabled={animating}
            className="group h-16 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center gap-2
                       hover:border-zinc-600 hover:bg-zinc-800 hover:scale-105
                       active:scale-95 transition-all duration-300 shadow-xl"
          >
            <Users className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest">Collaborate</span>
          </button>

          {/* Connect (High Friction / Invite) */}
          <button
            onClick={() => onConnect(users[currentIndex])}
            disabled={animating}
            className="group h-16 px-8 rounded-2xl bg-indigo-600 flex items-center justify-center gap-2
                       hover:bg-indigo-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]
                       active:scale-95 transition-all duration-300 shadow-xl shadow-indigo-600/20"
          >
            <Rocket className="h-6 w-6 text-white group-hover:animate-bounce" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Connect</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Rocket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.71-2.13l-4.42-3.58s-1.29 0-2.13.71z" /><path d="M15 9l-9 9" /><path d="M16 4l-4 4" /><path d="M2 22l5.5-5.5" /><path d="M9 15l1-1" /><path d="M18.5 2.5c.34-.34.8-.5 1.5-.5s1.16.16 1.5.5c.34.34.5.8.5 1.5s-.16 1.16-.5 1.5c-.34.34-.8.5-1.5.5s-1.16-.16-1.5-.5c-.34-.34-.5-.8-.5-1.5s.16-1.16.5-1.5z" />
    </svg>
  );
}
