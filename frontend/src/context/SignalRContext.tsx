// src/context/SignalRContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";

const env = (import.meta as ImportMeta & { env?: { VITE_SIGNALR_URL?: string } }).env;
const SIGNALR_URL = (env?.VITE_SIGNALR_URL || "https://localhost:7024/hubs/chat").replace(/\/$/, "");

interface SignalRContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => Promise<void>;
    leaveConversation: (conversationId: string) => Promise<void>;
    invoke: (methodName: string, ...args: any[]) => Promise<any>;
    subscribe: (eventName: string, callback: (...args: any[]) => void) => () => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!user) {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Build the connection instance
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${SIGNALR_URL}?userId=${user.id}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current = connection;

        // Monitor reconnect states
        connection.onreconnecting(() => setIsConnected(false));
        connection.onreconnected(() => setIsConnected(true));
        connection.onclose(() => setIsConnected(false));

        // Connect to hub
        connection
            .start()
            .then(() => {
                console.log("SignalR Connected Successfully");
                setIsConnected(true);
            })
            .catch((err) => {
                console.error("SignalR Connection Error: ", err);
                setIsConnected(false);
            });

        return () => {
            connection.stop();
            connectionRef.current = null;
            setIsConnected(false);
        };
    }, [user]);

    /* Method Invocation Helpers */
    const joinConversation = useCallback(async (conversationId: string) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke("JoinConversation", conversationId);
            } catch (err) {
                console.error(`Failed to join conversation ${conversationId}:`, err);
            }
        }
    }, []);

    const leaveConversation = useCallback(async (conversationId: string) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            try {
                await connectionRef.current.invoke("LeaveConversation", conversationId);
            } catch (err) {
                console.error(`Failed to leave conversation ${conversationId}:`, err);
            }
        }
    }, []);

    const invoke = useCallback(async (methodName: string, ...args: any[]) => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            return await connectionRef.current.invoke(methodName, ...args);
        }
        throw new Error("SignalR connection is not established.");
    }, []);

    /* Event Subscription Helper with automatic cleanup */
    const subscribe = useCallback((eventName: string, callback: (...args: any[]) => void) => {
        const conn = connectionRef.current;
        if (conn) {
            conn.on(eventName, callback);
        }

        return () => {
            if (conn) {
                conn.off(eventName, callback);
            }
        };
    }, []);

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

export const useSignalR = (): SignalRContextType => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalR must be used within a SignalRProvider");
    }
    return context;
};