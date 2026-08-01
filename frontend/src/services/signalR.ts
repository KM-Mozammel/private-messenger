import * as signalR from "@microsoft/signalr";

const env = (import.meta as ImportMeta & { env?: { VITE_SIGNALR_URL?: string } }).env;
const SIGNALR_URL = (env?.VITE_SIGNALR_URL || "https://localhost:7024/hubs/chat").replace(/\/$/, "");

let connection: signalR.HubConnection | null = null;

export const connectSignalR = async (userId: string) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_URL}?userId=${userId}`)
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log("SignalR Connected Successfully");
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
  }

  return connection;
};

export const getConnection = () => connection;

export const joinConversation = (conversationId: string) => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    connection.invoke("JoinConversation", conversationId).catch(console.error);
  }
};

export const leaveConversation = (conversationId: string) => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    connection.invoke("LeaveConversation", conversationId).catch(console.error);
  }
};

export const onSignalREvent = (eventName: string, callback: (...args: any[]) => void) => {
  if (connection) {
    connection.on(eventName, callback);
  }
};

export const offSignalREvent = (eventName: string, callback: (...args: any[]) => void) => {
  if (connection) {
    connection.off(eventName, callback);
  }
};