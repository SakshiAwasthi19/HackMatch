'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function MessagesView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
        <MessageSquare className="h-12 w-12 text-blue-500" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Messages</h2>
      <p className="text-zinc-500 max-w-md mb-8 text-lg">
        Chat with your teammates and coordinate your hackathon projects here.
      </p>
    </div>
  );
}
