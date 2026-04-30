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
  linkedinUrl,
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
    <div className="w-full h-full flex flex-col rounded-[2.5rem] overflow-hidden bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-black/50 group">
      {/* Card Image Section */}
      <div className="relative h-64 flex-shrink-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-zinc-900 flex items-center justify-center overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-white">{initials}</span>
          </div>
        )}
        
        {/* Draft Badge Overlay */}
        {isDraft && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
              ● DRAFT MODE
            </span>
          </div>
        )}

        {/* Social Links Overlay */}
        {(githubUrl || linkedinUrl) && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {githubUrl && (
              <div className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-zinc-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </div>
            )}
            {linkedinUrl && (
              <div className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-zinc-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
            )}
          </div>
        )}

        {/* Location/College Tags overlay */}
        {(college || city) && (
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
            {college && (
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-zinc-200 border border-white/10 flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 text-zinc-400" />
                {college}
              </div>
            )}
            {city && (
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-zinc-200 border border-white/10 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-zinc-400" />
                {city}
              </div>
            )}
          </div>
        )}
        
        {/* Bottom edge shadow */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      {/* Card Body */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-4">
          <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
            {name || 'Your Name'}
          </h3>
          {title && (
            <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{title}</p>
          )}
        </div>

        {bio ? (
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 font-medium">
            {bio}
          </p>
        ) : (
          <p className="text-sm text-zinc-600 italic">No bio provided yet...</p>
        )}

        {/* Skills */}
        <div className="mt-auto pt-6">
          {normalizedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {normalizedSkills.slice(0, 5).map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider"
                >
                  {skill}
                </span>
              ))}
              {normalizedSkills.length > 5 && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase tracking-wider">
                  +{normalizedSkills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* View Profile Button */}
          {(isDraft || onViewProfile) && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onViewProfile) onViewProfile();
              }}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-bold transition-all active:scale-95"
            >
              <Eye className="h-4 w-4" />
              View Full Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
