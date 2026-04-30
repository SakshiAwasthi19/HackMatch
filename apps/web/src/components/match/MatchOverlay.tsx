'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageCircle, Trophy, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface MatchOverlayProps {
  isOpen: boolean;
  matchedUser: { id: string; name: string; image: string | null };
  teamId?: string | null;
  chatId: string;
  hackathonName: string;
  currentUserImage?: string | null;
  onClose: () => void;
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
  hackathonName,
  currentUserImage,
  onClose,
}: MatchOverlayProps) {
  const router = useRouter();

  const matchedInitials = matchedUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
        >
          {/* Celebration Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle
              key={i}
              delay={i * 0.08}
              x={(i % 2 === 0 ? 1 : -1) * (i * 15)}
              randomX={(i % 3 === 0 ? 1 : -1) * 50}
              color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]}
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="relative bg-zinc-900/95 border border-indigo-500/30 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl shadow-indigo-500/20 overflow-hidden"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Sparkle icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4"
            >
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            >
              It&apos;s a Match!
            </motion.h2>

            {/* Avatars side by side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 my-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center overflow-hidden border-2 border-emerald-400/30">
                {currentUserImage ? (
                  <div className="relative h-full w-full">
                    <Image src={currentUserImage} alt="You" fill className="object-cover" />
                  </div>
                ) : (
                  <span className="text-lg font-bold text-white">You</span>
                )}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center"
              >
                <span className="text-lg">💜</span>
              </motion.div>

              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-indigo-400/30">
                {matchedUser.image ? (
                  <div className="relative h-full w-full">
                    <Image src={matchedUser.image} alt={matchedUser.name} fill className="object-cover" />
                  </div>
                ) : (
                  <span className="text-lg font-bold text-white">{matchedInitials}</span>
                )}
              </div>
            </motion.div>

            {/* Match info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-zinc-400 mb-1">
                You matched with <span className="text-white font-semibold">{matchedUser.name}</span>
              </p>
              <p className="text-xs text-zinc-500 mb-6">for {hackathonName}</p>

              {teamId ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">A new team has been formed!</span>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/teams/${teamId}`)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    Name Your Team
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-400 mb-4">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">A DM chat has been created!</span>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/chats/${chatId}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    Open Chat
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
              >
                Continue Swiping
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
