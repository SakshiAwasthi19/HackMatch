'use client';

import React from 'react';
import { animated } from '@react-spring/web';
import ProfileCard from '../shared/ProfileCard';

import { SwipeDeckUser } from '@/lib/types';

interface SwipeCardProps {
  user: SwipeDeckUser;
  style: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  bind: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isTop: boolean;
  onViewProfile?: (user: SwipeDeckUser) => void;
}

export default function SwipeCard({ user, style, bind, isTop, onViewProfile }: SwipeCardProps) {
  // Calculate swipe indicator opacity from spring x value
  const swipeX = style.x;

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        ...style,
        position: 'absolute' as const,
        width: '100%',
        height: '100%',
        touchAction: 'none',
        willChange: 'transform',
      }}
    >
      <div className="relative w-full h-full group">
        {/* The shared Profile Card */}
        <ProfileCard
          name={user.name}
          image={user.image}
          title={user.title}
          bio={user.bio}
          college={user.college}
          city={user.city}
          skills={user.skills}
          githubUrl={user.githubUrl}
          linkedinUrl={user.linkedinUrl}
          onViewProfile={onViewProfile ? () => onViewProfile(user) : undefined}
        />

        {/* Swipe Direction Indicators (Overlayed on top) */}
        {isTop && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[2.5rem]">
            {/* Match Indicator (Right Swipe) */}
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(x / 100, 0), 1)) ?? 0,
                transform: swipeX?.to((x: number) => `scale(${0.5 + Math.min(Math.max(x / 200, 0), 0.5)}) rotate(-15deg)`),
              }}
              className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="px-10 py-4 rounded-3xl border-8 border-emerald-400 text-emerald-400 font-black text-6xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(52,211,153,0.3)]">
                Match
              </div>
            </animated.div>

            {/* Pass Indicator (Left Swipe) */}
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(-x / 100, 0), 1)) ?? 0,
                transform: swipeX?.to((x: number) => `scale(${0.5 + Math.min(Math.max(-x / 200, 0), 0.5)}) rotate(15deg)`),
              }}
              className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="px-10 py-4 rounded-3xl border-8 border-red-400 text-red-400 font-black text-6xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(248,113,113,0.3)]">
                Pass
              </div>
            </animated.div>
          </div>
        )}
      </div>
    </animated.div>
  );
}
