import type { ChatListProps, ConversationListItem, User } from "../../types/models";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { useSignalR } from "../../context/SignalRContext";
import { useTypingIndicator } from "../../hooks/useTypingIndicator"; // <-- Import hook

interface ConversationUpdatePayload {
  conversationId: string;
  lastMessage: string;
  senderId: string;
}

export default function ChatList({ onSelectChat, currentUserId }: ChatListProps & { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // State to track set of online user IDs
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Reuse the typing indicator hook for all conversations!
  const typingConversations = useTypingIndicator();

  const { subscribe, joinConversation, isConnected } = useSignalR();

  /* -------------------- INITIAL ONLINE USERS FETCH -------------------- */
  useEffect(() => {
    let isMounted = true;
    const fetchOnlineUsers = async () => {
      try {
        const data: User[] = await api.fetchOnlineUsers();
        if (isMounted && Array.isArray(data)) {
          const ids = new Set(data.map((u) => u.id?.toLowerCase()).filter(Boolean));
          setOnlineUserIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch online users:", err);
      }
    };

    fetchOnlineUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  /* -------------------- REAL-TIME SIGNALR PRESENCE LISTENERS -------------------- */
  useEffect(() => {
    if (!isConnected) return;

    const handleUserOnline = (onlineUserId: string) => {
      if (!onlineUserId) return;
      setOnlineUserIds((prev) => new Set(prev).add(onlineUserId.toLowerCase()));
    };

    const handleUserOffline = (offlineUserId: string) => {
      if (!offlineUserId) return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(offlineUserId.toLowerCase());
        return next;
      });
    };

    const unsubs = [
      subscribe("UserOnline", handleUserOnline),
      subscribe("useronline", handleUserOnline),
      subscribe("UserOffline", handleUserOffline),
      subscribe("useroffline", handleUserOffline),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [subscribe, isConnected]);

  /* -------------------- FETCH CONVERSATIONS -------------------- */
  const loadConversations = useCallback(async () => {
    try {
      setLoadingChats(true);
      const data = await api.getConversations(currentUserId);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  /* -------------------- REAL-TIME CONVERSATION UPDATES -------------------- */
  useEffect(() => {
    const handleConversationUpdate = (payload: ConversationUpdatePayload) => {
      if (!payload?.conversationId) return;

      const normalizedPayloadId = payload.conversationId.toLowerCase();
      const normalizedSenderId = payload.senderId?.toLowerCase();
      const normalizedCurrentUserId = currentUserId?.toLowerCase();

      setConversations((prevConversations) => {
        const existingIndex = prevConversations.findIndex(
          (conv) => conv.conversationId.toLowerCase() === normalizedPayloadId
        );

        if (existingIndex !== -1) {
          const targetConv = prevConversations[existingIndex];
          const isIncomingMessage = normalizedSenderId !== normalizedCurrentUserId;

          const updatedConv: ConversationListItem = {
            ...targetConv,
            lastMessage: payload.lastMessage,
            unreadCount: isIncomingMessage
              ? (targetConv.unreadCount || 0) + 1
              : targetConv.unreadCount,
          };

          const remainingConvs = prevConversations.filter(
            (conv) => conv.conversationId.toLowerCase() !== normalizedPayloadId
          );

          return [updatedConv, ...remainingConvs];
        }

        setTimeout(() => {
          loadConversations();
        }, 0);

        return prevConversations;
      });
    };

    const unsubscribe = subscribe("ConversationUpdated", handleConversationUpdate);
    return () => unsubscribe();
  }, [currentUserId, loadConversations, subscribe]);

  /* -------------------- USER SEARCH AUTOCOMPLETE -------------------- */
  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const users = await api.searchUsers(search, currentUserId);
        setResults(users);
      } catch (err) {
        if (err instanceof Error) console.error(err.message);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, currentUserId]);

  /* -------------------- HANDLERS -------------------- */
  const handleSelectUser = (targetUser: User) => {
    onSelectChat?.({
      conversationId: "",
      user: targetUser,
    });

    setSearch("");
    setResults([]);
  };

  const handleSelectConversation = (conv: any, otherUser: any) => {
    joinConversation(conv.conversationId);

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId.toLowerCase() === conv.conversationId.toLowerCase()
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    onSelectChat?.({ conversationId: conv.conversationId, user: otherUser });
  };

  const getOtherUser = (conv: any, currentUserId: string) => {
    const normCurrentId = currentUserId?.toLowerCase();
    if (conv.participants && conv.participants.length > 0) {
      return (
        conv.participants.find((p: any) => p.id?.toLowerCase() !== normCurrentId) || {
          username: "Unknown",
        }
      );
    }
    return { id: conv.userId, username: conv.username };
  };

  const isUserOnline = (userId?: string) => {
    if (!userId) return false;
    return onlineUserIds.has(userId.toLowerCase());
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
            background: "var(--bg-main)",
          }}
        />

        {(loadingSearch || results.length > 0) && (
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
              padding: "4px 0",
            }}
          >
            {loadingSearch && <div style={{ padding: "8px", fontSize: "12px" }}>Searching...</div>}

            {results.map((user) => {
              const online = isUserOnline(user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center justify-between"
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative inline-block">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                      </div>
                      {online && (
                        <span
                          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"
                          title="Online"
                        />
                      )}
                    </div>
                    <span>{user.username}</span>
                  </div>

                  {online && (
                    <span className="text-xs text-blue-500 font-medium">Active</span>
                  )}
                </div>
              );
            })}

            {results.length === 0 && !loadingSearch && (
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
        {!loadingChats && conversations.length === 0 && (
          <div className="text-center">No conversations yet</div>
        )}

        {conversations.map((conv: any) => {
          const otherUser = getOtherUser(conv, currentUserId);
          const online = isUserOnline(otherUser.id);
          const isTyping = typingConversations[conv.conversationId?.toLowerCase()] || false;

          return (
            <div
              key={conv.conversationId}
              onClick={() => handleSelectConversation(conv, otherUser)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "6px",
                background: "var(--bg-surface)",
                cursor: "pointer",
              }}
              className="flex flex-row gap-4 justify-between items-center"
            >
              <div className="relative inline-block shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {otherUser.username ? otherUser.username.charAt(0).toUpperCase() : "?"}
                </div>
                {online && (
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white"
                    title="Online"
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <strong className="truncate">{otherUser.username}</strong>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: isTyping ? "var(--accent)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className={isTyping ? "italic animate-pulse" : ""}
                >
                  {isTyping ? "typing..." : (conv.lastMessage ?? "No messages yet")}
                </div>
              </div>

              {conv.unreadCount > 0 && (
                <span
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "999px",
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