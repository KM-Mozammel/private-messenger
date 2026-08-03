import React, { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import { SignalRContext } from "./SignalRContext";

const SIGNALR_URL = "https://www.mk-private-messenger.somee.com/hubs/chat";
// const SIGNALR_URL = "http://localhost:5041/hubs/chat";

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const [connectionVersion, setConnectionVersion] = useState(0);

  useEffect(() => {
    if (!user) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
        setConnectionVersion((v) => v + 1);
      }
      return;
    }

    // 🔴 FIX: Append username parameter to URL
    const usernameParam = user.username ? encodeURIComponent(user.username) : "User";
    const connectionUrl = `${SIGNALR_URL}?userId=${user.id}&username=${usernameParam}`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(connectionUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        setConnectionVersion((v) => v + 1);
      })
      .catch(() => setIsConnected(false));

    return () => {
      connection.stop();
      connectionRef.current = null;
      setIsConnected(false);
      setConnectionVersion((v) => v + 1);
    };
  }, [user]);

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("JoinConversation", conversationId);
      }
    },
    [connectionVersion]
  );

  const leaveConversation = useCallback(
    async (conversationId: string) => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("LeaveConversation", conversationId);
      }
    },
    [connectionVersion]
  );

  const invoke = useCallback(
    async (methodName: string, ...args: any[]) => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        return await connectionRef.current.invoke(methodName, ...args);
      }
      throw new Error("SignalR connection is not established.");
    },
    [connectionVersion]
  );

  const subscribe = useCallback(
    (eventName: string, callback: (...args: any[]) => void) => {
      const conn = connectionRef.current;
      if (conn) {
        conn.on(eventName, callback);
      }
      return () => {
        connectionRef.current?.off(eventName, callback);
      };
    },
    [connectionVersion]
  );

  return (
    <SignalRContext.Provider
      value={{
        connection: connectionRef.current,
        isConnected,
        joinConversation,
        leaveConversation,
        invoke,
        subscribe,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};