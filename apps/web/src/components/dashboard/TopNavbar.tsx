/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Code2, Compass, LayoutGrid, MessageSquare, Users, LogOut, User, Bell, Zap } from 'lucide-react';
import { authClient, apiFetch } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import ProfileModal from '../shared/ProfileModal';

export type TabType = 'hackathons' | 'swipe' | 'explore' | 'matches' | 'messages' | 'profile' | 'admin';

interface TopNavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onShowMatch?: (data: any) => void;
}

export default function TopNavbar({ activeTab, onTabChange, user, onShowMatch }: TopNavbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewingUser, setViewingUser] = useState<{
    name: string;
    image: string | null;
    title: string | null;
    bio: string | null;
    college: string | null;
    city: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    skills: string[] | { skill: { name: string } }[];
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Polling every 5s for faster updates
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: any) => {
    if (notification.type === 'INTEREST' && notification.actor) {
      onTabChange('swipe');
    }
    if (notification.type === 'MATCH') {
      try {
        const res = await apiFetch(`/api/matches/${notification.relatedId}`);
        if (res.ok) {
          const matchData = await res.json();
          onShowMatch?.(matchData);
        }
      } catch (err) {
        console.error('Error fetching match for overlay:', err);
      }
      onTabChange('matches');
    }
    setShowNotifications(false);
    
    // Mark as read
    if (!notification.isRead) {
      try {
        await apiFetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
        fetchNotifications();
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'hackathons', label: 'Hackathons', icon: LayoutGrid },
    { id: 'swipe', label: 'Swipe', icon: Zap },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'matches', label: 'Matches', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin', icon: Code2 });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('hackathons')}>
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent hidden sm:block">
              HackMatch
            </span>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-1 sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-500' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Notifications + Profile */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-all duration-200
                  ${showNotifications 
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-zinc-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 flex gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-0
                            ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex-shrink-0 flex items-center justify-center">
                            {notification.actor?.image ? (
                              <img src={notification.actor.image} alt="" className="h-full w-full object-cover rounded-full" />
                            ) : (
                              <User className="h-5 w-5 text-indigo-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                              {notification.content}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-200 overflow-hidden
                ${activeTab === 'profile'
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
            >
              {user?.image ? (
                <img src={user.image} alt="Profile" className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onTabChange('profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

      <ProfileModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        user={viewingUser} 
      />
      
      {/* Mobile Navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-2 hide-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as TabType)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 min-w-[70px] rounded-lg
                ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'fill-indigo-100 dark:fill-indigo-900/50' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
