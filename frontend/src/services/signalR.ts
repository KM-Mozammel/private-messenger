import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const connectSignalR = (userId: string) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`http://192.168.0.193:5000/hubs/chat?userId=${userId}`)
    .withAutomaticReconnect()
    .build();

  return connection.start();
};

export const getConnection = () => connection;

export const joinConversation = (conversationId: string) => {
  connection?.invoke("JoinConversation", conversationId);
};

export const leaveConversation = (conversationId: string) => {
  connection?.invoke("LeaveConversation", conversationId);
};
