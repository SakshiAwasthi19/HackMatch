'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, Code2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-zinc-800/50 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              HackMatch
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8"
        >
          <Sparkles className="h-4 w-4" />
          <span>The #1 platform for hackathon team formation</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-8"
        >
          Swipe. Match. <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Build Something Epic.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Stop settling for random teammates. HackMatch uses a Tinder-style discovery engine to match you with builders who complement your skills and share your vision.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            Create Your Profile
            <ChevronRight className="h-5 w-5" />
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left"
        >
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tinder for Hackers</h3>
            <p className="text-zinc-400 leading-relaxed">Swipe through developer profiles. Right swipe if you want to team up. It's a match when the interest is mutual.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Teams</h3>
            <p className="text-zinc-400 leading-relaxed">Matches instantly form a team and unlock a dedicated group chat so you can start brainstorming immediately.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm">
            <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Code2 className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Skill Matching</h3>
            <p className="text-zinc-400 leading-relaxed">Filter by frontend, backend, design, or AI. Find the exact missing piece your next winning project needs.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
