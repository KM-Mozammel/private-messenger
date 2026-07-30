import { useState } from "react";
import { api } from "../../services/api"; // your API helper
import type { ActiveChat, User } from "../../types/models";

type MessageInputProps = {
  activeChat: ActiveChat;
  currentUser: User;
};

export default function MessageInput({ activeChat, currentUser }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      // Send message to backend
      const sent = await api.sendMessage({
        conversationId: activeChat.conversationId,
        senderId: currentUser.id,
        content: message.trim()
      });

      // Optionally: emit via SignalR
      // window.chatHub?.invoke("SendMessage", sent);

      setMessage(""); // clear input
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="
      p-2 md:p-3
      border-t border-[var(--border)]
      bg-[var(--bg-surface)]
      flex gap-2 items-center
      sticky bottom-0
    ">
      <button className="icon-btn">😊</button>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          background: "var(--bg-main)",
          color: "var(--text-primary)",
          outline: "none"
        }}
      />

      <button
        onClick={sendMessage}
        disabled={sending}
        style={{
          background: "var(--accent)",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "12px",
          cursor: sending ? "not-allowed" : "pointer",
          opacity: sending ? 0.6 : 1
        }}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
