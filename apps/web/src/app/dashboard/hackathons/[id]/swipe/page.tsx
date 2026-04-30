'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import SwipeDeck from '@/components/swipe/SwipeDeck';
import { SwipeResult, SwipeDeckUser } from '@/lib/types';
import MatchOverlay from '@/components/match/MatchOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SwipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: hackathonId } = use(params);
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<{ name: string } | null>(null);
  const [users, setUsers] = useState<SwipeDeckUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [matchResult, setMatchResult] = useState<SwipeResult | null>(null);

  // Fetch hackathon info + swipe deck
  useEffect(() => {
    if (sessionLoading || !session) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch hackathon details
        const hackRes = await fetch(`${API_URL}/api/hackathons/${hackathonId}`, {
          credentials: 'include',
        });
        if (!hackRes.ok) throw new Error('Failed to load hackathon');
        const hackData = await hackRes.json();
        setHackathon(hackData);

        // Fetch swipe deck
        const deckRes = await fetch(`${API_URL}/api/hackathons/${hackathonId}/swipe-deck`, {
          credentials: 'include',
        });
        if (!deckRes.ok) throw new Error('Failed to load swipe deck');
        const deckData = await deckRes.json();
        setUsers(deckData.map((u: any) => ({
          ...u,
          image: u.image || null,
          bio: u.bio || null,
          title: u.title || null,
          college: u.college || null,
          city: u.city || null,
          linkedinUrl: u.linkedinUrl || null,
          githubUrl: u.githubUrl || null,
          skills: u.skills || []
        })));
        setDeckEmpty(deckData.length === 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hackathonId, session, sessionLoading]);

  const handleSwipe = async (userId: string, type: 'LEFT' | 'RIGHT'): Promise<SwipeResult> => {
    const res = await fetch(`${API_URL}/api/swipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: userId, hackathonId, type }),
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Swipe failed');
    }

    return res.json();
  };

  const handleMatch = (result: SwipeResult) => {
    setMatchResult(result);
  };

  const handleEmpty = () => {
    setDeckEmpty(true);
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
            {deckEmpty ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Sparkles className="h-10 w-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold">No more profiles!</h2>
                <p className="text-zinc-500">You&apos;ve seen everyone for this hackathon. Check back later!</p>
                <button
                  onClick={() => router.push('/dashboard/hackathons')}
                  className="mt-4 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Back to Hackathons
                </button>
              </div>
            ) : (
              <SwipeDeck
                users={users}
                onSwipe={handleSwipe}
                onEmpty={handleEmpty}
                onMatch={handleMatch}
              />
            )}
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
          onClose={() => setMatchResult(null)}
        />
      )}
    </div>
  );
}
