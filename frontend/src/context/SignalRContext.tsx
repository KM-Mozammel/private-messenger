import { createContext, useContext } from "react";
import * as signalR from "@microsoft/signalr";

export interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  invoke: <T = any>(methodName: string, ...args: any[]) => Promise<T>;
  subscribe: (
    eventName: string,
    callback: (...args: any[]) => void | Promise<void>
  ) => () => void;
}

export const SignalRContext = createContext<SignalRContextType | undefined>(
  undefined
);

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};