import React from 'react';
import styles from './styles.module.scss';

interface MetricCardProps {
  title: string;
  value: number;
  info: string;
  trend: 'positive' | 'negative' | 'total' | 'neutral';
  darkMode: boolean;
  icon?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  info,
  trend,
  darkMode,
  icon
}) => {
  return (
    <div className={`${styles.metricaCard} ${styles[`trend-${trend}`]} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.cardHeader}>
        <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
          {title}
        </div>
        {icon && <div className={styles.cardIcon}>{icon}</div>}
      </div>
      <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
        {value.toLocaleString('pt-BR')}
      </div>
      <div className={`${styles.metricaInfo} ${trend === 'positive' ? styles.positivo : trend === 'negative' ? styles.negativo : ''}`}>
        {info}
      </div>
    </div>
  );
};

export default MetricCard;