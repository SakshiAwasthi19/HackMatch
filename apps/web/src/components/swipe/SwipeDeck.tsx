'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart, Zap } from 'lucide-react';
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
  }), [users.length]);

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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="h-24 w-24 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700">
          <Heart className="h-10 w-10 text-zinc-600" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">No one here yet</h3>
        <p className="text-zinc-500 max-w-xs text-sm">
          Check back later — new people are joining all the time!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      {/* Background Radial Glow - Minimal & Subtle */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Card Stack */}
      <div className="relative w-[380px] h-[580px] perspective-1000 z-10 flex items-center justify-center">
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

        {/* Empty state when all cards swiped */}
        {currentIndex >= users.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-0">
            <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
              <Heart className="h-10 w-10 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">All Caught Up!</h3>
            <p className="text-zinc-500 text-sm">Check back later for new potential teammates.</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Floating naturally below the stack */}
      {currentIndex < users.length && (
        <div className="flex items-center gap-6 z-20 mt-8">
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
      )}
    </div>
  );
}
