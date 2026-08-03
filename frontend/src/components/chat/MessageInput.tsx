import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../../services/api";
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

  const { joinConversation, invoke } = useSignalR();

  // Refs to manage typing debounce timeouts
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Function to clear typing status explicitly
  const sendTypingSignal = useCallback(
    (isTyping: boolean) => {
      if (!activeChat?.conversationId) return;
      isTypingRef.current = isTyping;
      invoke?.("SendTypingIndicator", activeChat.conversationId, currentUser.username, isTyping);
    },
    [activeChat?.conversationId, currentUser.username, invoke]
  );

  // Clean up typing state if conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) {
        sendTypingSignal(false);
      }
    };
  }, [activeChat?.conversationId, sendTypingSignal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!activeChat.conversationId) return;

    // 1. Send "isTyping: true" immediately if not already marked as typing
    if (!isTypingRef.current && value.trim().length > 0) {
      sendTypingSignal(true);
    }

    // 2. Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3. Set a timeout to send "isTyping: false" after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTypingSignal(false);
      }
    }, 2000);
  };

  const sendMessage = async () => {
    if (!message.trim() || sending || isCreatingConversation.current) return;

    // Immediately stop typing indicator when user hits send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      sendTypingSignal(false);
    }

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
        onChange={handleInputChange}
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