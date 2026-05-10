"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/auth-client";
import { Send, Loader2 } from "lucide-react";
import Image from "next/image";

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ChatBoxProps {
  chatId: string;
  currentUser: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export function ChatBox({ chatId, currentUser }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = React.useCallback(async (cursor?: string) => {
    try {
      const url = cursor 
        ? `/api/chat/${chatId}/messages?cursor=${cursor}`
        : `/api/chat/${chatId}/messages`;
        
      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      
      const data: ChatMessage[] = await res.json();
      
      // The API returns messages ordered by createdAt DESC (newest first).
      // We need to display them oldest first, so we reverse them.
      const orderedData = [...data].reverse();
      
      if (cursor) {
        setMessages((prev) => [...orderedData, ...prev]);
      } else {
        setMessages(orderedData);
      }
      
      // If we got exactly 30 messages, there might be more to fetch
      setHasMore(data.length === 30);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [chatId]);

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Subscribe to realtime broadcast
    const channel = supabase.channel(`chat:${chatId}`);
    
    channel
      .on("broadcast", { event: "new_message" }, (payload: { payload: unknown }) => {
        const newMessage = payload.payload as ChatMessage;
        setMessages((prev) => {
          // Check if message already exists (we might have just sent it)
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchMessages]);


  // Scroll to bottom when new messages arrive (if we were already at the bottom)
  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    // If scrolled to top and we have more messages, fetch older ones
    if (scrollContainerRef.current.scrollTop === 0 && hasMore && !loadingMore && messages.length > 0) {
      setLoadingMore(true);
      // The oldest message is at the start of the array
      const oldestMessageId = messages[0].id;
      fetchMessages(oldestMessageId);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const content = inputValue.trim();
    setInputValue(""); // Optimistic clear

    try {
      const res = await apiFetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      
      // We don't necessarily need to add the message manually because
      // the broadcast event will be received, but doing it manually makes it faster
      // and we have a check to prevent duplicates.
      const newMessage = await res.json();
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Revert optimistic clear on failure (simple version)
      setInputValue(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-900 rounded-xl border border-white/10">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 italic">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar */}
                  {!isMe && msg.sender && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      {msg.sender.image ? (
                        <Image 
                          src={msg.sender.image} 
                          alt={msg.sender.name || "User"} 
                          width={32} 
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white/50 uppercase">
                          {msg.sender.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && msg.sender && (
                      <span className="text-xs text-white/40 mb-1 ml-1">{msg.sender.name}</span>
                    )}
                    <div 
                      className={`px-4 py-2 rounded-2xl ${
                        isMe 
                          ? 'bg-rose-600 text-white rounded-br-sm' 
                          : 'bg-zinc-800 text-white/90 border border-white/5 rounded-bl-sm'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-zinc-950/50">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
