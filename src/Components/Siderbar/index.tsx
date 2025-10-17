import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiDollarSign, 
  FiUsers, 
  FiPackage, 
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiTrendingUp,
  FiBell
} from 'react-icons/fi';
import type { SidebarProps } from '../../types/Sidebar';
import styles from './styles.module.scss';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: string | number }>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  onToggle, 
  darkMode, 
  className = "",
  activeSection,
  onSectionChange,
  user,
  onSendNotification
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: FiHome },
    { id: 'sales', label: 'Vendas', icon: FiDollarSign },
    { id: 'customers', label: 'Clientes', icon: FiUsers },
    { id: 'products', label: 'Produtos', icon: FiPackage },
    { id: 'prospections', label: 'Prospecções', icon: FiTrendingUp }, 
    { id: 'users', label: 'Usuários', icon: FiUser }, 
  ];

  if (user?.isAdmin) {
    menuItems.push({ 
      id: 'notifications', 
      label: 'Enviar Notificação', 
      icon: FiBell 
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleItemClick = (itemId: string) => {
    if (itemId === 'notifications' && onSendNotification) {
      onSendNotification();
    } else {
      onSectionChange(itemId);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''} ${darkMode ? styles.dark : ''} ${className}`}>
      <button 
        className={`${styles.toggleButton} ${darkMode ? styles.dark : ''}`}
        onClick={onToggle}
        aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
        type="button"
      >
        {isExpanded ? <FiChevronLeft /> : <FiChevronRight />}
      </button>

      <nav>
        <ul className={styles.navList}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id} className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${activeSection === item.id ? styles.active : ''} ${darkMode ? styles.dark : ''} ${item.id === 'notifications' ? styles.adminFeature : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  type="button"
                >
                  <span className={styles.icon}>
                    <IconComponent size={20} />
                  </span>
                  <span className={styles.label}>
                    {item.label}
                  </span>
                  
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`${styles.clockContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.clock} ${darkMode ? styles.dark : ''}`}>
          <span className={styles.clockIcon}>
            <FiClock size={16} />
          </span>
          <span className={styles.time}>
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;