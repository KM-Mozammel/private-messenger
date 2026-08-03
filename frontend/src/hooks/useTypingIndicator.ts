import { useState, useEffect } from "react";
import { useSignalR } from "../context/SignalRContext";

// Overloaded hook support
export function useTypingIndicator(): Record<string, boolean>;
export function useTypingIndicator(conversationId?: string): boolean;

export function useTypingIndicator(conversationId?: string) {
    const { isConnected, subscribe } = useSignalR();
    const [isTyping, setIsTyping] = useState(false);
    const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe("ReceiveTypingIndicator", (data: any) => {
            if (!data?.conversationId) return;
            const normConvId = data.conversationId.toLowerCase();

            if (conversationId) {
                // Single conversation mode (e.g., ChatHeader, MessageList)
                if (normConvId === conversationId.toLowerCase()) {
                    setIsTyping(data.isTyping);
                }
            } else {
                // Multi-conversation mode (e.g., ChatList)
                setTypingMap((prev) => ({
                    ...prev,
                    [normConvId]: data.isTyping,
                }));
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, [isConnected, conversationId, subscribe]);

    return conversationId ? isTyping : typingMap;
}