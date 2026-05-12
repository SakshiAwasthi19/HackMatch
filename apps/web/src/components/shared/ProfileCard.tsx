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
    <div className="w-full flex flex-col rounded-3xl overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 shadow-2xl relative group transition-all duration-500 hover:border-zinc-700/50">
      {/* Header Area - Balanced Proportions */}
      <div className="relative h-40 w-full overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-zinc-950 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl rotate-3">
              <span className="text-3xl font-black text-white -rotate-3">{initials}</span>
            </div>
          </div>
        )}
        
        {/* Modern Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        
        {/* Floating Badges - Clean & Minimal */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isDraft && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-[9px] font-bold text-white tracking-widest uppercase shadow-lg shadow-emerald-500/20">
              Draft
            </span>
          )}
          {college && (
            <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-indigo-400" />
              {college}
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Efficient Use of Space */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white tracking-tight truncate leading-none mb-1.5">
                {name || 'Anonymous'}
              </h3>
              {title && (
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em] leading-none">
                  {title}
                </p>
              )}
            </div>
            {city && (
              <div className="flex items-center gap-1 text-zinc-500">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{city}</span>
              </div>
            )}
          </div>
        </div>

        {bio && (
          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 font-medium mb-5 h-8">
            {bio}
          </p>
        )}

        {/* Skills - Compact & Intentional */}
        {normalizedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {normalizedSkills.slice(0, 3).map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className="px-2 py-1 rounded-md text-[9px] font-bold bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 uppercase tracking-wide"
              >
                {skill}
              </span>
            ))}
            {normalizedSkills.length > 3 && (
              <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-zinc-800/20 text-zinc-500 uppercase tracking-wide">
                +{normalizedSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Row - Integrated UI */}
        <div className="mt-auto flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProfile) onViewProfile();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 group/btn"
          >
            <Eye className="h-3.5 w-3.5 text-zinc-500 group-hover/btn:text-indigo-400 transition-colors" />
            Profile
          </button>
          
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
