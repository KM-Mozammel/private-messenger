const BASE_URL = "https://www.mk-private-messenger.somee.com/api";

export const api = {
  login: async (username: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  getConversations: async (userId: string) => {
    const res = await fetch(`${BASE_URL}/conversations?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  getMessages: async (conversationId: string) => {
    const res = await fetch(`${BASE_URL}/messages/${conversationId}`);
    return res.json();
  },

  sendMessage: async ({ conversationId, senderId, receiverId, content }: { conversationId: string; senderId: string; receiverId: string; content: string }) => {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ConversationId: conversationId, SenderId: senderId, ReceiverId: receiverId, Content: content })
    });

    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  searchUsers: async (query: string, currentUserId: string) => {
    const res = await fetch(`${BASE_URL}/users/search?query=${encodeURIComponent(query)}&currentUserId=${currentUserId}`);
    if (!res.ok) throw new Error("Failed to search users");
    return res.json();
  },

  startConversation: async (currentUserId: string, targetUserId: string) => {
    const res = await fetch(`${BASE_URL}/conversations/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentUserId,
        targetUserId,
      }),
    });

    if (!res.ok) throw new Error("Failed to start conversation");
    return res.json();
  },

  fetchOnlineUsers: async () => {
    const res = await fetch(`${BASE_URL}/users/online`);
    if (!res.ok) throw new Error("Failed to fetch online users");
    return res.json();
  },
}
