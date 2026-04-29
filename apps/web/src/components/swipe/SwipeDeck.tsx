'use client';

import React, { useState, useRef } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart } from 'lucide-react';
import SwipeCard, { type SwipeDeckUser } from './SwipeCard';

export interface SwipeResult {
  matched: boolean;
  teamId?: string | null;
  chatId?: string;
  matchedUser?: { id: string; name: string; image: string | null };
}

interface SwipeDeckProps {
  users: SwipeDeckUser[];
  onSwipe: (userId: string, type: 'LEFT' | 'RIGHT') => Promise<SwipeResult>;
  onEmpty: () => void;
  onMatch: (result: SwipeResult) => void;
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

export default function SwipeDeck({ users, onSwipe, onEmpty, onMatch }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);

  const [springs, api] = useSprings(users.length, (i: number) => ({
    ...to(i, 0),
    from: { x: 0, y: -1000, scale: 1.5, rotate: 0, opacity: 0 },
  }));

  const triggerSwipe = async (dir: number) => {
    if (isAnimating.current || currentIndex >= users.length) return;
    isAnimating.current = true;

    const user = users[currentIndex];
    const swipeType = dir > 0 ? 'RIGHT' : 'LEFT';
    const nextIndex = currentIndex + 1;

    // Animate card off screen
    api.start((i: number) => {
      if (i === currentIndex) return flyOut(dir);
      if (i === nextIndex) return to(i, nextIndex);
      if (i === nextIndex + 1) return to(i, nextIndex);
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

      if (nextIndex >= users.length) {
        onEmpty();
      }
    }, 300);
  };

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
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
    <div className="flex flex-col items-center gap-8">
      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[480px]">
        {springs.map((style, i) => {
          if (i < currentIndex || i - currentIndex >= 3) return null;
          return (
            <SwipeCard
              key={users[i].id}
              user={users[i]}
              style={style}
              bind={bind}
              isTop={i === currentIndex}
            />
          );
        })}

        {/* Empty state when all cards swiped */}
        {currentIndex >= users.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">All caught up!</h3>
            <p className="text-sm text-zinc-500 mt-1">No more people to discover right now.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex < users.length && (
        <div className="flex items-center gap-6">
          <button
            onClick={() => triggerSwipe(-1)}
            disabled={isAnimating.current}
            className="h-16 w-16 rounded-full bg-zinc-900 border-2 border-red-500/30 flex items-center justify-center
                       hover:border-red-500/60 hover:bg-red-500/10 hover:scale-110
                       active:scale-95 transition-all duration-200 shadow-lg shadow-red-500/5"
          >
            <X className="h-7 w-7 text-red-400" />
          </button>

          <button
            onClick={() => triggerSwipe(1)}
            disabled={isAnimating.current}
            className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center
                       hover:from-emerald-400 hover:to-emerald-500 hover:scale-110 hover:shadow-emerald-500/30
                       active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <Heart className="h-8 w-8 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
