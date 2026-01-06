import React, { useState, useRef, useEffect } from 'react';
import type { NavbarProps as BaseNavbarProps, Notification } from '../../types/Navbar';
import { 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  User, 
  Settings, 
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  Search,
  Menu,
  X
} from 'lucide-react';
import styles from './styles.module.scss';
import logoImage from '../../assets/logo.png';

type NavbarProps = BaseNavbarProps & { 
  notifications?: Notification[]; 
  onMarkAllAsRead?: () => void; 
  onNotificationClick?: (notification: Notification) => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  showSearch?: boolean;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  appName = "DashVendas",
  className = "",
  darkMode,
  onDarkModeToggle,
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  showSearch = true,
  showMobileMenu = false,
  onMobileMenuToggle
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  

  const generateInitials = (name?: string, lastName?: string): string => {
    const safeName = name ?? '';
    const safeLastName = lastName ?? '';
    const firstInitial = safeName.charAt(0).toUpperCase() || '';
    const lastInitial = safeLastName.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`.trim();
  };

  const getFullName = (name?: string, lastName?: string): string => {
    const parts: string[] = [];
    if (name) parts.push(name);
    if (lastName) parts.push(lastName);
    return parts.join(' ') || '';
  };

  const userInitials = user.initials || generateInitials(user.name, user.lastName);
  const userFullName = getFullName(user.name, user.lastName);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };



  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleDarkModeToggle = () => {
    onDarkModeToggle?.();
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    setIsNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleViewAllNotifications = () => {
    onNotificationsClick?.();
    setIsNotificationsOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className={styles.successIcon} />;
      case 'warning': return <AlertTriangle size={16} className={styles.warningIcon} />;
      case 'error': return <AlertCircle size={16} className={styles.errorIcon} />;
      default: return <Info size={16} className={styles.infoIcon} />;
    }
  };

  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case 'success': return styles.success;
      case 'warning': return styles.warning;
      case 'error': return styles.error;
      default: return styles.info;
    }
  };

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.navbarLeft}>
        <button 
          className={`${styles.mobileMenuButton} ${darkMode ? styles.dark : ''}`}
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className={`${styles.logo} ${darkMode ? styles.dark : ''}`}>
          <div className={styles.logoIcon}>   
            <img src={logoImage} alt="Logo" className={styles.logoImage} />
          </div>
        </div>
      </div>

     

      <div className={styles.navbarRight}>
        <div className={styles.notificationsContainer} ref={notificationsRef}>
          <button 
            className={`${styles.notificationsButton} ${unreadCount > 0 ? styles.hasNotifications : ''} ${darkMode ? styles.dark : ''}`}
            onClick={toggleNotifications}
            type="button"
            aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}`}
          >
            <Bell size={20} className={styles.notificationsIcon} />
            {unreadCount > 0 && (
              <span className={styles.notificationsBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={`${styles.notificationsDropdown} ${darkMode ? styles.dark : ''}`}>
              <div className={styles.notificationsHeader}>
                <h3>Notificações</h3>
                <div className={styles.notificationsActions}>
                  {unreadCount > 0 && (
                    <button 
                      className={styles.markAllRead}
                      onClick={handleMarkAllAsRead}
                      type="button"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                  <button 
                    className={styles.closeNotifications}
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-label="Fechar notificações"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.notificationsList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    <Bell size={48} className={styles.emptyIcon} />
                    <p>Nenhuma notificação</p>
                    <small>Novas notificações aparecerão aqui</small>
                  </div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${getNotificationTypeClass(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <div className={styles.notificationTitle}>
                            {notification.title}
                          </div>
                          <div className={styles.notificationTime}>
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                        <div className={styles.notificationMessage}>
                          {notification.message}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className={styles.unreadIndicator}></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && ( 
                <div className={styles.notificationsFooter}>
                  <button 
                    className={`${styles.viewAllButton} ${darkMode ? styles.dark : ''}`}
                    onClick={handleViewAllNotifications} 
                    type="button"
                  >
                    Ver todas as notificações
                    <ChevronDown size={16} className={styles.viewAllIcon} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.userMenu} ref={dropdownRef}>
          <button 
            className={`${styles.userProfile} ${darkMode ? styles.dark : ''}`}
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            type="button"
          >
            <div className={styles.userInfo}>
              <div className={`${styles.userName} ${darkMode ? styles.dark : ''}`}>
                {userFullName}
              </div>
              <div className={`${styles.userRole} ${darkMode ? styles.dark : ''}`}>
                {user.isAdmin ? 'Administrador' : 'Usuário'}
              </div>
            </div>
            
            <div className={`${styles.userAvatar} ${unreadCount > 0 ? styles.hasNotifications : ''}`}>
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={userFullName} 
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitials}>{userInitials}</span>
              )}
              {unreadCount > 0 && (
                <span className={styles.avatarNotificationBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            
            <ChevronDown 
              size={16} 
              className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.rotated : ''}`} 
            />
          </button>

          <div 
            className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.active : ''} ${darkMode ? styles.dark : ''}`}
            role="menu"
          >
            <div className={`${styles.userSummary} ${darkMode ? styles.dark : ''}`}>
              <div className={styles.userAvatarLarge}>
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={userFullName} 
                    className={styles.avatarImageLarge}
                  />
                ) : (
                  <span className={styles.avatarInitialsLarge}>{userInitials}</span>
                )}
              </div>
              <div className={styles.userDetails}>
                <div className={`${styles.userName} ${darkMode ? styles.dark : ''}`}>
                  {userFullName}
                </div>
                <div className={`${styles.userEmail} ${darkMode ? styles.dark : ''}`}>
                  {user.email}
                </div>
              </div>
            </div>

            <div className={styles.menuDivider}></div>

            <div className={styles.menuSection}>
              <button 
                className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}
                onClick={onProfileClick}
                type="button"
              >
                <User size={18} />
                <span>Meu Perfil</span>
              </button>

              <button 
                className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}
                onClick={onSettingsClick}
                type="button"
              >
                <Settings size={18} />
                <span>Configurações</span>
              </button>
            </div>

            <div className={styles.menuDivider}></div>

            <div className={styles.menuSection}>
              <div className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}>
                <div className={styles.toggleContent}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>Modo {darkMode ? 'Claro' : 'Escuro'}</span>
                </div>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    className={styles.toggleInput}
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                  <span className={`${styles.toggleSlider} ${darkMode ? styles.dark : ''}`}></span>
                </label>
              </div>

              <button 
                className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}
                onClick={toggleNotifications} 
                type="button"
              >
                <Bell size={18} />
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <span className={styles.menuNotificationBadge}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className={styles.menuDivider}></div>

            <div className={styles.menuSection}>
              <button 
                className={`${styles.menuItem} ${styles.logout} ${darkMode ? styles.dark : ''}`}
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={18} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;