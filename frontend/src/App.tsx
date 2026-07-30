import { useEffect, useState } from "react";
import ChatSurface from "./components/layouts/ChatSurface";
import Sidebar from "./components/layouts/Sidebar";
import ChatLayout from "./components/layouts/ChatLayout";
import MessageList from "./components/chat/MessageList";
import MessageInput from "./components/chat/MessageInput";
import ChatList from "./components/chat/ChatList";
import TypingIndicator from "./components/chat/TypingIndicator";
import ChatHeader from "./components/chat/ChatHeader";
import LogoutButton from "./components/auth/LogoutButton";
import Login from "./components/auth/Login";
import { connectSignalR, joinConversation, leaveConversation } from "./services/signalR";
import UserGreeting from "./components/user/UserGreeting";
import { ActiveChat, User } from "./types/models";
import { useCall } from "./context/CallContext";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);

  /* -------------------- RESPONSIVE -------------------- */
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* -------------------- AUTH CHECK -------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("username");

    if (!storedUser) {
      setAuthChecked(true);
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("username");
    } finally {
      setAuthChecked(true);
    }
  }, []);

  /* -------------------- SIGNALR -------------------- */
  useEffect(() => {
    if (!user) return;

    connectSignalR(user.id)
      .then(() => console.log("SignalR connected"))
      .catch(err => console.error("SignalR error", err));
  }, [user]);

  useEffect(() => {
    if (!activeChat) return;
    joinConversation(activeChat.conversationId);

    return () => {
      leaveConversation(activeChat.conversationId);
    }
  }, [activeChat]);

  /* -------------------- LOADING -------------------- */
  if (!authChecked) {
    return null;
  }

  /* -------------------- LOGIN -------------------- */
  if (!user) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          localStorage.setItem("username", JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }}
      />
    );
  }

  /* -------------------- LOGOUT -------------------- */
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUser(null);
    setShowChat(false);
    setActiveChat(null);
  };

  const { callState, startCall, receiveCall, endCall } = useCall();

  return (
    <ChatLayout>
      {/* <div className="flex flex-col gap-2">
        <p>Call state: {callState}</p>
        <button onClick={() => startCall("user123", "audio")}>Start Audio</button>
        <button onClick={() => receiveCall("user123", "video")}>Receive Video</button>
        <button onClick={endCall}>End Call</button>
      </div> */}

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
              {/* <TypingIndicator activeChat={activeChat} /> */}
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
          {/* online users */}
        </Sidebar>
      )}

    </ChatLayout>
  );
}

export default App;
