export interface User {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export interface NavbarProps {
  user: User;
  onLogout: () => void;
  appName?: string;
  className?: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}