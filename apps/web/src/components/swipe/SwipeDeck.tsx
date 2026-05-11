'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart, Bolt } from 'lucide-react';
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

// Spring physics configurations
const physics = {
  drag: { tension: 500, friction: 30, mass: 1 },
  exit: { tension: 200, friction: 25, mass: 1 },
  snap: { tension: 400, friction: 35 },
};

export default function SwipeDeck({ 
  users, 
  onSwipe, 
  onConnect,
  onEmpty, 
  onMatch,
  onViewProfile 
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  
  // Helper to determine position in stack
  const getStackStyle = useCallback((i: number, curIndex: number) => {
    const diff = i - curIndex;
    if (diff < 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 0 }; // Gone
    if (diff === 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
    if (diff === 1) return { x: 0, y: 10, scale: 0.95, rotate: 0, opacity: 1 };
    if (diff === 2) return { x: 0, y: 20, scale: 0.90, rotate: 0, opacity: 0.7 };
    return { x: 0, y: 20, scale: 0.90, rotate: 0, opacity: 0 };
  }, []);

  const [springs, api] = useSprings(users.length, (i: number) => ({
    ...getStackStyle(i, currentIndex),
    from: { x: 0, y: -1000, scale: 1.5, rotate: 0, opacity: 0 },
    config: physics.snap,
  }), [users.length]);

  // Update stack positions whenever currentIndex changes
  React.useEffect(() => {
    api.start(i => ({
      ...getStackStyle(i, currentIndex),
      config: physics.snap,
    }));
  }, [currentIndex, api, getStackStyle]);

  const triggerSwipe = async (dir: number) => {
    if (isAnimating.current || currentIndex >= users.length) return;
    isAnimating.current = true;

    const user = users[currentIndex];
    const swipeType = dir > 0 ? 'RIGHT' : 'LEFT';
    const exitX = dir * (window.innerWidth * 1.5);
    const exitRotate = dir * 25;

    api.start(i => {
      if (i !== currentIndex) return;
      return {
        x: exitX,
        rotate: exitRotate,
        opacity: 0,
        config: physics.exit,
        onRest: () => {
          // Finalize swipe after animation
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          isAnimating.current = false;
          
          void onSwipe(user.id, swipeType).then(result => {
            if (result.matched) onMatch(result);
          });

          if (nextIndex >= users.length) {
            onEmpty();
          }
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
          // Optimization: only render top 3 cards
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

        {/* Empty state when all cards swiped */}
        {currentIndex >= users.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2.5rem]">
            <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-700">
              <Heart className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-zinc-500">No more potential teammates for now.</p>
          </div>
        )}
      </div>

      {/* Action Buttons - High performance FABs */}
      {currentIndex < users.length && (
        <div className="flex items-center gap-6">
          {/* Dislike/Pass Button */}
          <button
            onClick={() => triggerSwipe(-1)}
            className="group h-14 w-14 rounded-full bg-white flex items-center justify-center border-2 border-transparent 
                       hover:border-red-500/50 transition-all duration-200 active:scale-90 shadow-lg"
          >
            <X className="h-7 w-7 text-red-500 group-hover:scale-110 transition-transform" />
          </button>

          {/* Connect/SuperLike Button */}
          <button
            onClick={() => onConnect(users[currentIndex])}
            className="group h-12 w-12 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center 
                       hover:border-indigo-500/50 transition-all duration-200 active:scale-90 shadow-lg"
          >
            <Bolt className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Like/Heart Button */}
          <button
            onClick={() => triggerSwipe(1)}
            className="group h-14 w-14 rounded-full bg-white flex items-center justify-center border-2 border-transparent 
                       hover:border-green-500/50 transition-all duration-200 active:scale-90 shadow-lg"
          >
            <Heart className="h-7 w-7 text-green-500 fill-green-500/10 group-hover:fill-green-500 group-hover:scale-110 transition-all" />
          </button>
        </div>
      )}
    </div>
  );
}
