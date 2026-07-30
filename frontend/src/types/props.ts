import type { ReactNode } from 'react';
import type { ActiveChat } from './conversation';
import type { User } from './user';

export type SidebarProps = {
  title: string | ReactNode;
  children?: ReactNode;
  hiddenOnMobile?: boolean;
  logOut?: ReactNode;
};

export type LogoutButtonProps = {
  onLogout: () => void;
};

export type UserGreetingProps = {
  username: string;
};

export type ChatListProps = {
  onSelectChat?: (chat: ActiveChat) => void;
};

export type ChatHeaderProps = {
  onBack: () => void;
  activeChat: ActiveChat | null;
};

export type TypingIndicatorProps = {
  activeChat: ActiveChat | null;
};

export type MessageListProps = {
  activeChat: ActiveChat;
  currentUser: User;
};
