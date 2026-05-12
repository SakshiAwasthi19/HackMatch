'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { SwipeDeckUser } from '@/lib/types';
import { motion } from 'framer-motion';

interface ExploreCardProps {
  user: SwipeDeckUser & { 
    receivedRequest?: boolean;
    isMatched?: boolean;
    hasSentRequest?: boolean;
    hasInviteSent?: boolean;
  };
  onConnect: (userId: string) => void;
  onCollaborate: (userId: string) => void;
  onMessage: (userId: string) => void;
  onViewProfile: (user: SwipeDeckUser) => void;
}

export default function ExploreCard({
  user,
  onConnect,
  onCollaborate,
  onMessage,
  onViewProfile
}: ExploreCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isConnected = user.isMatched;
  const isPending = user.hasSentRequest && !user.isMatched;
  const hasInviteSent = user.hasInviteSent; 

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl overflow-hidden hover:bg-zinc-900/40 transition-all duration-500 shadow-2xl hover:border-zinc-700/50 flex flex-col"
    >
      {/* Banner / Header Area - More Compact */}
      <div className="h-20 w-full bg-gradient-to-br from-indigo-950/20 to-zinc-950 relative border-b border-zinc-800/20">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>

      {/* Avatar Integration - Clean & Modern */}
      <div className="absolute top-10 left-5">
        <div className="h-16 w-16 bg-zinc-950 ring-[4px] ring-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Content - Efficient Spacing */}
      <div className="pt-8 p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 max-w-[65%]">
            <h3 
              onClick={() => onViewProfile(user)}
              className="text-lg font-bold text-white truncate cursor-pointer hover:text-indigo-400 transition-colors leading-tight"
            >
              {user.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{user.college || 'Builder'}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            {isConnected && (
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Matched</span>
              </div>
            )}
            
            {user.receivedRequest && !isConnected && (
              <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Interested</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2 h-8 font-medium opacity-80">
          {user.bio || "Building the future of tech, one line at a time."}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {(user.skills as { skill: { id: string; name: string } }[] || []).slice(0, 3).map((s, idx) => (
            <span key={s.skill?.id || idx} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 rounded-md font-bold uppercase tracking-tight">
              {s.skill?.name || (typeof s === 'string' ? s : 'Hacker')}
            </span>
          ))}
        </div>

        {/* Action Buttons - Integrated & Compact */}
        <div className="mt-auto flex flex-col gap-2">
          {isConnected ? (
            <button
              onClick={() => onMessage(user.id)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-zinc-800 flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              Chat Now
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCollaborate(user.id)}
                disabled={isPending}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  isPending 
                  ? 'bg-zinc-900/50 text-zinc-600 border-zinc-900' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 active:scale-95'
                }`}
              >
                <Users className="h-3 w-3" />
                {isPending ? 'Pending' : 'Team'}
              </button>

              <button
                onClick={() => onConnect(user.id)}
                disabled={hasInviteSent}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  hasInviteSent 
                  ? 'bg-indigo-950/20 text-indigo-500/50 border-indigo-900/20' 
                  : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 active:scale-95'
                }`}
              >
                <Rocket className="h-3 w-3" />
                {hasInviteSent ? 'Sent' : 'Connect'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Rocket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.71-2.13l-4.42-3.58s-1.29 0-2.13.71z" /><path d="M15 9l-9 9" /><path d="M16 4l-4 4" /><path d="M2 22l5.5-5.5" /><path d="M9 15l1-1" /><path d="M18.5 2.5c.34-.34.8-.5 1.5-.5s1.16.16 1.5.5c.34.34.5.8.5 1.5s-.16 1.16-.5 1.5c-.34.34-.8.5-1.5.5s-1.16-.16-1.5-.5c-.34-.34-.5-.8-.5-1.5s.16-1.16.5-1.5z" />
    </svg>
  );
}
