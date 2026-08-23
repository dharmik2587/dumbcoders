'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, MessageSquare } from 'lucide-react';

type MessageItem = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  authorName: string | null;
  authorUsername: string;
  authorAvatar: string | null;
  authorStudentCode: string | null;
};

export function TeamChat({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const { data: messages, isLoading, refetch } = useQuery<MessageItem[]>({
    queryKey: ['team-messages', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/messages`);
      if (!res.ok) throw new Error('Could not load team messages');
      const body = await res.json();
      return body.data;
    },
    refetchInterval: 3000, // Poll every 3 seconds for live chat
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent('');
        void refetch();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Team Room Chat</h2>
        </div>
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Neon Realtime Stream</span>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && <p className="text-center text-sm text-slate-400">Loading messages…</p>}

        {!isLoading && (!messages || messages.length === 0) && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <MessageSquare className="h-10 w-10 stroke-1 text-slate-300" />
            <p className="mt-2 text-sm">No messages yet. Start the conversation with your teammates!</p>
          </div>
        )}

        {messages?.map((msg) => {
          const isMe = msg.userId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-700">
                  {msg.authorName || msg.authorUsername}
                </span>
                {msg.authorStudentCode && (
                  <span className="font-mono text-[10px] rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                    {msg.authorStudentCode}
                  </span>
                )}
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message to your team..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
