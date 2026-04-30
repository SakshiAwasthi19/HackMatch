'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Search, Filter, Heart, Zap, Globe, Cpu, Code, ArrowUpRight } from 'lucide-react';
import { apiFetch, authClient } from '@/lib/auth-client';

interface HackathonListProps {
  onSelectHackathon: (id: string) => void;
  onCreateClick?: () => void;
}

export default function HackathonList({ onSelectHackathon, onCreateClick }: HackathonListProps) {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const filters = ['All Events', 'AI', 'Web3', 'Open Source', 'Finance', 'Cyber Security'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Hackathons
        const hRes = await apiFetch('/api/hackathons');
        if (hRes.ok) {
          const hData = await hRes.json();
          setHackathons(hData);
        }

        // Fetch Request Status
        if (session && !isAdmin) {
          const rRes = await apiFetch('/api/admin/my-request');
          if (rRes.ok) {
            const rData = await rRes.json();
            setHasPendingRequest(rData.status === 'PENDING');
          }
        }
      } catch (err: any) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [session, isAdmin]);

  const filteredHackathons = hackathons.filter(h => {
    const matchesFilter = activeFilter === 'All Events' || (h.tags && h.tags.includes(activeFilter));
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0c] border border-zinc-800/50">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10"></div>
        </div>

        <div className="relative p-10 md:p-16 space-y-6 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            Season 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">next big build.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
            Find your dream team and compete in high-octane hackathons across the globe. Precision coding meets human collaboration.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {isAdmin && (
              <button
                onClick={onCreateClick}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1"
              >
                Create Hackathon
              </button>
            )}
            <button className="px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-zinc-800 rounded-2xl font-bold transition-all">
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                ${activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by theme..."
            className="w-full pl-11 pr-12 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        </div>
      </div>

      {/* Hackathon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className="group bg-[#0f0f12] border border-zinc-800/50 rounded-3xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 flex flex-col"
          >
            {/* Image Placeholder with Badge */}
            <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
              <img
                src={hackathon.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'}
                alt={hackathon.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                {hackathon.mode}
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{hackathon.name}</h3>
                  {hackathon.tags && hackathon.tags.length > 0 && (
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {hackathon.tags[0]}
                    </div>
                  )}
                </div>
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await apiFetch(`/api/hackathons/${hackathon.id}/interest`, {
                        method: 'POST'
                      });
                      if (res.ok) {
                        setHackathons(prev => prev.map(h => 
                          h.id === hackathon.id ? { ...h, isInterested: !h.isInterested } : h
                        ));
                      }
                    } catch (err) {
                      console.error('Error toggling interest:', err);
                    }
                  }}
                  className={`transition-all ${hackathon.isInterested ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                >
                  <Heart className={`h-5 w-5 ${hackathon.isInterested ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                {hackathon.description}
              </p>

              {/* Tech Stack Tags (Mock for visual) */}
              <div className="flex flex-wrap gap-2 py-1">
                {['React', 'Node.js', 'Solidity'].map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 text-xs font-medium text-indigo-400/80">
                    <span className="w-1 h-3 bg-indigo-500/40 rounded-full"></span>
                    {tag}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                    {new Date(hackathon.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(hackathon.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    {hackathon.city || hackathon.location || 'Global Virtual'}
                  </div>
                </div>
                <button
                  onClick={() => onSelectHackathon(hackathon.id)}
                  className="px-5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-black/20 flex items-center gap-2 group"
                >
                  View Details
                  <ArrowUpRight className="h-3 w-3 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredHackathons.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">No results found</h4>
              <p className="text-zinc-500 text-sm mt-2">Try adjusting your filters or search query.</p>
            </div>
          </div>
        )}



        {/* Host an Event Card */}
        <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/50 transition-all group">
          <div
            className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl"
          >
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">Host an Event?</h4>
            <p className="text-zinc-500 text-sm mt-2 max-w-[200px]">Connect with the world's most ambitious builders and designers.</p>
          </div>
          <button
            disabled={!isAdmin && hasPendingRequest}
            onClick={async () => {
              if (isAdmin) {
                onCreateClick?.();
              } else {
                // Submit Request workflow
                try {
                  const res = await apiFetch('/api/admin/host-requests', {
                    method: 'POST',
                    body: JSON.stringify({ reason: 'Wants to host a hackathon' })
                  });
                  if (res.ok) {
                    alert('Hosting request submitted successfully! Admins will review it soon.');
                    setHasPendingRequest(true);
                  } else {
                    alert('Failed to submit request. You might already have a pending request.');
                  }
                } catch (err) {
                  alert('Error submitting request.');
                }
              }
            }}
            className={`w-full py-3 border rounded-xl text-xs font-bold transition-all ${
              !isAdmin && hasPendingRequest 
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed' 
                : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 text-white'
            }`}
          >
            {isAdmin ? 'Create Now' : hasPendingRequest ? 'Pending Approval' : 'Submit Request'}
          </button>
        </div>
      </div>

      {/* Floating Action Button for Admins */}
      {isAdmin && (
        <button
          onClick={onCreateClick}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-all z-50"
        >
          <Plus className="h-8 w-8" />
        </button>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center">
          <p>Error loading hackathons: {error}</p>
        </div>
      )}
    </div>
  );
}
