'use client';

import React, { useState, useEffect } from 'react';
import { useSession, apiFetch } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Loader2, Sparkles, UserPlus } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import { SwipeResult, SwipeDeckUser } from '@/lib/types';
import MatchOverlay from '@/components/match/MatchOverlay';
import ConnectInviteModal from '@/components/dashboard/ConnectInviteModal';

export default function ExplorePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [matchResult, setMatchResult] = useState<SwipeResult | null>(null);
  const [connectingUser, setConnectingUser] = useState<SwipeDeckUser | null>(null);

  // Auth loading
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-zinc-800/50"
      >
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Compass className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Global Explore</h1>
            <p className="text-xs text-zinc-500">Network with hackers worldwide</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <SwipeDeck
            context={{ mode: 'explore' }}
            onConnect={(user) => setConnectingUser(user)}
            onMatch={(result) => setMatchResult(result)}
          />
        </motion.div>
      </main>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchResult && (
          <MatchOverlay
            match={matchResult}
            onClose={() => setMatchResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Connect Modal */}
      {connectingUser && (
        <ConnectInviteModal
          user={connectingUser}
          isOpen={!!connectingUser}
          onClose={() => setConnectingUser(null)}
        />
      )}
    </div>
  );
}
