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
import OnlineUsers from "./components/user/OnlineUsers";
import MobileNav from "./components/user/MobileNav";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [toggleMobileHome, setToggleMobileHome] = useState("inbox");

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user, login, logout } = useAuth();
  const { isConnected, joinConversation, leaveConversation, subscribe } = useSignalR();

  /* ------------------ STEP 2: GLOBAL NOTIFICATION LISTENER ------------------ */
  useEffect(() => {
    if (!isConnected || !user) return;

    // Listen for targeted notification events sent from backend
    const unsubscribe = subscribe("ReceiveNotification", (notificationPayload: any) => {
      const { senderId, receiverId, senderUsername, content } = notificationPayload;

      // Ensure only sender or receiver handle this
      // if (user.id === senderId) {
      //   alert(`Message sent to ${notificationPayload.receiverUsername || "user"}: "${content}"`);
      // } else if (user.id === receiverId) {
      //   alert(`New message from ${senderUsername || "a user"}: "${content}"`);
      // }
    });

    return () => {
      unsubscribe?.();
    };
  }, [isConnected, user, subscribe]);

  /* Join/Leave SignalR Conversation Group */
  useEffect(() => {
    if (!activeChat || !activeChat.conversationId || !isConnected) return;

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
          {!isDesktop && (
            <MobileNav toggleMobileHome={toggleMobileHome} setToggleMobileHome={setToggleMobileHome} />
          )}

          {!isDesktop && toggleMobileHome === "online" && (
            <OnlineUsers
              onSelectChat={(chat) => {
                setActiveChat(chat);
                setShowChat(true);
              }}
              currentUserId={user.id}
            />
          )}

          {toggleMobileHome === "inbox" && (
            <ChatList
              currentUserId={user.id}
              onSelectChat={(chat) => {
                setActiveChat(chat);
                setShowChat(true);
              }}
            />
          )}
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
              <MessageInput activeChat={activeChat} currentUser={user} onConversationCreated={(newConvId) => {
                setActiveChat((prev) => prev ? { ...prev, conversationId: newConvId } : null);
              }} />
            </>
          ) : (
            <div style={{ padding: 20, color: "var(--text-secondary)", textAlign: "center" }}>
              Select a chat to start messaging
            </div>
          )}
        </ChatSurface>
      )}

      {/* Online Users Desktop Section */}
      {isDesktop && (
        <OnlineUsers
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setShowChat(true);
          }}
          currentUserId={user.id} />)}
    </ChatLayout>
  );
}

export default App;