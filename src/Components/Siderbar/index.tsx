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
  FiTrendingUp 
} from 'react-icons/fi';
import type { SidebarProps } from '../../types/Sidebar';
import styles from './styles.module.scss';

const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  onToggle, 
  darkMode, 
  className = "",
  activeSection,
  onSectionChange
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: FiHome },
    { id: 'sales', label: 'Vendas', icon: FiDollarSign },
    { id: 'customers', label: 'Clientes', icon: FiUsers },
    { id: 'products', label: 'Produtos', icon: FiPackage },
    { id: 'prospections', label: 'Prospecções', icon: FiTrendingUp }, // Novo item
    { id: 'users', label: 'Usuários', icon: FiUser }, 
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  const formatTime = (date: Date) => {
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
        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
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
                  className={`${styles.navLink} ${activeSection === item.id ? styles.active : ''} ${darkMode ? styles.dark : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className={styles.icon}>
                    <IconComponent />
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
            <FiClock />
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