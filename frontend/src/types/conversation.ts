import type { User } from './user';

export type Conversation = {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageAt?: string;
};

export type ConversationListItem = {
  conversationId: string;
  user: User; // the other user
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export type ActiveChat = {
  conversationId: string;
  user: User;
};
