// src/App.tsx
import { useState, useEffect } from "react";
import ChatSurface from "./components/layouts/ChatSurface";
import Sidebar from "./components/layouts/Sidebar";
import ChatLayout from "./components/layouts/ChatLayout";
import MessageList from "./components/chat/MessageList";
import MessageInput from "./components/chat/MessageInput";
import ChatList from "./components/chat/ChatList";
import ChatHeader from "./components/chat/ChatHeader";
import LogoutButton from "./components/auth/LogoutButton";
import Login from "./components/auth/Login";
import UserGreeting from "./components/user/UserGreeting";

import { ActiveChat } from "./types/models";
import { useAuth } from "./context/AuthContext";
import { useSignalR } from "./context/SignalRContext";
import { useMediaQuery } from "./hooks/useMediaQuery";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user, login, logout } = useAuth();
  const { isConnected, joinConversation, leaveConversation } = useSignalR();

  /* Join/Leave SignalR Conversation Group */
  useEffect(() => {
    if (!activeChat || !isConnected) return;

    joinConversation(activeChat.conversationId);

    return () => {
      leaveConversation(activeChat.conversationId);
    };
  }, [activeChat, isConnected, joinConversation, leaveConversation]);

  /* LOGIN CHECK */
  if (!user) {
    return <Login onLogin={login} />;
  }

  /* LOGOUT HANDLER */
  const handleLogout = () => {
    logout();
    setShowChat(false);
    setActiveChat(null);
  };

  return (
    <ChatLayout>
      {/* LEFT SIDEBAR */}
      {(isDesktop || !showChat) && (
        <Sidebar
          title={<UserGreeting username={user.username} />}
          logOut={<LogoutButton onLogout={handleLogout} />}
        >
          <ChatList
            currentUserId={user.id}
            onSelectChat={(chat) => {
              setActiveChat(chat);
              setShowChat(true);
            }}
          />
        </Sidebar>
      )}

      {/* CHAT AREA */}
      {(isDesktop || showChat) && (
        <ChatSurface>
          <ChatHeader
            onBack={() => setShowChat(false)}
            activeChat={activeChat}
          />

          {activeChat ? (
            <>
              <MessageList activeChat={activeChat} currentUser={user} />
              <MessageInput activeChat={activeChat} currentUser={user} />
            </>
          ) : (
            <div style={{ padding: 20, color: "var(--text-secondary)", textAlign: "center" }}>
              Select a chat to start messaging
            </div>
          )}
        </ChatSurface>
      )}

      {/* RIGHT SIDEBAR */}
      {isDesktop && (
        <Sidebar title="Online Users">
          {/* Online users list */}
        </Sidebar>
      )}
    </ChatLayout>
  );
}

export default App;