import { useState, useRef } from "react";
import { api } from "../../services/api"; // your API helper
import type { ActiveChat, User } from "../../types/models";
import { useSignalR } from "../../context/SignalRContext";

type MessageInputProps = {
  activeChat: ActiveChat;
  currentUser: User;
  onConversationCreated?: (newConversationId: string) => void;
};

export default function MessageInput({
  activeChat,
  currentUser,
  onConversationCreated,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const isCreatingConversation = useRef(false);
  const { joinConversation } = useSignalR();

  const sendMessage = async () => {
    if (!message.trim() || sending || isCreatingConversation.current) return;

    setSending(true);

    try {
      let currentConversationId = activeChat.conversationId;

      if (!currentConversationId) {
        isCreatingConversation.current = true;
        const res = await api.startConversation(currentUser.id, activeChat.user.id);

        if (!res?.conversationId) {
          throw new Error("Failed to create new conversation");
        }

        currentConversationId = res.conversationId;

        await joinConversation(currentConversationId);

        onConversationCreated?.(currentConversationId);
      }

      await api.sendMessage({
        conversationId: currentConversationId,
        senderId: currentUser.id,
        receiverId: activeChat.user.id,
        content: message.trim(),
      });

      setMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
      isCreatingConversation.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="
        p-2 md:p-3
        border-t border-[var(--border)]
        bg-[var(--bg-surface)]
        flex gap-2 items-center
        sticky bottom-0
      "
    >
      <button className="icon-btn" type="button">😊</button>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        disabled={sending}
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          background: "var(--bg-main)",
          color: "var(--text-primary)",
          outline: "none",
        }}
      />

      <button
        onClick={sendMessage}
        disabled={sending || !message.trim()}
        style={{
          background: "var(--accent)",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "12px",
          cursor: sending || !message.trim() ? "not-allowed" : "pointer",
          opacity: sending || !message.trim() ? 0.6 : 1,
        }}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}