"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApiStore, useMe } from "@/client/store/apiStore";
import { SectionHead } from "@/components/ui";
import { Avatar } from "@/components/shared";
import { Send } from "lucide-react";
import { cn } from "@/client/utils/cn";

function MessagesContent() {
  const me = useMe();
  const conversations = useApiStore((s) => s.conversations);
  const loadConversations = useApiStore((s) => s.loadConversations);
  const loadConversationMessages = useApiStore((s) => s.loadConversationMessages);
  const sendConversationMessage = useApiStore((s) => s.sendConversationMessage);
  const startConversation = useApiStore((s) => s.startConversation);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations().finally(async () => {
      setLoading(false);
      const startId = searchParams?.get("start") ?? searchParams?.get("to");
      if (startId) {
        const existing = useApiStore.getState().conversations.find((c) => c.other?.id === startId);
        if (existing) {
          setActiveId(existing.conversationId);
        } else {
          try {
            const newConvId = await startConversation(startId);
            if (newConvId) setActiveId(newConvId);
          } catch (e) {
            console.error("Failed to start conversation", e);
          }
        }
        router.replace("/messages");
      }
    });
  }, [loadConversations, searchParams, startConversation, router]);

  useEffect(() => {
    if (activeId) {
      loadConversationMessages(activeId);
    }
  }, [activeId, loadConversationMessages]);

  const active = conversations.find((c) => c.conversationId === activeId);

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-[1400px] flex-col overflow-hidden px-5 md:px-10">
      <SectionHead
        index="06"
        kicker="Inbox"
        title={<>Direct Messages</>}
        sub="Chat 1-on-1 with potential teammates to coordinate roles."
      />

      <div className="mt-8 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm mb-10">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 flex-col overflow-y-auto border-r border-line bg-canvas">
          {loading ? (
            <div className="p-5 text-sm text-fg3">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-5 text-sm text-fg3">No active conversations. Start one from the match page!</div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((c) => (
                <button
                  key={c.conversationId}
                  onClick={() => setActiveId(c.conversationId)}
                  className={cn(
                    "flex items-center gap-3 border-b border-line px-4 py-4 text-left transition-colors hover:bg-hover",
                    activeId === c.conversationId && "bg-accent-soft"
                  )}
                >
                  <Avatar b={{ initials: c.other?.fullName?.substring(0,2)?.toUpperCase() || 'UN', avatarUrl: c.other?.avatarUrl } as any} size={40} link={false} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-fg">{c.other?.fullName || 'Unknown User'}</div>
                    <div className="truncate text-xs text-fg3">
                      {c.other?.studentCode || c.other?.username || 'Unknown'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane */}
        <div className="flex min-w-0 flex-1 flex-col bg-canvas">
          {active ? (
            <>
              {/* Chat Header */}
              <div className="flex h-16 items-center gap-3 border-b border-line px-5 shrink-0 bg-surface">
                <Avatar b={{ initials: active.other?.fullName?.substring(0,2)?.toUpperCase() || 'UN', avatarUrl: active.other?.avatarUrl } as any} size={32} link={false} />
                <div>
                  <div className="font-semibold text-fg">{active.other?.fullName || 'Unknown User'}</div>
                  <div className="text-xs text-fg3">{active.other?.studentCode || active.other?.username || 'Unknown'}</div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5">
                {active.messages?.length === 0 ? (
                  <div className="text-center text-sm text-fg3 mt-10">No messages yet. Say hi!</div>
                ) : (
                  <div className="space-y-4 flex flex-col justify-end min-h-full">
                    {active.messages?.map((msg) => {
                      const isMe = msg.senderId === me.id;
                      return (
                        <div key={msg.id} className={cn("flex max-w-[70%]", isMe ? "ml-auto" : "mr-auto")}>
                          <div className={cn("rounded-2xl px-4 py-2 text-sm", isMe ? "bg-accent text-white" : "bg-raised text-fg")}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-line p-4 bg-surface shrink-0">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!input.trim()) return;
                    const val = input.trim();
                    setInput("");
                    await sendConversationMessage(active.conversationId, val);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm text-fg placeholder:text-fg3 outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-opacity disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-fg3">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-fg3">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
