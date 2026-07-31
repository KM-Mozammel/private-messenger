import type { ChatListProps, ConversationListItem, User } from "../../types/models";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { connectSignalR, onSignalREvent, offSignalREvent, joinConversation } from "../../services/signalR";

interface ConversationUpdatePayload {
  conversationId: string;
  lastMessage: string;
  senderId: string;
}

export default function ChatList({ onSelectChat, currentUserId }: ChatListProps & { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Helper to fetch conversations from API (Initial load or fallback)
  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations(currentUserId);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [currentUserId]);

  // 1. Initial Load & SignalR Connection Setup
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;

    const initializeConnection = async () => {
      setLoadingChats(true);
      await connectSignalR(currentUserId);
      if (isMounted) {
        await loadConversations();
        setLoadingChats(false);
      }
    };

    initializeConnection();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, loadConversations]);

  // 2. In-Memory State Mutation on Real-Time SignalR Event
  useEffect(() => {
    const handleConversationUpdate = (payload: ConversationUpdatePayload) => {
      console.log("Real-time update payload received:", payload);

      setConversations((prevConversations) => {
        const existingIndex = prevConversations.findIndex(
          (conv) => conv.conversationId === payload.conversationId
        );

        // If the conversation exists in local state, update and reorder it
        if (existingIndex !== -1) {
          const targetConv = prevConversations[existingIndex];

          const updatedConv: ConversationListItem = {
            ...targetConv,
            lastMessage: payload.lastMessage,
            // Increment unread count only if current user is the receiver
            unreadCount:
              payload.senderId !== currentUserId
                ? (targetConv.unreadCount || 0) + 1
                : targetConv.unreadCount
          };

          // Remove old instance and move updated conversation to top of list
          const remainingConvs = prevConversations.filter(
            (conv) => conv.conversationId !== payload.conversationId
          );

          return [updatedConv, ...remainingConvs];
        }

        // Fallback: If it's a completely new chat thread not present in list, fetch full list
        loadConversations();
        return prevConversations;
      });
    };

    onSignalREvent("ConversationUpdated", handleConversationUpdate);

    return () => {
      offSignalREvent("ConversationUpdated", handleConversationUpdate);
    };
  }, [currentUserId, loadConversations]);

  // 3. Search Autocomplete
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

  // 4. Handle selecting / creating new conversation
  const handleSelectUser = async (targetUser: User) => {
    try {
      const res = await api.startConversation(currentUserId, targetUser.id);

      if (!res?.conversationId) {
        console.error("No conversationId returned", res);
        return;
      }

      joinConversation(res.conversationId);

      onSelectChat?.({
        conversationId: res.conversationId,
        user: targetUser
      });

      setSearch("");
      setResults([]);

      // Fetch fresh list to reflect newly initiated thread
      await loadConversations();
    } catch (err) {
      console.error("Failed to start/select conversation", err);
    }
  };

  // Clear unread count when opening a chat
  const handleSelectConversation = (conv: any, otherUser: any) => {
    joinConversation(conv.conversationId);

    // Reset unread counter locally for active chat
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );

    onSelectChat?.({ conversationId: conv.conversationId, user: otherUser });
  };

  const getOtherUser = (conv: any, currentUserId: string) => {
    if (conv.participants && conv.participants.length > 0) {
      return conv.participants.find((p: any) => p.id !== currentUserId) || { username: "Unknown" };
    }
    return { id: conv.userId, username: conv.username };
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Search Input & Dropdown */}
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

        {(loading || results.length > 0) && (
          <div
            style={{
              position: "absolute",
              top: "100%",
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

            {results.map((user) => (
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

      {/* Conversations List */}
      <div style={{ marginTop: "8px" }}>
        {loadingChats && <div className="text-center pt-50">Loading chats...</div>}
        {!loadingChats && conversations.length === 0 && <div className="text-center">No conversations yet</div>}

        {conversations.map((conv: any) => {
          const otherUser = getOtherUser(conv, currentUserId);

          return (
            <div
              key={conv.conversationId}
              onClick={() => handleSelectConversation(conv, otherUser)}
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

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1 }}>
                <strong>{otherUser.username}</strong>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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