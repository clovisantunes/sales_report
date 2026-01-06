import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import styles from './styles.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  meses: string[];
  vendas: number[];
  darkMode: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ meses, vendas, darkMode }) => {
  // Cores baseadas no tema
  const borderColor = darkMode ? '#10b981' : '#059669';
  const backgroundColor = darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)';
  const pointBackgroundColor = darkMode ? '#10b981' : '#059669';
  const pointBorderColor = darkMode ? '#047857' : '#065f46';
  
  // Cores de texto baseadas no tema
  const textColor = darkMode ? '#e5e7eb' : '#374151';
  const gridColor = darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.6)';
  const axisTextColor = darkMode ? '#9ca3af' : '#6b7280';
  const tooltipBgColor = darkMode ? '#1f2937' : '#ffffff';
  const tooltipBorderColor = darkMode ? '#4b5563' : '#d1d5db';

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Vendas Fechadas por Mês',
        data: vendas,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: pointBackgroundColor,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Vendas Fechadas: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: axisTextColor,
          font: {
            size: 11,
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: axisTextColor,
          font: {
            size: 11,
            weight: 500
          },
          stepSize: 1
        }
      },
    },
  };

  const hasData = vendas.some(v => v > 0);

  return (
    <div className={`${styles.graficoContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.graficoTitulo} ${darkMode ? styles.dark : ''}`}>
        Vendas Fechadas Mensais (Últimos 6 meses)
      </div>
      <div className={styles.graficoWrapper}>
        {hasData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className={styles.graficoVazio}>
            <p>Nenhum dado de vendas fechadas disponível para o gráfico</p>
            <p className={styles.graficoAjuda}>
              Dica: Mude o estágio das vendas para "fechado" para ver os dados no gráfico
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;