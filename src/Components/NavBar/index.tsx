import React, { useState, useRef, useEffect } from 'react';
import type { NavbarProps as BaseNavbarProps, Notification } from '../../types/Navbar';
import styles from './styles.module.scss';
import logoImage from '../../assets/logo.png';
type NavbarProps = BaseNavbarProps & { 
  notifications?: Notification[]; 
  onMarkAllAsRead?: () => void; 
  onNotificationClick?: (notification: Notification) => void;
  onNotificationsClick?: () => void; 
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
  onNotificationsClick 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={`${styles.logo} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.logoIcon}>   
          <img src={logoImage} alt="Logo" className={styles.logoImage} />
        </div>
        <span className={styles.logoText}>{appName}</span>
      </div>

      <div className={styles.navbarRight}>
        <div className={styles.notificationsContainer} ref={notificationsRef}>
          <button 
            className={`${styles.notificationsButton} ${darkMode ? styles.dark : ''}`}
            onClick={toggleNotifications}
            type="button"
            aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ''}`}
          >
            <span className={styles.notificationsIcon}>🔔</span>
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
                {unreadCount > 0 && (
                  <button 
                    className={styles.markAllRead}
                    onClick={handleMarkAllAsRead}
                    type="button"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              
              <div className={styles.notificationsList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    📝 Nenhuma notificação
                  </div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTitle}>
                          {notification.title}
                        </div>
                        <div className={styles.notificationMessage}>
                          {notification.message}
                        </div>
                        <div className={styles.notificationTime}>
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      {notification.image && (
                        <img 
                          src={notification.image} 
                          alt=""
                          className={styles.notificationImage}
                        />
                      )}
                      {!notification.read && (
                        <div className={styles.unreadDot}></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && ( 
                <div className={styles.notificationsFooter}>
                  <button 
                    className={styles.viewAllButton}
                    onClick={handleViewAllNotifications} 
                    type="button"
                  >
                    Ver todas as notificações ({notifications.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.userMenu} ref={dropdownRef}>
          <button 
            className={`${styles.userAvatar} ${darkMode ? styles.dark : ''}`}
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            type="button"
          >
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
          </button>

          <div 
            className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.active : ''} ${darkMode ? styles.dark : ''}`}
            role="menu"
          >
            <div className={`${styles.userInfo} ${darkMode ? styles.dark : ''}`}>
              <div className={`${styles.userName} ${darkMode ? styles.dark : ''}`}>
                {userFullName}
              </div>
              <div className={`${styles.userEmail} ${darkMode ? styles.dark : ''}`}>
                {user.email}
              </div>
              <div className={`${styles.userRole} ${darkMode ? styles.dark : ''}`}>
                {user.isAdmin ? 'Administrador' : 'Usuário'}
              </div>
            </div>

            <div className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}>
              <div className={styles.toggleContainer}>
                <div className={styles.toggleContent}>
                  <span>🌙</span>
                  Modo Escuro
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
            </div>       
            
            <button 
              className={`${styles.menuItem} ${darkMode ? styles.dark : ''}`}
              onClick={handleViewAllNotifications} 
              type="button"
            >
              <div className={styles.toggleContent}>
                <span>🔔</span>
                Notificações
                {unreadCount > 0 && (
                  <span className={styles.menuNotificationBadge}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            <button 
              className={`${styles.menuItem} ${styles.logout} ${darkMode ? styles.dark : ''}`}
              onClick={handleLogout}
              type="button"
            >
              <div className={styles.toggleContent}>
                <span>🚪</span>
                Sair da Conta
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;