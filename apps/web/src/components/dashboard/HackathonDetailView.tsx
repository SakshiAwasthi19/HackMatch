'use client';

import React from 'react';
import { 
  Calendar, MapPin, Globe, ArrowUpRight, Users, 
  ChevronRight, ArrowLeft, Heart, Share2, Info,
  Trophy, Lightbulb, Users2, HelpCircle, ExternalLink
} from 'lucide-react';

import { Hackathon } from '@/lib/types';
import Image from 'next/image';

interface HackathonDetailViewProps {
  hackathon: Hackathon;
  onBack: () => void;
  onFindTeam: (hackathonId: string) => void;
  onToggleInterest: () => void;
}

export default function HackathonDetailView({ hackathon, onBack, onFindTeam, onToggleInterest }: HackathonDetailViewProps) {
  if (!hackathon || !hackathon.name) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-zinc-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  // Format dates
  const startDateStr = hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) : 'TBA';
  const endDateStr = hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) : 'TBA';
  const fullDateStr = hackathon.startDate ? `${startDateStr} - ${endDateStr}, ${new Date(hackathon.startDate).getFullYear()}` : 'Date TBA';

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm"
        >
          <div className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-500/10 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </div>
          Back to Hackathons
        </button>
        <div className="flex items-center gap-4">
          <button className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">
            <Share2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onToggleInterest}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all ${
              hackathon.isInterested 
                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                : 'border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${hackathon.isInterested ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[600px] w-full rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
        {/* Background Poster */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ 
            backgroundImage: `url(${hackathon.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop'})` 
          }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-12 md:px-24 space-y-8 max-w-4xl">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                {hackathon.mode || 'Global Hackathon'} {new Date(hackathon.startDate).getFullYear()}
              </div>
              {hackathon.tags && hackathon.tags.map((tag: string) => (
                <div key={tag} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
                  {tag}
                </div>
              ))}
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
              {hackathon.name.split(' ').map((word: string, i: number) => (
                <span key={i} className={i === hackathon.name.split(' ').length - 1 ? 'text-indigo-500 opacity-80' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium max-w-2xl">
              {hackathon.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-4 border-t border-zinc-800/50 w-fit">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date</p>
              <p className="text-xl font-bold text-white whitespace-nowrap">{startDateStr} - {endDateStr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Location</p>
              <p className="text-xl font-bold text-white whitespace-nowrap">{hackathon.city || hackathon.location || 'Global Virtual'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Prize Pool</p>
              <p className="text-xl font-bold text-indigo-400">$50,000 USD</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <a 
              href={hackathon.websiteUrl || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
            >
              Apply Now
              <ExternalLink className="h-5 w-5" />
            </a>
            <button 
              onClick={() => onFindTeam(hackathon.id)}
              className="px-10 py-5 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 hover:border-zinc-500 text-white rounded-2xl font-black text-lg transition-all hover:-translate-y-1 flex items-center gap-3"
            >
              <Users2 className="h-5 w-5" />
              Find Your Team
            </button>
          </div>
        </div>
      </section>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          {/* About */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              <h2 className="text-4xl font-black text-white tracking-tight">About the Event</h2>
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              {hackathon.name} is more than a hackathon; it is a convergence of visionaries and architects. 
              We are challenging developers to push the boundaries of technology, from decentralized intelligence 
              to scalable infrastructure. 
            </p>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              Over three intensive days, you'll have access to state-of-the-art compute resources, exclusive APIs from 
              our partners, and a curated network of mentors who are defining the next era of the internet.
            </p>
          </div>

          {/* Tracks */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              <h2 className="text-4xl font-black text-white tracking-tight">Tracks & Challenges</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  title: 'Generative AI', 
                  desc: 'Build novel multi-modal interfaces or agentic workflows that leverage local-first LLMs.', 
                  icon: Lightbulb,
                  tags: ['PyTorch', 'VectorDB']
                },
                { 
                  title: 'Web3 Infrastructure', 
                  desc: 'Optimize protocol layers or data availability solutions for the next billion users.', 
                  icon: Globe,
                  tags: ['Rust', 'Solidity']
                }
              ].map((track, i) => (
                <div key={i} className="p-8 bg-[#0a0a0c] border border-zinc-800 rounded-[2rem] space-y-6 hover:border-zinc-700 transition-all group">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <track.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">{track.title}</h3>
                    <p className="text-zinc-500 leading-relaxed">{track.desc}</p>
                  </div>
                  <div className="flex gap-3">
                    {track.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 p-8 bg-[#0a0a0c] border border-zinc-800 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-zinc-700 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">Decentralized Intelligence</h3>
                    <p className="text-zinc-500">The master track: merging high-octane AI inference with execution environments.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-purple-400">$20k</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Special Prize</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-12">
          {/* Mentors */}
          <div className="p-8 bg-[#0a0a0c] border border-zinc-800 rounded-[2.5rem] space-y-8">
            <h3 className="text-2xl font-bold text-white">Mentors & Judges</h3>
            <div className="grid grid-cols-2 gap-8">
              {[
                { name: 'Judith V.', role: 'OpenAI', img: 'https://i.pravatar.cc/150?u=judith' },
                { name: 'Marcus T.', role: 'Solana Labs', img: 'https://i.pravatar.cc/150?u=marcus' },
                { name: 'Elena K.', role: 'Anthropic', img: 'https://i.pravatar.cc/150?u=elena' },
                { name: 'Samir D.', role: 'ETH Foundation', img: 'https://i.pravatar.cc/150?u=samir' }
              ].map((mentor, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-zinc-800 p-1 relative">
                    <Image 
                      src={mentor.img} 
                      alt={mentor.name} 
                      fill
                      className="rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{mentor.name}</p>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">{mentor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="p-8 bg-[#0a0a0c] border border-zinc-800 rounded-[2.5rem] space-y-8">
            <h3 className="text-2xl font-bold text-white">Quick FAQ</h3>
            <div className="space-y-6">
              {[
                { q: 'Who can apply?', a: 'Developers, designers, and PMs. Solo or teams of up to 4.' },
                { q: 'Hardware requirements?', a: 'We provide H100 cloud instances for GenAI track participants.' },
                { q: 'Is it remote-friendly?', a: 'Yes, though the San Francisco hub offers live mentorship.' }
              ].map((faq, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-black text-white">{faq.q}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-indigo-400 font-bold text-xs pt-4 border-t border-zinc-800/50">
              See all questions
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
