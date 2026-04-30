'use client';

import React from 'react';
import { animated } from '@react-spring/web';
import ProfileCard from '../shared/ProfileCard';

import { SwipeDeckUser } from '@/lib/types';

interface SwipeCardProps {
  user: SwipeDeckUser;
  style: any;
  bind: any;
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
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <animated.div
              style={{
                opacity: swipeX?.to?.((x: number) => Math.min(Math.max(x / 150, 0), 1)) ?? 0,
              }}
              className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[1px]"
            >
              <div className="px-8 py-3 rounded-2xl border-4 border-emerald-400/60 text-emerald-400 font-black text-4xl uppercase tracking-[0.2em] rotate-[-15deg]">Match</div>
            </animated.div>
            <animated.div
              style={{
                opacity: swipeX?.to?.((x: number) => Math.min(Math.max(-x / 150, 0), 1)) ?? 0,
              }}
              className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[1px]"
            >
              <div className="px-8 py-3 rounded-2xl border-4 border-red-400/60 text-red-400 font-black text-4xl uppercase tracking-[0.2em] rotate-[15deg]">Pass</div>
            </animated.div>
          </div>
        )}
      </div>
    </animated.div>
  );
}
