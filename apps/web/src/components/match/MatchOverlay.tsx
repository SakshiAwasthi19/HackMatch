'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Send, Compass, Bolt, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/auth-client';

interface MatchOverlayProps {
  isOpen: boolean;
  matchedUser?: { 
    id: string; 
    name: string; 
    image: string | null;
    title?: string | null;
  };
  teamId?: string | null;
  chatId?: string | null;
  hackathonName: string;
  currentUserImage?: string | null;
  currentUserTitle?: string | null;
  onClose: () => void;
  // Invitation specific
  matchType?: 'match' | 'teamInvite' | 'dm';
  relatedId?: string; // Notification ID
}

// Floating particle for celebration effect
function Particle({ delay, x, color, randomX }: { delay: number; x: number; color: string; randomX: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -200, -400, -500],
        x: [x, x + randomX],
        scale: [0, 1, 0.8, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2.5,
        delay,
        ease: 'easeOut',
      }}
      className="absolute bottom-1/2 left-1/2 pointer-events-none"
    >
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

const PARTICLE_COLORS = [
  '#818cf8', '#a78bfa', '#c084fc', '#f472b6',
  '#34d399', '#fbbf24', '#60a5fa', '#f87171',
];

export default function MatchOverlay({
  isOpen,
  matchedUser,
  teamId,
  chatId,
  currentUserImage,
  currentUserTitle,
  onClose,
  matchType = 'match',
  relatedId
}: MatchOverlayProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAcceptInvite = async () => {
    if (!relatedId) return;
    setAccepting(true);
    try {
      const res = await apiFetch(`/api/teams/invites/${relatedId}/accept`, {
        method: 'POST'
      });
      if (res.ok) {
        setAccepted(true);
        setTimeout(() => {
          onClose();
          router.push('/dashboard/messages');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to accept invite:', err);
    } finally {
      setAccepting(false);
    }
  };

  const matchedInitials = matchedUser?.name
    ? matchedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const isInvite = matchType === 'teamInvite';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0c14]/95 backdrop-blur-xl"
        >
          {/* Celebration Particles */}
          {(matchType === 'match' || accepted) && Array.from({ length: 30 }).map((_, i) => (
            <Particle
              key={i}
              delay={i * 0.05}
              x={(i % 2 === 0 ? 1 : -1) * (i * 12)}
              randomX={(i % 3 === 0 ? 1 : -1) * 60}
              color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-full max-w-md flex flex-col items-center px-8 text-center"
          >
            {/* Avatars & Connection UI */}
            <div className="relative flex items-center justify-center mb-16 w-full">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              
              {/* Center Bolt */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="absolute z-10 h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.8)]"
              >
                <Bolt className="h-6 w-6 text-indigo-600 fill-indigo-600" />
              </motion.div>

              {/* Left Avatar (Current User) */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="relative z-0 group"
              >
                <div className="h-28 w-28 rounded-full border-4 border-indigo-500/30 p-1 bg-[#0a0c14]">
                  <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800 relative shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                    {currentUserImage ? (
                      <Image src={currentUserImage} alt="You" fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white bg-indigo-600">
                        ME
                      </div>
                    )}
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-lg bg-[#0a0c14] border border-zinc-800 shadow-xl">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    {currentUserTitle?.split(' ')[0] || 'DEV'}
                  </span>
                </div>
              </motion.div>

              <div className="w-16" /> {/* Spacer for bolt */}

              {/* Right Avatar (Matched User) */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                className="relative z-0"
              >
                <div className="h-28 w-28 rounded-full border-4 border-purple-500/30 p-1 bg-[#0a0c14]">
                  <div className="h-full w-full rounded-full overflow-hidden bg-zinc-800 relative shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                    {matchedUser?.image ? (
                      <Image src={matchedUser.image} alt={matchedUser.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white bg-purple-600">
                        {matchedInitials}
                      </div>
                    )}
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute -bottom-2 -left-2 px-3 py-1 rounded-lg bg-[#0a0c14] border border-zinc-800 shadow-xl">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {matchedUser?.title?.split(' ')[0] || 'DES'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-5xl md:text-6xl font-black italic text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-2">
                IT&apos;S A MATCH!
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xs mx-auto leading-relaxed">
                You and <span className="text-white font-bold">{matchedUser?.name || 'Alex'}</span> are ready to build something great together.
              </p>
            </motion.div>

            {/* Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 w-full space-y-4"
            >
              {isInvite && !accepted ? (
                <button
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  <UserPlus className="h-6 w-6" />
                  <span className="text-lg font-black uppercase tracking-widest">Accept & Join</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (chatId) router.push(`/dashboard/chats/${chatId}`);
                    else if (teamId) router.push(`/dashboard/teams/${teamId}`);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  <Send className="h-6 w-6" />
                  <span className="text-lg font-black uppercase tracking-widest">Send a Message</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 text-zinc-400 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Compass className="h-6 w-6" />
                <span className="text-lg font-black uppercase tracking-widest">Keep Swiping</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
