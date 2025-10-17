export interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  darkMode: boolean;
  className?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: {
    isAdmin: boolean;
  };
  onSendNotification?: () => void;
}