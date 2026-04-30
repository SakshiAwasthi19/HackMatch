/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, GraduationCap, Github, Linkedin, Briefcase, FileText } from 'lucide-react';

export interface ProfileModalUser {
  name: string;
  image: string | null;
  title: string | null;
  bio: string | null;
  college: string | null;
  city: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  skills: string[] | { skill: { name: string } }[];
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileModalUser | null;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  if (!user) return null;

  const normalizedSkills = Array.isArray(user.skills)
    ? user.skills.map(s => {
        if (typeof s === 'string') return s;
        const skillObj = s as { skill?: { name: string }; name?: string };
        return skillObj.skill?.name || skillObj.name || '';
      })
    : [];

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header / Image Area */}
            <div className="relative h-48 sm:h-64 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-zinc-900">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="absolute -bottom-12 left-8 h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-zinc-800 border-4 border-zinc-900 overflow-hidden shadow-xl">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-8 px-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white">{user.name}</h2>
                  {user.title && (
                    <p className="text-lg font-bold text-indigo-400 uppercase tracking-wider mt-1">{user.title}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all border border-zinc-700">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-zinc-700">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {user.college && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Education</p>
                      <p className="font-semibold">{user.college}</p>
                    </div>
                  </div>
                )}
                {user.city && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Location</p>
                      <p className="font-semibold">{user.city}</p>
                    </div>
                  </div>
                )}
              </div>

              {user.bio && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">About</h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-lg italic">
                    &quot;{user.bio}&quot;
                  </p>
                </div>
              )}

              {normalizedSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {normalizedSkills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-300 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
