'use client';

import React from 'react';
import { animated } from '@react-spring/web';
import { Heart, X } from 'lucide-react';
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
        transformOrigin: '50% 100%',
      }}
    >
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
        {/* Profile Content */}
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

        {/* Swipe Overlays */}
        {isTop && (
          <>
            {/* LIKE Overlay */}
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(x / 100, 0), 1)) ?? 0,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
              }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <div className="absolute top-8 left-8 -rotate-[15deg] border-[3px] border-[rgb(34,197,94)] rounded-lg px-4 py-1.5 flex items-center gap-2">
                <span className="text-[rgb(34,197,94)] text-3xl font-[800] uppercase tracking-widest">LIKE</span>
                <Heart className="w-8 h-8 text-[rgb(34,197,94)] fill-[rgb(34,197,94)]" />
              </div>
            </animated.div>

            {/* NOPE Overlay */}
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(-x / 100, 0), 1)) ?? 0,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
              }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <div className="absolute top-8 right-8 rotate-[15deg] border-[3px] border-[rgb(239,68,68)] rounded-lg px-4 py-1.5 flex items-center gap-2">
                <span className="text-[rgb(239,68,68)] text-3xl font-[800] uppercase tracking-widest">NOPE</span>
                <X className="w-8 h-8 text-[rgb(239,68,68)] stroke-[3px]" />
              </div>
            </animated.div>
          </>
        )}
      </div>
    </animated.div>
  );
}
