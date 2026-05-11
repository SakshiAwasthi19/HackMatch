"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/auth-client";
import { Send, Loader2, Video, Phone, MoreVertical, PlusCircle, Smile } from "lucide-react";
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
  teamName?: string | null;
  memberCount?: number;
}

export function ChatBox({ chatId, currentUser, teamName, memberCount }: ChatBoxProps) {
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
      const orderedData = [...data].reverse();
      
      if (cursor) {
        setMessages((prev) => [...orderedData, ...prev]);
      } else {
        setMessages(orderedData);
      }
      
      setHasMore(data.length === 30);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [chatId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMessages();
    }, 0);
    const channel = supabase.channel(`chat:${chatId}`);
    
    channel
      .on("broadcast", { event: "new_message" }, (payload: { payload: ChatMessage }) => {
        const newMessage = payload.payload;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    if (scrollContainerRef.current.scrollTop === 0 && hasMore && !loadingMore && messages.length > 0) {
      setLoadingMore(true);
      const oldestMessageId = messages[0].id;
      fetchMessages(oldestMessageId);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const content = inputValue.trim();
    setInputValue("");

    try {
      const res = await apiFetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const newMessage = await res.json();
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setInputValue(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050508]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#050508] relative">
      {/* Chat Header */}
      <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between bg-[#0a0a0f]/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="w-full h-full rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black">
              {teamName ? teamName.charAt(0) : "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#0a0a0f]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">
              {teamName || "Direct Message"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {memberCount || 2} Members • Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4 space-y-6"
      >
        <div className="flex justify-center mb-10">
          <span className="px-4 py-1.5 bg-zinc-900/50 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border border-white/5">Today</span>
        </div>

        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center">
               <PlusCircle className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">No transmissions recorded</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            const prevMsg = messages[idx - 1];
            const isConsecutive = prevMsg?.senderId === msg.senderId;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  
                  {/* Avatar for others */}
                  {!isMe && !isConsecutive && (
                    <div className="w-9 h-9 rounded-[14px] overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/5 shadow-xl">
                      {msg.sender?.image ? (
                        <Image 
                          src={msg.sender.image} 
                          alt={msg.sender.name || "User"} 
                          width={36} 
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
                          {msg.sender?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                  )}
                  {(!isMe && isConsecutive) && <div className="w-9 flex-shrink-0" />}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && !isConsecutive && (
                      <span className="text-[10px] font-bold text-zinc-500 mb-1.5 ml-1">{msg.sender?.name}</span>
                    )}
                    <div 
                      className={`relative px-5 py-3 shadow-xl ${
                        isMe 
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[20px] rounded-br-none' 
                          : 'bg-[#14141c] text-zinc-300 border border-white/5 rounded-[20px] rounded-bl-none'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      <span className="text-[13px] font-medium leading-relaxed">{msg.content}</span>
                      
                      {/* Message Status/Tail (Visual) */}
                      {isMe && !isConsecutive && (
                        <div className="absolute bottom-0 -right-1 w-4 h-4 bg-purple-700 rounded-bl-full" />
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Redesigned) */}
      <div className="p-6 px-8 border-t border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <form onSubmit={sendMessage} className="flex gap-4 items-center bg-[#0a0a0f] border border-white/10 rounded-xl p-1.5 pl-5 focus-within:border-indigo-500/50 transition-all shadow-2xl">
          <button type="button" className="text-zinc-600 hover:text-zinc-400 p-1">
            <PlusCircle className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-0 py-2.5"
            disabled={sending}
          />
          <div className="flex items-center gap-2">
            <button type="button" className="text-zinc-600 hover:text-zinc-400 p-1">
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim() || sending}
              className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:grayscale hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-95"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
