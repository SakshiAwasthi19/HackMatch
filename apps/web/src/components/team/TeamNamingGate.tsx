'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trophy, Clock } from 'lucide-react';

interface TeamNamingGateProps {
  teamId: string;
  isLeader: boolean;
  onNamed: (name: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TeamNamingGate({ teamId, isLeader, onNamed }: TeamNamingGateProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      setError('Team name must be between 2 and 50 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/teams/${teamId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to name team');
      }

      onNamed(trimmed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md mx-4 w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            {isLeader ? (
              <Trophy className="h-7 w-7 text-amber-400" />
            ) : (
              <Clock className="h-7 w-7 text-zinc-400" />
            )}
          </div>

          {isLeader ? (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Name Your Team</h2>
              <p className="text-sm text-zinc-400">
                Give your team a name to unlock the group chat. Your teammates are waiting!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Waiting for Team Name</h2>
              <p className="text-sm text-zinc-400">
                Your team leader needs to name the team before the group chat becomes available.
              </p>
            </>
          )}
        </div>

        {isLeader ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Team Rocket, ByteBusters"
                maxLength={50}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-indigo-500 outline-none transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1.5">{name.length}/50 characters</p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || name.trim().length < 2}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2
                         shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Save Team Name
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-500">Checking for updates...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
