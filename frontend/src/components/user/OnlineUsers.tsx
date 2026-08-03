import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useSignalR } from "../../context/SignalRContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface User {
  id: string;
  username: string;
  createdAt?: string;
}

interface SelectedChatPayload {
  conversationId: string;
  user: User;
}

interface OnlineUsersProps {
  currentUserId: string;
  onSelectChat?: (chat: SelectedChatPayload) => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ currentUserId, onSelectChat }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [search, setSearch] = useState("");
  const { subscribe, isConnected } = useSignalR();

  // 1. Initial REST API load
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: User[] = await api.fetchOnlineUsers();
        if (isMounted) {
          const sanitizedUsers = data
            .filter((user) => user && user.id !== currentUserId)
            .map((user) => ({
              ...user,
              username: typeof user.username === "string" ? user.username : "User",
            }));
          setUsers(sanitizedUsers);
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load online users");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // 2. Real-time Listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleUserOnline = (onlineUserId: string, onlineUsername?: any) => {
      if (!onlineUserId || onlineUserId === currentUserId) return;

      const validUsername =
        typeof onlineUsername === "string" && onlineUsername.trim() !== ""
          ? onlineUsername
          : "User";

      setUsers((prev) => {
        const existingIndex = prev.findIndex((u) => u.id === onlineUserId);

        // If user exists, update their username if it was previously fallback "User"
        if (existingIndex !== -1) {
          if (prev[existingIndex].username === "User" && validUsername !== "User") {
            const updatedUsers = [...prev];
            updatedUsers[existingIndex] = {
              ...updatedUsers[existingIndex],
              username: validUsername,
            };
            return updatedUsers;
          }
          return prev;
        }

        // Add new online user
        const newUser: User = {
          id: onlineUserId,
          username: validUsername,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newUser];
      });
    };

    const handleUserOffline = (offlineUserId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== offlineUserId));
    };

    // Subscribing to both casing styles for backend event compatibility
    const unsubs = [
      subscribe("UserOnline", handleUserOnline),
      subscribe("useronline", handleUserOnline),
      subscribe("UserOffline", handleUserOffline),
      subscribe("useroffline", handleUserOffline),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [currentUserId, subscribe, isConnected]);

  // Client-side search filter
  const filteredUsers = users.filter((user) => {
    const name = typeof user.username === "string" ? user.username : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectUser = (targetUser: User) => {
    // alert(JSON.stringify(targetUser));
    onSelectChat?.({
      conversationId: "",
      user: targetUser,
    });

    setSearch("");
  };

  if (loading) return <p className="text-gray-500 text-sm p-3">Loading online users...</p>;
  if (error) return <p className="text-red-500 text-sm p-3">Error: {error}</p>;

  return (
    <div className="shadow-md rounded-lg p-3 bg-white">
      {isDesktop && <h2 className="text-lg font-semibold text-gray-800 mb-3">Online Users</h2>}

      <input
        type="text"
        placeholder="Search online users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-md mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredUsers.length > 0 ? (
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
          {filteredUsers.map((user) => {
            const displayName = typeof user.username === "string" ? user.username : "User";
            return (
              <li
                key={user.id}
                role="button"
                tabIndex={0}
                className="flex items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition cursor-pointer"
                onClick={(e) => {
                  handleSelectUser(user);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectUser(user);
                  }
                }}
              >
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-gray-800 font-medium truncate">{displayName}</span>
                <span className="flex items-center text-xs text-green-600 font-semibold shrink-0 ml-2">
                  <span className="mr-1">●</span> Online
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No matching users online</p>
      )}
    </div>
  );
};

export default OnlineUsers;