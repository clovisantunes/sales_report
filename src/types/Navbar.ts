import type { User } from "./User";

export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface NavbarProps {
  user: User;
  avatarSize?: number | string;
  onLogout: () => void;
  appName?: string;
  className?: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  onNotificationsClick?: () => void; 
}