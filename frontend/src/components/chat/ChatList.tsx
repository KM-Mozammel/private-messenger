import type { ChatListProps, ConversationListItem, User } from "../../types/models";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

const chats = [
  { id: 1, name: "Chat GPT", last: "Hey, what's up?", unread: 0, online: true },
];

export default function ChatList({ onSelectChat, currentUserId }: ChatListProps & { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await api.searchUsers(search, currentUserId);
        setResults(users);
      } catch (err) {
        if (err instanceof Error) console.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, currentUserId]);

  const handleSelectUser = async (targetUser: User) => {
    try {
      const res = await api.startConversation(currentUserId, targetUser.id);

      if (!res?.conversationId) {
        console.error("No conversationId returned", res);
        return;
      }

      onSelectChat?.({
        conversationId: res.conversationId,
        user: targetUser
      });

      setSearch("");
      setResults([]);
    } catch (err) {
      console.error("Failed to start/select conversation", err);
    }
  };

  useEffect(() => {
    setLoadingChats(true);

    api.getConversations(currentUserId)
      .then((data) => setConversations(data))
      .catch(console.error)
      .finally(() => setLoadingChats(false));
  }, [currentUserId]);

  const getOtherUser = (conv: any, currentUserId: string) => {
    if (conv.participants && conv.participants.length > 0) {
      return conv.participants.find((p: any) => p.id !== currentUserId) || { username: "Unknown" };
    }
    // fallback to single user in conversation
    return { id: conv.userId, username: conv.username };
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* 🔹 Search input + dropdown wrapper */}
      <div style={{ position: "relative", zIndex: 20 }}>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-main)"
          }}
        />

        {/* 🔹 Dropdown / mini modal */}
        {(loading || results.length > 0) && (
          <div
            style={{
              position: "absolute",
              top: "100%", // directly below input
              left: 0,
              right: 0,
              maxHeight: "200px",
              overflowY: "auto",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              padding: "4px 0"
            }}
          >
            {loading && <div style={{ padding: "8px", fontSize: "12px" }}>Searching...</div>}

            {results.map(user => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg-surface)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
              >
                {user.username}
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div style={{ padding: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔹 Recent chats list */}
      <div style={{ marginTop: "8px" }}>
        {loadingChats && <div className="text-center pt-50">Loading chats...</div>}
        {!loadingChats && conversations.length === 0 && <div className="text-center">No conversations yet</div>}

        {conversations.map((conv: any) => {
          const otherUser = getOtherUser(conv, currentUserId);

          return (
            <div
              key={conv.conversationId}
              onClick={() => onSelectChat?.({ conversationId: conv.conversationId, user: otherUser })}
              style={{
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "6px",
                background: "var(--bg-surface)",
                cursor: "pointer"
              }}
              className="flex flex-row gap-4 justify-content align-center"
            >
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {otherUser.username ? otherUser.username.charAt(0).toUpperCase() : "?"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <strong>{otherUser.username}</strong>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {conv.lastMessage ?? "No messages yet"}
                </div>
              </div>


              {conv.unreadCount > 0 && (
                <span
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "999px"
                  }}
                >
                  {conv.unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
