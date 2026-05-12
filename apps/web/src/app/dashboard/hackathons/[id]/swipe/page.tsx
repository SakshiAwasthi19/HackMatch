'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession, apiFetch } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import { SwipeResult, SwipeDeckUser } from '@/lib/types';
import MatchOverlay from '@/components/match/MatchOverlay';
import ConnectInviteModal from '@/components/dashboard/ConnectInviteModal';

interface Hackathon {
  name: string;
}

// Removed local API_URL constant in favor of apiFetch utility

export default function SwipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hackathonId } = use(params);
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<SwipeResult | null>(null);
  const [connectingUser, setConnectingUser] = useState<SwipeDeckUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ title?: string | null } | null>(null);

  // Fetch hackathon info
  useEffect(() => {
    if (sessionLoading || !session) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch hackathon details
        const hackRes = await apiFetch(`/api/hackathons/${hackathonId}`);
        if (!hackRes.ok) throw new Error('Failed to load hackathon');
        const hackData: Hackathon = await hackRes.json();
        setHackathon(hackData);

        // Fetch current user profile for badges
        const profileRes = await apiFetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserProfile(profileData);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hackathonId, session, sessionLoading]);

  const handleMatch = (result: SwipeResult) => {
    setMatchResult(result);
  };

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
          <button
            onClick={() => router.push('/dashboard/hackathons')}
            className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{hackathon?.name || 'Loading...'}</h1>
            <p className="text-xs text-zinc-500">Swipe to find teammates</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-zinc-500">Loading potential teammates...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[500px] gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">😔</span>
            </div>
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <SwipeDeck
              context={{ mode: 'hackathon', hackathonId }}
              onConnect={(user) => setConnectingUser(user)}
              onMatch={handleMatch}
            />
          </motion.div>
        )}
      </main>

      {/* Match Overlay */}
      {matchResult?.matched && matchResult.matchedUser && (
        <MatchOverlay
          isOpen={true}
          matchedUser={matchResult.matchedUser}
          teamId={matchResult.teamId}
          chatId={matchResult.chatId || ''}
          hackathonName={hackathon?.name || ''}
          currentUserImage={session.user?.image || null}
          currentUserTitle={currentUserProfile?.title}
          onClose={() => setMatchResult(null)}
          onAction={({ chatId }) => {
            setMatchResult(null);
            if (chatId) router.push(`/dashboard?tab=messages&chatId=${chatId}`);
            else router.push('/dashboard?tab=messages');
          }}
        />
      )}

      <ConnectInviteModal
        isOpen={!!connectingUser}
        onClose={() => setConnectingUser(null)}
        user={connectingUser}
        onSuccess={() => {
          // Success behavior (card usually flies away anyway)
        }}
      />
    </div>
  );
}
