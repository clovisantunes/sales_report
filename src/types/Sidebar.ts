export interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  darkMode: boolean;
  className?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
}