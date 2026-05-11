'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth-client';
import Image from 'next/image';
import { Rocket, Eye, CheckCircle2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string | null;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter();

  let meta: {
    senderName?: string;
    senderAvatar?: string;
    hackathonTitle?: string;
    message?: string;
  } | null = null;

  try {
    if (notification.type === 'CONNECT_INVITE') {
      meta = JSON.parse(notification.content);
    }
  } catch (e) {
    console.error('Failed to parse notification content', e);
  }

  const handleAcceptInvite = async () => {
    if (!notification.relatedId) return;
    
    try {
      // 1. Create interest (if not exists)
      await apiFetch(`/api/hackathons/${notification.relatedId}/interest`, { method: 'POST' });
      
      // 2. Mark notification as read
      onMarkAsRead(notification.id);
      
      toast.success("Interest marked! Redirecting to swipe deck...", {
        icon: '🎯',
        style: {
          borderRadius: '1rem',
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a',
        },
      });

      // 3. Redirect to swipe deck
      router.push(`/dashboard/hackathons/${notification.relatedId}/swipe`);
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (notification.type === 'CONNECT_INVITE' && meta) {
    return (
      <div 
        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all ${!notification.isRead ? 'bg-indigo-500/5' : ''}`}
      >
        <div className="flex gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-zinc-800">
            {meta.senderAvatar ? (
              <Image src={meta.senderAvatar} alt={meta.senderName || 'Avatar'} width={40} height={40} className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-indigo-600 text-white font-bold text-xs">
                {meta.senderName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Rocket className="h-3 w-3" />
              Team Invite
            </p>
            <p className="text-sm text-white font-bold">
              {meta.senderName} <span className="text-zinc-400 font-medium">wants you on their team for</span> {meta.hackathonTitle}
            </p>
          </div>
        </div>

        <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-3 mb-3">
          <p className="text-xs text-zinc-400 italic leading-relaxed">
            &quot;{meta.message}&quot;
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/hackathons/${notification.relatedId}`)}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-zinc-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
          <button
            onClick={handleAcceptInvite}
            className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="h-3 w-3" />
            Accept & Join
          </button>
        </div>
      </div>
    );
  }

  // Default notification rendering
  return (
    <div 
      className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-rose-500/5' : ''}`}
      onClick={() => {
        if (!notification.isRead) onMarkAsRead(notification.id);
      }}
    >
      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500">
        <User className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 cursor-default">
        <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-zinc-300'}`}>
          {notification.content}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          {new Date(notification.createdAt).toLocaleDateString()}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5"></div>
      )}
    </div>
  );
}
