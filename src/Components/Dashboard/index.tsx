import React, { useState, useEffect } from 'react';
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
import type { Venda, Metricas, DadosGrafico } from '../../types/DashBoard';
import { dashboardService } from '../../services/DashboardService/DashboardService';
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

interface DashboardProps {
  darkMode: boolean;
  className?: string;
  users?: any[]; 
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, className = "", users = [] }) => {
  const [metricas, setMetricas] = useState<Metricas>({
    totalVendas: 0,
    vendasMes: 0,
    mediaMensal: 0,
    crescimento: 0
  });
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico>({ meses: [], vendas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados do dashboard...');
      
      const [metricasData, vendasData, graficoData] = await Promise.all([
        dashboardService.getMetricas(),
        dashboardService.getVendasRecentes(),
        dashboardService.getDadosGrafico()
      ]);

      setMetricas(metricasData);
      setVendas(vendasData);
      setDadosGrafico(graficoData);
      
      console.log('✅ Dashboard carregado com sucesso');
      console.log('📊 Métricas:', metricasData);
      console.log('📈 Gráfico dados:', graficoData);
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat('pt-BR').format(numero);
  };

  const getEstagioLabel = (estagio: string) => {
    const labels = {
      'prospecção': 'Prospecção',
      'apresentada proposta': 'Proposta Apresentada',
      'negociar': 'Em Negociação',
      'fechar proposta': 'Fechar Proposta',
      'fechado': 'Fechado',
      'pós venda': 'Pós Venda',
      'visita manutenção': 'Visita Manutenção',
      'renegociar contrato': 'Renegociar Contrato',
      'perdida': 'Perdida'
    };
    return labels[estagio as keyof typeof labels] || estagio;
  };

  const getVendedorName = (vendedorId: string) => {
    if (!users || users.length === 0) return vendedorId;
    const user = users.find(u => u.id === vendedorId);
    return user ? `${user.name} ${user.lastName}` : vendedorId;
  };

  const getLinhaTabelaClasse = (estagio: string) => {
    if (estagio === 'fechado') return styles.linhaFechada;
    if (estagio === 'perdida') return styles.linhaPerdida;
    return '';
  };

  const chartData = {
    labels: dadosGrafico.meses,
    datasets: [
      {
        label: 'Vendas Fechadas por Mês',
        data: dadosGrafico.vendas,
        borderColor: darkMode ? '#10b981' : '#059669',
        backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: darkMode ? '#10b981' : '#059669',
        pointBorderColor: darkMode ? '#047857' : '#065f46',
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
          color: darkMode ? '#e5e7eb' : '#374151',
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
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#f3f4f6' : '#374151',
        bodyColor: darkMode ? '#f3f4f6' : '#374151',
        borderColor: darkMode ? '#4b5563' : '#d1d5db',
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
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.6)',
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.6)',
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
            weight: 500
          },
          stepSize: 1
        }
      },
    },
  };

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <div>Carregando dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''} ${className}`}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button 
            className={`${styles.retryButton} ${darkMode ? styles.dark : ''}`}
            onClick={loadDashboardData}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.dashboardHeader}>
        <h1 className={`${styles.dashboardTitle} ${darkMode ? styles.dark : ''}`}>
          Dashboard de Vendas
        </h1>
        <button 
          className={`${styles.refreshButton} ${darkMode ? styles.dark : ''}`}
          onClick={loadDashboardData}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Métricas - Agora mostram apenas vendas FECHADAS */}
      <div className={styles.metricasContainer}>
        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Total de Vendas Fechadas
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.totalVendas)}
          </div>
          <div className={`${styles.metricaInfo} ${darkMode ? styles.dark : ''}`}>
            Vendas concluídas com sucesso
          </div>
        </div>

        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Vendas Fechadas Este Mês
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.vendasMes)}
          </div>
          <div className={`${styles.metricaInfo} ${metricas.crescimento >= 0 ? styles.positivo : styles.negativo}`}>
            {metricas.crescimento >= 0 ? '↗' : '↘'} {Math.abs(metricas.crescimento)}% vs mês anterior
          </div>
        </div>

        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Média Mensal de Vendas
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.mediaMensal)}
          </div>
          <div className={`${styles.metricaInfo} ${darkMode ? styles.dark : ''}`}>
            Média de vendas fechadas (últimos 6 meses)
          </div>
        </div>
      </div>

      {/* Gráfico - Agora mostra apenas vendas FECHADAS */}
      <div className={`${styles.graficoContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.graficoTitulo} ${darkMode ? styles.dark : ''}`}>
          Vendas Fechadas Mensais (Últimos 6 meses)
        </div>
        <div className={styles.graficoWrapper}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Tabela - Mostra todas as vendas, mas destaca as fechadas */}
      <div className={`${styles.tabelaContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.tabelaHeader}>
          <div className={`${styles.tabelaTitulo} ${darkMode ? styles.dark : ''}`}>
            Vendas Recentes
          </div>
          <div className={styles.tabelaInfo}>
            Mostrando {vendas.length} vendas mais recentes (todos os estágios)
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.tabelaVendas}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome da Empresa</th>
                <th>Tipo</th>
                <th>Nome Contato</th>
                <th>Forma de Contato</th>
                <th>Estágio</th>
                <th>Tipo de Produto</th>
                <th>Resultado</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id} className={getLinhaTabelaClasse(venda.estagio)}>
                  <td>{venda.data}</td>
                  <td className={styles.empresa}>{venda.empresa}</td>
                  <td>{venda.tipo}</td>
                  <td>{venda.nomeContato}</td>
                  <td>{venda.formaContato}</td>
                  <td>
                    <span className={`${styles.estagio} ${styles[venda.estagio]}`}>
                      {getEstagioLabel(venda.estagio)}
                    </span>
                  </td>
                  <td>{venda.tipoProduto}</td>
                  <td className={styles.resultado}>
                    {venda.resultado || '-'}
                  </td>
                  <td>{getVendedorName(venda.vendedor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {vendas.length === 0 && (
          <div className={styles.emptyState}>
            Nenhuma venda encontrada
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;