'use client';

import React, { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminNewHackathon() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    city: '',
    mode: 'ONLINE',
    eligibilityType: 'OPEN',
    eligibleCollegesList: '',
    websiteUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        eligibleCollegesList: formData.eligibleCollegesList.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/hackathons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create hackathon');
      }

      setSuccess(true);
      setFormData({
        name: '', description: '', startDate: '', endDate: '',
        location: '', city: '', mode: 'ONLINE', eligibilityType: 'OPEN',
        eligibleCollegesList: '', websiteUrl: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );

  // Simple client-side admin check (backend will enforce it)
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black p-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-zinc-400 mt-2">Only administrators can access this page.</p>
        <button onClick={() => router.push('/')} className="mt-6 text-indigo-400 hover:underline">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Trophy className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold">Post a New Hackathon</h1>
          <p className="text-zinc-400 mt-2">Add details about an upcoming event to the platform.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Event Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. HackTheNorth 2025"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Description</label>
              <textarea 
                required
                rows={4}
                placeholder="What is this hackathon about?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Start Date
                </label>
                <input 
                  required
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> End Date
                </label>
                <input 
                  required
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Mode
                </label>
                <select 
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In-Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Eligibility
                </label>
                <select 
                  value={formData.eligibilityType}
                  onChange={(e) => setFormData({...formData, eligibilityType: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="OPEN">Open to All</option>
                  <option value="COLLEGE_SPECIFIC">College Specific</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> City (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Waterloo, ON"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Website URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>

            {formData.eligibilityType === 'COLLEGE_SPECIFIC' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Eligible Colleges (Comma separated)</label>
                <input 
                  type="text" 
                  placeholder="IIT Bombay, MIT, Stanford"
                  value={formData.eligibleCollegesList}
                  onChange={(e) => setFormData({...formData, eligibleCollegesList: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Hackathon created successfully!</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Hackathon"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
