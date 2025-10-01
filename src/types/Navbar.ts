export interface NavbarProps {
  user: {
    name: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    initials?: string; 
  };
  onLogout: () => void;
  appName?: string;
  className?: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}