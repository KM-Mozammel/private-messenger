import MessageBubble from "./MessageBubble";
import type { MessageListProps, Message } from "../../types/models";
import { useEffect, useState, useRef } from "react";
import { api } from "../../services/api";
import { getConnection } from "../../services/signalR";

export default function MessageList({ activeChat, currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* -------------------- SCROLL TO BOTTOM -------------------- */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!activeChat?.conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);

    api
      .getMessages(activeChat.conversationId)
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeChat?.conversationId]);

  useEffect(() => {
    const conn = getConnection();
    if (!conn) return;

    const handle = (message: Message) => {
      if (message.conversationId === activeChat.conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    conn.on("ReceiveMessage", handle);

    return () => {
      conn.off("ReceiveMessage", handle);
    };
  }, [activeChat.conversationId]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-2 md:px-6 md:py-4"
      style={{ maxHeight: 'calc(100dvh - 136px)', scrollbarWidth: 'thin' }}
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

      {messages.map(m => (
        <MessageBubble
          key={m.id}
          content={m.content}
          isMine={m.senderId === currentUser.id}
          time={new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        />
      ))}

      <div ref={bottomRef}></div>
    </div>
  );
}
