'use client';

import React from 'react';
import { Mail, ShieldCheck, Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { SwipeDeckUser } from '@/lib/types';
import { motion } from 'framer-motion';

interface ExploreCardProps {
  user: SwipeDeckUser & { receivedRequest?: boolean };
  onConnect: (userId: string) => void;
  onCollaborate: (userId: string) => void;
  onRequest: (userId: string) => void;
  onMessage: (userId: string) => void;
  onViewProfile: (user: SwipeDeckUser) => void;
}

export default function ExploreCard({
  user,
  onConnect,
  onCollaborate,
  onRequest,
  onMessage,
  onViewProfile
}: ExploreCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isCollaborate = user.receivedRequest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
    >
      {/* Banner / Header Image Area */}
      <div className="h-28 w-full bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* Avatar - Overlapping */}
      <div className="absolute top-16 left-6 ring-4 ring-zinc-950 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          {user.image ? (
            <div className="relative h-full w-full">
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            </div>
          ) : (
            <span className="text-xl font-black text-white">{initials}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 
              onClick={() => onViewProfile(user)}
              className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {user.name}
            </h3>
            <p className="text-sm text-zinc-400 font-medium">{user.title || 'Hacker'}</p>
          </div>
          
          {/* Badge */}
          <div className="flex gap-2">
            {user.role === 'ADMIN' ? (
              <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Verified</span>
              </div>
            ) : (
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-1">
                <Star className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Top Talent</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-zinc-500 leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
          {user.bio || "Building the future of decentralized tech. Hacker at heart, veteran of multiple hackathons."}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {user.skills && user.skills.length > 0 ? (
            user.skills.slice(0, 3).map((s: any) => (
              <span key={s.skillId} className="px-2 py-0.5 bg-zinc-800/50 text-[10px] text-zinc-400 border border-zinc-700/50 rounded-md font-mono uppercase tracking-tighter">
                {s.skill.name}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 bg-zinc-800/50 text-[10px] text-zinc-400 border border-zinc-700/50 rounded-md font-mono uppercase tracking-tighter">
              Builder
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isCollaborate ? (
            <button
              onClick={() => onCollaborate(user.id)}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              <Zap className="h-3.5 w-3.5" />
              Collaborate
            </button>
          ) : (
            <>
              <button
                onClick={() => onConnect(user.id)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Connect
              </button>
              <button
                onClick={() => onRequest(user.id)}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                <Mail className="h-3.5 w-3.5" />
                Request
              </button>
            </>
          )}
          
          <button
            onClick={() => onMessage(user.id)}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 rounded-xl transition-all"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
