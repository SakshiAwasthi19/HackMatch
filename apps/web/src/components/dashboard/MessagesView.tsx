'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Users, Loader2, Edit3, Search } from 'lucide-react';
import { apiFetch, useSession } from '@/lib/auth-client';
import { ChatBox } from '../chat/ChatBox';
import TeamSidebar from '../chat/TeamSidebar';
import Image from 'next/image';

interface ChatUser {
  id: string;
  name: string;
  image: string | null;
  skills: {
    skill: {
      name: string;
    };
  }[];
}

interface TeamMember {
  userId: string;
  role: string;
  user: ChatUser;
}

interface Chat {
  id: string;
  type: 'DM' | 'GROUP';
  team?: {
    id: string;
    name: string | null;
    resources: {
      id: string;
      title: string;
      url: string;
      type: string;
    }[];
    hackathon: {
      id: string;
      name: string;
    }
  };
  members: TeamMember[];
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }[];
  updatedAt: string;
}

type FilterType = 'all' | 'teams' | 'direct';

export default function MessagesView({ initialUserId }: { initialUserId?: string | null }) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchChats = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/chat?t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Deeply fetch team details for GROUP chats to get resources and member roles
        const enrichedChats = await Promise.all(data.map(async (chat: Chat) => {
          if (chat.type === 'GROUP' && chat.team) {
            try {
              const teamRes = await apiFetch(`/api/teams/${chat.team.id}`);
              if (teamRes.ok) {
                const teamData = await teamRes.json();
                return { 
                  ...chat, 
                  team: { ...chat.team, resources: teamData.resources, name: teamData.name },
                  members: teamData.members
                };
              }
            } catch (e) {
              console.error('Failed to enrich group chat:', e);
            }
          }
          return chat;
        }));

        setChats(enrichedChats);
        
        // Auto-select chat
        if (enrichedChats.length > 0) {
          if (initialUserId) {
            const targetChat = enrichedChats.find((c: Chat) => 
              c.type === 'DM' && c.members.some(m => m.userId === initialUserId)
            );
            if (targetChat) {
              setSelectedChatId(targetChat.id);
            } else if (!selectedChatId) {
              setSelectedChatId(enrichedChats[0].id);
            }
          } else if (!selectedChatId) {
            setSelectedChatId(enrichedChats[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, [initialUserId, selectedChatId]);

  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => {
        void fetchChats();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session, fetchChats, refreshKey]);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const filteredChats = chats.filter(chat => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'teams') return chat.type === 'GROUP';
    if (activeFilter === 'direct') return chat.type === 'DM';
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
          <MessageSquare className="h-10 w-10 text-indigo-500" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Silent Channels</h2>
        <p className="text-zinc-500 max-w-sm mb-10 text-lg leading-relaxed">
          Start swiping to find teammates and mentors. Your conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#050508] overflow-hidden animate-in fade-in duration-700">
      {/* Sidebar - Conversation List (Redesigned) */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-[#0a0a0f]">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-8">
            {/* Filters */}
            <div className="flex items-center gap-2">
              {(['all', 'teams', 'direct'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                    activeFilter === f 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' 
                      : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="w-px h-4 bg-white/10" />

            <button className="p-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-full text-zinc-500 hover:text-indigo-400 transition-all active:scale-95">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-0">
          {filteredChats.map(chat => {
            let chatName = "Chat";
            let subText = "";
            let image = null;
            let label = "";
            
            if (chat.type === 'GROUP' && chat.team) {
              chatName = chat.team.name || "Unnamed Team";
              const lastMsg = chat.messages[0];
              const senderName = chat.members.find(m => m.userId === lastMsg?.senderId)?.user.name || "Someone";
              subText = lastMsg ? `${senderName}: ${lastMsg.content}` : "No messages yet";
              label = "HACKATHON";
            } else if (chat.type === 'DM') {
              const otherMember = chat.members.find(m => m.userId !== session?.user?.id);
              if (otherMember) {
                chatName = otherMember.user.name;
                subText = chat.messages[0]?.content || "Started a conversation";
                image = otherMember.user.image;
              }
            }

            const isSelected = selectedChatId === chat.id;
            const timeStr = chat.messages[0] 
              ? new Date(chat.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "";

            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-all group relative border-b border-white/5 ${
                  isSelected ? 'bg-indigo-600/5' : 'hover:bg-white/5'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-1 top-4 bottom-4 w-1 bg-indigo-500 rounded-full" />
                )}
                
                <div className="relative w-12 h-12 flex-shrink-0">
                  {image ? (
                    <Image src={image} alt={chatName} fill className="rounded-xl object-cover" />
                  ) : (
                    <div className={`w-full h-full rounded-xl flex items-center justify-center text-lg font-black ${
                      chat.type === 'GROUP' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {chatName.charAt(0)}
                    </div>
                  )}
                  {chat.type === 'GROUP' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                      {chatName}
                    </h3>
                    <span className="text-[9px] font-black text-zinc-600 uppercase flex-shrink-0">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate group-hover:text-zinc-400 leading-tight mb-1">{subText}</p>
                  {label && (
                    <span className="inline-block bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                      {label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Pane - Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050508] relative">
        {selectedChat && session?.user ? (
          <ChatBox 
            key={selectedChatId} 
            chatId={selectedChat.id} 
            currentUser={{
              id: session.user.id,
              name: session.user.name,
              image: session.user.image
            }} 
            teamName={selectedChat.type === 'GROUP' ? selectedChat.team?.name : null}
            memberCount={selectedChat.members.length}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 animate-pulse">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Connection Waiting</span>
          </div>
        )}
      </div>

      {/* Right Pane - Team Sidebar (Conditional) */}
      {selectedChat?.type === 'GROUP' && selectedChat.team && (
        <TeamSidebar 
          teamId={selectedChat.team.id}
          teamName={selectedChat.team.name}
          members={selectedChat.members as TeamMember[]}
          resources={selectedChat.team.resources || []}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
          isLeader={selectedChat.members.find(m => m.userId === session?.user?.id)?.role === 'LEADER'}
        />
      )}
    </div>
  );
}
