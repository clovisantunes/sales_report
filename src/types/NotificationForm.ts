export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  senderName?: string;
}

export interface NotificationFormData {
  title: string;
  message: string;
  image: File | null;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers?: 'all' | 'specific';
  specificUsers?: string[];
}

export interface SendNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: NotificationFormData) => void;
  isLoading?: boolean;
}

export interface NotificationsViewProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  isLoading?: boolean;
}
export interface NotificationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onMarkAsRead?: (notification: Notification) => void;
}