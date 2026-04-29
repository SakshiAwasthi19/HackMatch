'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  Star,
  ExternalLink,
  ChevronRight,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  city?: string;
  mode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  websiteUrl?: string;
  _count: {
    interests: number;
    registrations: number;
  };
}

export default function HackathonDiscovery() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/hackathons`)
      .then(res => res.json())
      .then(data => {
        setHackathons(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredHackathons = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Explore Hackathons
            </h1>
            <p className="text-zinc-400 mt-2 text-lg">Find your next challenge and build something amazing.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by name or tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 focus:border-indigo-500 outline-none transition-all shadow-lg"
            />
          </div>
        </header>

        {filteredHackathons.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <Trophy className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">No hackathons found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredHackathons.map((h, idx) => (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy className="h-7 w-7 text-indigo-400" />
                    </div>
                    <div className="flex gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold tracking-wider",
                        h.mode === 'ONLINE' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        h.mode === 'IN_PERSON' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {h.mode}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {h.name}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow">
                    {h.description}
                  </p>

                  <div className="space-y-3 mb-8 text-sm text-zinc-500">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4" />
                      {new Date(h.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4" />
                      {h.city || (h.mode === 'ONLINE' ? 'Remote' : 'Location TBA')}
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      {h._count.registrations} Registered • {h._count.interests} Interested
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                    <Link 
                      href={`/dashboard/hackathons/${h.id}`}
                      className="flex-grow bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    {h.websiteUrl && (
                      <a 
                        href={h.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 text-zinc-400" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
