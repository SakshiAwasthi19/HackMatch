'use client';

import React from 'react';
import { animated } from '@react-spring/web';
import { Github, Linkedin, MapPin, GraduationCap } from 'lucide-react';

export interface SwipeDeckUser {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  college: string | null;
  city: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  skills: { skill: { id: string; name: string } }[];
}

interface SwipeCardProps {
  user: SwipeDeckUser;
  style: any;
  bind: (...args: any[]) => any;
  isTop: boolean;
}

export default function SwipeCard({ user, style, bind, isTop }: SwipeCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-black/50">
        {/* Swipe Direction Indicators */}
        {isTop && (
          <>
            <animated.div
              style={{
                opacity: swipeX?.to?.((x: number) => Math.min(Math.max(x / 150, 0), 1)) ?? 0,
              }}
              className="absolute inset-0 bg-emerald-500/10 z-10 pointer-events-none flex items-center justify-center"
            >
              <div className="text-8xl font-black text-emerald-400/60 rotate-[-15deg]">✓</div>
            </animated.div>
            <animated.div
              style={{
                opacity: swipeX?.to?.((x: number) => Math.min(Math.max(-x / 150, 0), 1)) ?? 0,
              }}
              className="absolute inset-0 bg-red-500/10 z-10 pointer-events-none flex items-center justify-center"
            >
              <div className="text-8xl font-black text-red-400/60 rotate-[15deg]">✗</div>
            </animated.div>
          </>
        )}

        {/* Card Content */}
        <div className="flex flex-col h-full p-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
              {user.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.college && (
                  <span className="flex items-center gap-1 text-sm text-zinc-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {user.college}
                  </span>
                )}
                {user.city && (
                  <span className="flex items-center gap-1 text-sm text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-3">
              {user.bio}
            </p>
          )}

          {/* Skills */}
          {user.skills.length > 0 && (
            <div className="flex-1 mb-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 8).map((s) => (
                  <span
                    key={s.skill.id}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    {s.skill.name}
                  </span>
                ))}
                {user.skills.length > 8 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
                    +{user.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-3 mt-auto pt-4 border-t border-zinc-800">
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </animated.div>
  );
}
