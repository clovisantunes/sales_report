import React from 'react';
import styles from './styles.module.scss';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  loading: boolean;
  darkMode: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  loading, 
  darkMode 
}) => {
  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.errorState}>
        <p>{error}</p>
        <button 
          className={`${styles.retryButton} ${darkMode ? styles.dark : ''}`}
          onClick={onRetry}
          disabled={loading}
        >
          {loading ? 'Tentando novamente...' : 'Tentar Novamente'}
        </button>
      </div>
    </div>
  );
};

export default ErrorState;