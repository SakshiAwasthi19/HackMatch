"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiFetch, useSession } from "@/lib/auth-client";

interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await apiFetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase.channel(`notifications:${session.user.id}`);
    
    channel
      .on("broadcast", { event: "new_notification" }, (payload: { payload: unknown }) => {
        const newNotif = payload.payload as Notification;
        setNotifications((prev) => [newNotif, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch(`/api/notifications/read-all`, { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950/50">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-rose-500 hover:text-rose-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-rose-500/5' : ''}`}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                    }}
                  >
                    <div className="flex-1 min-w-0 cursor-default">
                      <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-zinc-300'}`}>
                        {notif.content}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
