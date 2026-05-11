'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Rocket, Calendar, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';
import { SwipeDeckUser } from '@/lib/types';
import toast from 'react-hot-toast';

interface Hackathon {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface ConnectInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SwipeDeckUser | null;
  onSuccess: (userId: string) => void;
}

export default function ConnectInviteModal({ isOpen, onClose, user, onSuccess }: ConnectInviteModalProps) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingHackathons, setFetchingHackathons] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchMyHackathons = async () => {
        setFetchingHackathons(true);
        try {
          const res = await apiFetch('/api/hackathons/my-active');
          if (res.ok) {
            const data = await res.json();
            setHackathons(data);
          }
        } catch (e) {
          console.error('Failed to load hackathons:', e);
        } finally {
          setFetchingHackathons(false);
        }
      };
      fetchMyHackathons();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathonId || !message || !user) return;

    setLoading(true);
    try {
      const res = await apiFetch('/api/connect-invites', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: user.id,
          hackathonId: selectedHackathonId,
          message
        })
      });

      if (!res.ok) throw new Error('Failed to send invite');
      
      toast.success(`Invite sent to ${user.name}!`, {
        icon: '🚀',
        style: {
          borderRadius: '1rem',
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a',
        },
      });
      
      onSuccess(user.id);
      onClose();
      setMessage('');
      setSelectedHackathonId('');
    } catch (err) {
      toast.error('Failed to send invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="absolute bottom-6 left-8 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Send Invite</h2>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Connect for a Hackathon</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Recipient Info */}
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Recipient</p>
                  <p className="text-sm font-black text-white">{user.name}</p>
                </div>
              </div>

              {/* Hackathon Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Target Hackathon
                </label>
                <div className="relative group">
                  <select
                    value={selectedHackathonId}
                    onChange={(e) => setSelectedHackathonId(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group-hover:border-zinc-700"
                  >
                    <option value="" disabled>Select a hackathon</option>
                    {hackathons.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-zinc-500">
                    <X className="h-4 w-4 rotate-45" />
                  </div>
                </div>
                {fetchingHackathons && (
                  <p className="text-[10px] text-indigo-400 font-bold animate-pulse ml-1">Loading your hackathons...</p>
                )}
                {!fetchingHackathons && hackathons.length === 0 && (
                  <p className="text-[10px] text-amber-500 font-bold ml-1">No active hackathons found. Join one first!</p>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Your Message
                </label>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                    required
                    placeholder="Hi, I'm looking for an ML engineer for the AI Summit — would love to have you on our team!"
                    className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-3xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                  <div className="absolute bottom-4 right-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    {message.length}/200
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-2xl font-black text-xs transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedHackathonId || !message}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
