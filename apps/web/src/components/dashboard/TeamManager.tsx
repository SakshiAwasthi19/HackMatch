'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Tag, Plus, X, Loader2, CheckCircle2, Trophy } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';

interface Team {
  id: string;
  name: string | null;
  lookingFor: string[];
  hackathon: {
    name: string;
  };
  currentUserRole: string;
}

const SUGGESTED_TAGS = [
  'Frontend', 'Backend', 'Fullstack', 'UI/UX Design', 'ML/AI',
  'DevOps', 'Blockchain', 'Mobile', 'Data Science', 'Security',
  'Project Manager', 'Technical Writer'
];

export default function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchTeams = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      // Fetch teams where user is a member, then filter for leaders
      // Or we can add an endpoint for this. For now let's fetch all user teams.
      // Assuming /api/teams/my returns teams the user is in.
      const res = await apiFetch('/api/profile/teams'); // Need to verify if this exists
      if (res.ok) {
        const data = await res.json();
        setTeams(data.filter((t: Team) => t.currentUserRole === 'LEADER'));
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTeams]);

  const handleUpdateTags = async (teamId: string, tags: string[]) => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await apiFetch(`/api/teams/${teamId}/tags`, {
        method: 'PUT',
        body: JSON.stringify({ tags }),
      });

      if (!res.ok) throw new Error('Failed to update tags');
      
      setTeams(teams.map(t => t.id === teamId ? { ...t, lookingFor: tags } : t));
      setStatus({ type: 'success', message: 'Tags updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err: unknown) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update tags' });
    } finally {
      setSaving(false);
    }
  };

  const addTag = (teamId: string, tag: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const trimmed = tag.trim();
    if (trimmed && !team.lookingFor.includes(trimmed)) {
      handleUpdateTags(teamId, [...team.lookingFor, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (teamId: string, tag: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    handleUpdateTags(teamId, team.lookingFor.filter(t => t !== tag));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
        <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Teams Managed</h3>
        <p className="text-zinc-500 max-w-xs mx-auto">
          You only manage teams where you are the leader. Start a hackathon to lead your own squad!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Lead Your Squads
          </h2>
          <p className="text-zinc-500 mt-1">Manage your team signals and attract the right talent.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {teams.map((team) => (
          <div 
            key={team.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {team.name || 'Unnamed Team'}
                </h3>
                <p className="text-sm text-zinc-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  {team.hackathon.name}
                </p>
              </div>
              <button 
                onClick={() => setEditingId(editingId === team.id ? null : team.id)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
              >
                {editingId === team.id ? 'Close Editor' : 'Manage Signals'}
              </button>
            </div>

            {/* Looking For Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <Tag className="h-3.5 w-3.5" />
                Looking For
              </div>
              
              <div className="flex flex-wrap gap-2">
                {team.lookingFor.length === 0 && !editingId && (
                  <p className="text-sm text-zinc-600 italic">No signals set. Other users won&apos;t know what you need!</p>
                )}
                {team.lookingFor.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20"
                  >
                    {tag}
                    {editingId === team.id && (
                      <button onClick={() => removeTag(team.id, tag)} className="hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {editingId === team.id && (
                <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-300">
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(team.id, tagInput);
                        }
                      }}
                      placeholder="Add a role (e.g. Backend Engineer)..."
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
                    />
                    <button 
                      onClick={() => addTag(team.id, tagInput)}
                      disabled={saving}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.filter(t => !team.lookingFor.includes(t)).slice(0, 8).map((t) => (
                      <button
                        key={t}
                        onClick={() => addTag(team.id, t)}
                        className="px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-zinc-700/50 transition-all"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
