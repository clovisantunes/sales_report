import React, { useState, useRef, useEffect } from 'react';
import type { NavbarProps } from '../../types/Navbar';
import styles from './styles.module.scss';
import logoImage from '../../assets/logo.png';

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  appName = "DashVendas",
  className = "",
  darkMode,
  onDarkModeToggle
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateInitials = (name: string, lastName?: string): string => {
    if (!name) return 'U';
    
    const firstInitial = name.charAt(0).toUpperCase();
    
    if (lastName) {
      const lastInitial = lastName.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
    
    return firstInitial;
  };

  const getFullName = (name: string, lastName?: string): string => {
    if (!name) return 'Usuário';
    
    if (lastName) {
      return `${name} ${lastName}`;
    }
    
    return name;
  };

  const userInitials = user.initials || generateInitials(user.name, user.lastName);
  const userFullName = getFullName(user.name, user.lastName);
  const userEmail = user.email || '';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleMenuItemClick = (action: string) => {
    console.log(`Ação selecionada: ${action}`);
    setIsDropdownOpen(false);
  };

  const handleDarkModeToggle = () => {
    onDarkModeToggle();
  };

  return (
    <nav className={`${styles.navbar} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={`${styles.logo} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.logoIcon}>   
            <img src={logoImage} alt="Logo" className={styles.logoImage} />
        </div>
        <span className={styles.logoText}>{appName}</span>
      </div>

      <div className={styles.userMenu} ref={dropdownRef}>
        <button 
          className={`${styles.userAvatar} ${darkMode ? styles.dark : ''}`}
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          type="button"
        >
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={userFullName} 
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarInitials}>{userInitials}</span>
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
            {userEmail && (
              <div className={`${styles.userEmail} ${darkMode ? styles.dark : ''}`}>
                {userEmail}
              </div>
            )}
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
            onClick={() => handleMenuItemClick('notifications')}
            type="button"
          >
            <div className={styles.toggleContent}>
              <span>🔔</span>
              Notificações
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
    </nav>
  );
};

export default Navbar;