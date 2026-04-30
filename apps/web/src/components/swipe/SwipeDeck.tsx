'use client';

import React, { useState, useRef } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart } from 'lucide-react';
import { SwipeResult } from '@/lib/types';
import SwipeCard, { type SwipeDeckUser } from './SwipeCard';

interface SwipeDeckProps {
  users: SwipeDeckUser[];
  onSwipe: (userId: string, type: 'LEFT' | 'RIGHT') => Promise<SwipeResult>;
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
  x: dir * (window.innerWidth + 200),
  rotate: dir * 30,
  scale: 1.1,
  opacity: 0,
  immediate: false,
  config: { friction: 50, tension: 200 },
});

export default function SwipeDeck({ 
  users, 
  onSwipe, 
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
    }, 300);
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

      {/* Action Buttons - Premium Design */}
      {currentIndex < users.length && (
        <div className="flex items-center gap-10">
          <button
            onClick={() => triggerSwipe(-1)}
            disabled={animating}
            className="group h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center
                       hover:border-red-500/50 hover:bg-red-500/5 hover:scale-110
                       active:scale-95 transition-all duration-300 shadow-xl"
          >
            <X className="h-8 w-8 text-zinc-500 group-hover:text-red-400 transition-colors" />
          </button>

          <button
            onClick={() => triggerSwipe(1)}
            disabled={animating}
            className="group h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center
                       hover:bg-indigo-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]
                       active:scale-95 transition-all duration-300 shadow-xl shadow-indigo-600/20"
          >
            <Heart className="h-10 w-10 text-white fill-white/10 group-hover:fill-white/20 transition-all" />
          </button>
        </div>
      )}
    </div>
  );
}
