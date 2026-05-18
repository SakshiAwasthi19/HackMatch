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
    ? user.skills.map(s => {
        if (typeof s === 'string') return s;
        // Handle { id, name } OR { skill: { id, name } }
        const skillObj = s as { name?: string; skill?: { name: string } };
        return skillObj.name || skillObj.skill?.name || '';
      }).filter(Boolean)
    : [];

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        ...style,
        position: 'absolute' as const,
        width: 'min(400px, 95vw)',
        height: 'min(580px, 80vh)',
        touchAction: 'none',
        willChange: 'transform',
        transformOrigin: '50% 100%',
        isolation: 'isolate',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: '#050505',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: isTop ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
      }}
      className="select-none flex flex-col"
    >
      {/* SECTION 1 - Hero Area (Visual Focus) */}
      <div className="relative h-[55%] w-full overflow-hidden">
        {user.image ? (
          <Image 
            src={user.image} 
            alt={user.name} 
            fill 
            className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
            priority={isTop}
          />
        ) : (
          <div className="w-full h-full" style={{ background: getGradient(user.name) }} />
        )}
        
        {/* Modern Depth Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent" />

        {/* Floating Identity Badge */}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-2xl font-bold text-white tracking-tight leading-none">
            {user.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 opacity-90">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user.title || 'Tech Enthusiast'}</span>
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.city || 'Global'}</span>
          </div>
        </div>

        {/* IN A TEAM Badge */}
        {user.hasTeam && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-md px-2 py-1 backdrop-blur-md">
              In Team
            </div>
          </div>
        )}

        {/* LIKE / NOPE Overlays */}
        {isTop && (
          <>
            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(x / 100, 0), 1)) ?? 0,
              }}
              className="absolute top-10 left-8 -rotate-[12deg] border-4 border-emerald-500 bg-emerald-500/10 rounded-2xl px-6 py-2 z-50 pointer-events-none"
            >
              <span className="text-emerald-500 text-3xl font-black uppercase tracking-widest">LIKE</span>
            </animated.div>

            <animated.div
              style={{
                opacity: swipeX?.to((x: number) => Math.min(Math.max(-x / 100, 0), 1)) ?? 0,
              }}
              className="absolute top-10 right-8 rotate-[12deg] border-4 border-red-500 bg-red-500/10 rounded-2xl px-6 py-2 z-50 pointer-events-none"
            >
              <span className="text-red-500 text-3xl font-black uppercase tracking-widest">NOPE</span>
            </animated.div>
          </>
        )}
      </div>

      {/* SECTION 2 - Information & Context */}
      <div className="flex-1 p-5 flex flex-col justify-between bg-zinc-950/20">
        <div className="space-y-4">
          {/* Bio */}
          <p className="text-[13px] text-zinc-400 leading-relaxed font-medium line-clamp-3 italic opacity-80">
            &ldquo;{user.bio || 'Building the future, one line at a time.'}&rdquo;
          </p>

          {/* Skills & Looking For - Integrated Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {normalizedSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight"
                >
                  {skill}
                </span>
              ))}
            </div>

            {user.lookingFor && user.lookingFor.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Wants:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.lookingFor.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-amber-400/80 text-[10px] font-bold uppercase"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button - Premium Look */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.(user);
          }}
          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/50 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
        >
          <Eye className="w-4 h-4 text-zinc-500" />
          View Full Profile
        </button>
      </div>
    </animated.div>
  );
}
