'use client';

import React from 'react';
import { animated } from '@react-spring/web';
import { Eye } from 'lucide-react';
import Image from 'next/image';
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

  const getGradient = (name: string) => {
    const firstChar = (name[0] || 'A').toUpperCase();
    if (firstChar >= 'A' && firstChar <= 'F') return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    if (firstChar >= 'G' && firstChar <= 'L') return 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 50%, #2d1b69 100%)';
    if (firstChar >= 'M' && firstChar <= 'R') return 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)';
    return 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  };

  const normalizedSkills = Array.isArray(user.skills) 
    ? user.skills.map(s => (typeof s === 'string' ? s : s.skill?.name || ''))
    : [];

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        ...style,
        position: 'absolute' as const,
        width: '380px',
        height: '580px',
        touchAction: 'none',
        willChange: 'transform',
        transformOrigin: '50% 100%',
        isolation: 'isolate',
        backgroundClip: 'padding-box',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: 'rgb(13, 13, 20)',
        boxShadow: isTop ? '0 20px 60px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.4)',
      }}
      className="select-none"
    >
      {/* SECTION 1 - Hero Image Area (55%) */}
      <div className="relative h-[320px] w-full overflow-hidden bg-zinc-900">
        {user.image ? (
          <Image 
            src={user.image} 
            alt={user.name} 
            fill 
            className="object-cover object-[center_top]"
            priority={isTop}
          />
        ) : (
          <div className="w-full h-full" style={{ background: getGradient(user.name) }} />
        )}
        
        {/* Strong Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-50% to-[#0d0d14] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0d14] to-transparent" />

        {/* Name Overlay */}
        <h3 className="absolute bottom-3 left-5 text-[28px] font-bold text-white tracking-tight drop-shadow-lg">
          {user.name}
        </h3>

        {/* LIKE / NOPE Overlays */}
        {isTop && (
          <>
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(x / 100, 0), 1)) ?? 0,
              }}
              className="absolute top-8 left-6 -rotate-[15deg] border-[3px] border-[rgb(34,197,94)] bg-[rgba(34,197,94,0.1)] rounded-xl px-5 py-2 z-50 pointer-events-none"
            >
              <span className="text-[rgb(34,197,94)] text-[32px] font-black uppercase tracking-[0.15em]">LIKE</span>
            </animated.div>

            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(-x / 100, 0), 1)) ?? 0,
              }}
              className="absolute top-8 right-6 rotate-[15deg] border-[3px] border-[rgb(239,68,68)] bg-[rgba(239,68,68,0.1)] rounded-xl px-5 py-2 z-50 pointer-events-none"
            >
              <span className="text-[rgb(239,68,68)] text-[32px] font-black uppercase tracking-[0.15em]">NOPE</span>
            </animated.div>
          </>
        )}
      </div>

      {/* SECTION 2 - Info Area (45%) */}
      <div className="h-[260px] bg-[#0d0d14] p-[16px_20px] flex flex-col">
        {/* Role/Title */}
        <div className="text-[11px] font-semibold text-[rgb(139,92,246)] uppercase tracking-[0.12em] line-clamp-1">
          {user.title || 'Tech Enthusiast'}
        </div>

        {/* Bio */}
        <p className="text-[13px] text-[rgb(180,180,195)] leading-relaxed line-clamp-3 mt-2 h-[58px]">
          {user.bio || 'Building the future of tech, one line of code at a time. Looking for like-minded dreamers to join the squad!'}
        </p>

        {/* Skills Row */}
        <div className="flex flex-wrap gap-[6px] mt-[10px]">
          {normalizedSkills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[rgb(196,181,253)] rounded-[4px] px-[10px] py-[3px] text-[11px] font-medium uppercase tracking-[0.06em]"
            >
              {skill}
            </span>
          ))}
          {normalizedSkills.length > 4 && (
            <span className="bg-zinc-800 text-zinc-500 rounded-[4px] px-[10px] py-[3px] text-[11px] font-medium uppercase tracking-[0.06em]">
              +{normalizedSkills.length - 4}
            </span>
          )}
        </div>

        {/* LOOKING FOR row */}
        {user.lookingFor && user.lookingFor.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">LOOKING FOR:</span>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {user.lookingFor.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.4)] text-[rgb(252,211,77)] rounded-[4px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(user);
            }}
            className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[12px] font-medium uppercase tracking-[0.08em] rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-3.5 h-3.5" />
            View Full Profile
          </button>
        </div>
      </div>
    </animated.div>
  );
}
