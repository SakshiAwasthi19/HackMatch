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
  const hasInviteSent = (user as any).hasInviteSent; // This will be passed from ExploreView

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl"
    >
      {/* Banner Area */}
      <div className="h-24 w-full bg-gradient-to-br from-indigo-950/30 to-zinc-950 relative border-b border-zinc-800/30">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>

      {/* Avatar */}
      <div className="absolute top-12 left-6">
        <div className="h-20 w-20 bg-zinc-900 ring-[6px] ring-zinc-950 rounded-3xl overflow-hidden shadow-2xl relative">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="max-w-[70%]">
            <h3 
              onClick={() => onViewProfile(user)}
              className="text-xl font-black text-white truncate cursor-pointer hover:text-indigo-400 transition-colors"
            >
              {user.name}
            </h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider truncate">
              {user.college || 'Builder'} • {user.city || 'Global'}
            </p>
          </div>
          
          {isConnected && (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connected</span>
            </div>
          )}
          
          {user.receivedRequest && !isConnected && (
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-1.5">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Likes You</span>
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-2 h-10 font-medium">
          {user.bio || "Crafting digital experiences and solving complex problems with code. Passionate about innovation and collaboration."}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {(user.skills as { skill: { id: string; name: string } }[] || []).slice(0, 3).map((s, idx) => (
            <span key={s.skill?.id || idx} className="px-2.5 py-1 bg-zinc-800/30 text-[10px] text-zinc-400 border border-zinc-700/30 rounded-lg font-bold uppercase tracking-tighter">
              {s.skill?.name || (typeof s === 'string' ? s : 'Hacker')}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {isConnected ? (
            <button
              onClick={() => onMessage(user.id)}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black rounded-2xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCollaborate(user.id)}
                disabled={isPending}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                  isPending 
                  ? 'bg-zinc-800/50 text-zinc-500 border-zinc-800' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 active:scale-95'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {isPending ? 'Pending' : 'Collaborate'}
              </button>

              <button
                onClick={() => onConnect(user.id)}
                disabled={hasInviteSent}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                  hasInviteSent 
                  ? 'bg-indigo-900/20 text-indigo-400/50 border-indigo-900/30' 
                  : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95'
                }`}
              >
                <Rocket className="h-3.5 w-3.5" />
                {hasInviteSent ? 'Invite Sent' : 'Connect'}
              </button>

              <button
                onClick={() => isConnected ? onMessage(user.id) : alert("Please Connect or Collaborate with this user first to start a chat!")}
                className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-2xl transition-all"
              >
                <MessageSquare className="h-4 w-4" />
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
