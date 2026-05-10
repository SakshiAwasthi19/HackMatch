'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, User as UserIcon, Loader2 } from 'lucide-react';
import { apiFetch, useSession } from '@/lib/auth-client';
import { ChatBox } from '../chat/ChatBox';

interface ChatUser {
  id: string;
  name: string;
  image: string | null;
}

interface Chat {
  id: string;
  type: 'DM' | 'GROUP';
  team?: {
    id: string;
    name: string | null;
    hackathon: {
      id: string;
      name: string;
    }
  };
  members: {
    userId: string;
    user: ChatUser;
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: string;
  }[];
  updatedAt: string;
}

export default function MessagesView() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Add cache-busting timestamp to prevent browser from returning stale empty arrays
        const res = await apiFetch(`/api/chat?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setChats(data);
          
          // Auto-select first chat if none selected
          if (data.length > 0 && !selectedChatId) {
            setSelectedChatId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchChats();
    }
  }, [session, selectedChatId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
          <MessageSquare className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">No Messages Yet</h2>
        <p className="text-zinc-400 max-w-md mb-8 text-lg">
          Match with other hackers or join a team to start chatting!
        </p>
      </div>
    );
  }

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in duration-500 shadow-2xl">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-zinc-900/50">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => {
            // Determine chat display name and icon based on type
            let chatName = "Chat";
            let icon = <Users className="w-5 h-5" />;
            
            if (chat.type === 'GROUP' && chat.team) {
              chatName = chat.team.name || `Team for ${chat.team.hackathon.name}`;
            } else if (chat.type === 'DM') {
              // Find the other user
              const otherMember = chat.members.find(m => m.userId !== session?.user?.id);
              if (otherMember) {
                chatName = otherMember.user.name;
                icon = <UserIcon className="w-5 h-5" />;
              }
            }

            const isSelected = selectedChatId === chat.id;
            const lastMessage = chat.messages[0]?.content || "Started a chat";

            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full text-left p-4 flex items-center gap-3 transition-colors border-b border-white/5 hover:bg-white/5 ${
                  isSelected ? 'bg-white/10 border-l-2 border-l-rose-500' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  chat.type === 'GROUP' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-white truncate pr-2">{chatName}</h3>
                    {chat.messages[0] && (
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {new Date(chat.messages[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 truncate">{lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        {selectedChatId && session?.user ? (
          <ChatBox 
            key={selectedChatId} // Force remount on chat change
            chatId={selectedChatId} 
            currentUser={{
              id: session.user.id,
              name: session.user.name,
              image: session.user.image
            }} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
