import React from 'react';
import styles from './styles.module.scss';

interface LoadingStateProps {
  message?: string;
  darkMode: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Carregando dashboard...', 
  darkMode 
}) => {
  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default LoadingState;