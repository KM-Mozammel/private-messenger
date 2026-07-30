type MessageBubbleProps = {
  content: string;
  isMine: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
};

export default function MessageBubble({
  content,
  isMine,
  time,
  status
}: MessageBubbleProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: "12px",
        animation: "fadeUP 0.2s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "65%",
          background: isMine
            ? "var(--message-sent)"
            : "var(--message-received)",
          color: isMine ? "white" : "var(--text-primary)",
          padding: "10px 14px",
          borderRadius: isMine
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          fontSize: "14px",
          lineHeight: 1.5,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
        }}
      >
        <div>{content}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            marginTop: "6px",
            opacity: 0.7
          }}
        >
          <span>{time}</span>

          {isMine && (
            <span
              style={{
                color: status === "read" ? "#60a5fa" : "inherit"
              }}
            >
              {status === "sent" && "✓"}
              {status === "delivered" && "✓✓"}
              {status === "read" && "✓✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
