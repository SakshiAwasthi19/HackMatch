'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, MessageCircle, Info } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';
import ProfileModal from '../shared/ProfileModal';
import ProfileCard from '../shared/ProfileCard';
import { useRouter } from 'next/navigation';

interface MatchesViewProps {
  initialHackathonId?: string | null;
}

export default function MatchesView({ initialHackathonId }: MatchesViewProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<any>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const url = initialHackathonId 
        ? `/api/matches?hackathonId=${initialHackathonId}` 
        : '/api/matches';
      const res = await apiFetch(url);
      if (res.ok) {
        setMatches(await res.json());
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500 p-6">
        <div className="h-24 w-24 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
          <Heart className="h-12 w-12 text-pink-500 fill-pink-500/20" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">No Matches Yet</h2>
        <p className="text-zinc-500 max-w-sm mb-8 text-lg">
          Keep exploring and swiping! When you and another developer both swipe right, you'll see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Sparkles className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Your Matches</h2>
          <p className="text-zinc-500 text-sm font-medium">Developers you've connected with</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {matches.map((match) => (
          <div key={match.id} className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
             <div className="relative">
                <ProfileCard 
                  name={match.matchedUser.name}
                  image={match.matchedUser.image}
                  title={match.matchedUser.title}
                  bio={match.matchedUser.bio}
                  skills={match.matchedUser.skills}
                  onViewProfile={() => setViewingUser(match.matchedUser)}
                />
                
                <div className="absolute top-4 right-4 z-10">
                   <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                     {match.hackathonName}
                   </div>
                </div>

                <div className="mt-4 flex gap-3">
                   <button 
                     onClick={() => router.push(`/dashboard/messages`)}
                     className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                   >
                     <MessageCircle className="h-4 w-4" />
                     Message
                   </button>
                   <button 
                     onClick={() => setViewingUser(match.matchedUser)}
                     className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl transition-all"
                   >
                     <Info className="h-4 w-4" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <ProfileModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        user={viewingUser} 
      />
    </div>
  );
}
