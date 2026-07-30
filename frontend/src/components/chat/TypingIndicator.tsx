import type { TypingIndicatorProps } from "../../types/models";

export default function TypingIndicator({ activeChat }: TypingIndicatorProps) {
  if (!activeChat) return null;

  return (
    <div
      style={{
        color: "var(--text-secondary)",
        fontStyle: "italic",
        maxWidth: "34%",
        background: "var(--message-received)",
        padding: "10px 14px",
        borderRadius: "16px 16px 16px 4px",
        fontSize: "14px",
        lineHeight: 1.5,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        marginBottom: "5px",
        marginLeft: "15px"
      }}
    >
      {activeChat.user.username || "Someone"} is typing<span className="dots">...</span>
    </div>
  );
}
