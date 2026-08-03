import MessageBubble from "./MessageBubble";
import type { MessageListProps, Message } from "../../types/models";
import { useEffect, useState, useRef } from "react";
import { api } from "../../services/api";
import { useSignalR } from "../../context/SignalRContext";
import { useTypingIndicator } from "../../hooks/useTypingIndicator"; // <-- Import hook

export default function MessageList({ activeChat, currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { subscribe } = useSignalR();
  const isTyping = useTypingIndicator(activeChat?.conversationId);

  /* -------------------- SCROLL TO BOTTOM -------------------- */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]); // Scroll down when typing indicator appears too

  /* -------------------- FETCH INITIAL MESSAGES -------------------- */
  useEffect(() => {
    if (!activeChat?.conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);

    api.getMessages(activeChat.conversationId).then((data: Message[]) => {
      setMessages(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [activeChat?.conversationId]);

  /* -------------------- REAL-TIME SIGNALR SUBSCRIPTION -------------------- */
  useEffect(() => {
    if (!activeChat?.conversationId) return;

    const handleReceiveMessage = (message: Message) => {
      if (message.conversationId === activeChat.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    const unsubscribe = subscribe("ReceiveMessage", handleReceiveMessage);
    return () => unsubscribe();
  }, [activeChat?.conversationId, subscribe]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-2 md:px-6 md:py-4"
      style={{ maxHeight: "calc(100dvh - 136px)", scrollbarWidth: "thin" }}
    >
      {loading && (
        <div className="text-sm text-[var(--text-secondary)] text-center">
          Loading messages…
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="text-sm text-[var(--text-secondary)] text-center mt-50">
          No messages yet. Say hi 👋
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          content={m.content}
          isMine={m.senderId === currentUser.id}
          time={new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      ))}

      {/* Typing Indicator Bubble at bottom of message list */}
      {isTyping && (
        <div className="flex items-center gap-2 my-2 text-xs text-[var(--text-secondary)] italic animate-pulse">
          <div className="bg-[var(--bg-surface)] px-3 py-2 rounded-xl border border-[var(--border)]">
            typing...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}