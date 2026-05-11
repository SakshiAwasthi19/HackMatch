'use client';

import { Eye, MapPin, GraduationCap } from 'lucide-react';
import Image from 'next/image';

export interface ProfileCardProps {
  name: string;
  image?: string | null;
  title?: string | null;
  bio?: string | null;
  college?: string | null;
  city?: string | null;
  skills?: string[] | { skill: { name: string } }[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  onViewProfile?: () => void;
  isDraft?: boolean;
}

export default function ProfileCard({
  name,
  image,
  title,
  bio,
  college,
  city,
  skills = [],
  githubUrl,
  onViewProfile,
  isDraft = false,
}: ProfileCardProps) {
  // Normalize skills to string array
  const normalizedSkills = Array.isArray(skills) 
    ? skills.map(s => {
        if (typeof s === 'string') return s;
        const skillObj = s as { skill?: { name: string }; name?: string };
        return skillObj.skill?.name || skillObj.name || '';
      })
    : [];

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="w-full h-full flex flex-col rounded-[2.5rem] overflow-hidden bg-[#0a0c14] border border-zinc-800/50 shadow-2xl shadow-black relative group">
      {/* Background Image/Avatar Section */}
      <div className="absolute inset-0 z-0">
        {image ? (
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-zinc-950 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl opacity-50">
              <span className="text-5xl font-bold text-white">{initials}</span>
            </div>
          </div>
        )}
        {/* Overlay Gradients - Crucial for readability and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex-1 flex flex-col p-8 justify-end">
        {/* Top Badges (Floating) */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          {isDraft && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-widest uppercase">
              Draft
            </span>
          )}
          {college && (
            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-zinc-300 tracking-widest uppercase flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3" />
              {college}
            </div>
          )}
        </div>

        <div className="absolute top-6 right-6">
          {city && (
            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-zinc-300 tracking-widest uppercase flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {city}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-1 drop-shadow-md">
              {name || 'Anonymous'}
            </h3>
            {title && (
              <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">{title}</p>
            )}
          </div>

          {bio && (
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 font-medium max-w-[90%]">
              {bio}
            </p>
          )}

          {/* Skills Row */}
          {normalizedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {normalizedSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-white/5 border border-white/10 text-zinc-300 uppercase tracking-widest"
                >
                  {skill}
                </span>
              ))}
              {normalizedSkills.length > 4 && (
                <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-white/5 border border-white/10 text-zinc-500 uppercase tracking-widest">
                  +{normalizedSkills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onViewProfile) onViewProfile();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl"
            >
              <Eye className="h-4 w-4" />
              View Full Profile
            </button>
            
            {/* Minimal Social Indicators */}
            <div className="flex gap-2">
              {githubUrl && (
                <div className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
