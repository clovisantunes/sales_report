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
import { salesService } from '../../services/SalesService/SalesService';
import type { Sale } from '../../types/Sales';
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

interface Metricas {
  totalVendas: number;
  vendasMes: number;
  mediaMensal: number;
  crescimento: number;
}

interface DadosGrafico {
  meses: string[];
  vendas: number[];
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, className = "", users = [] }) => {
  const [metricas, setMetricas] = useState<Metricas>({
    totalVendas: 0,
    vendasMes: 0,
    mediaMensal: 0,
    crescimento: 0
  });
  const [vendas, setVendas] = useState<Sale[]>([]);
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
      
      const salesData = await salesService.getSales();
      console.log('📊 Vendas carregadas:', salesData);
      
      setVendas(salesData);
      
      const metricasData = calcularMetricas(salesData);
      setMetricas(metricasData);
      
      const graficoData = calcularDadosGrafico(salesData);
      setDadosGrafico(graficoData);
      
      console.log('✅ Dashboard carregado com sucesso');
      console.log('📈 Métricas calculadas:', metricasData);
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

 const calcularMetricas = (sales: Sale[]): Metricas => {
  console.log('🔍 Calculando métricas para', sales.length, 'vendas');
  
  const vendasFechadas = sales.filter(sale => {
    console.log('Venda:', sale.id, 'Stage:', sale.stage, 'Date:', sale.date);
    return sale.stage === 'finalizado';
  });

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  const vendasMesAtual = vendasFechadas.filter(sale => {
    try {
      // CORREÇÃO: Data tem 3 partes - DD/MM/AAAA
      const [dia, mes, ano] = sale.date.split('/').map(Number);
      return mes === mesAtual && ano === anoAtual;
    } catch (error) {
      console.error('Erro ao processar data:', sale.date);
      return false;
    }
  }).length;

  // Mês anterior
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }

  const vendasMesAnterior = vendasFechadas.filter(sale => {
    try {
      // CORREÇÃO: Data tem 3 partes - DD/MM/AAAA
      const [dia, mes, ano] = sale.date.split('/').map(Number);
      return mes === mesAnterior && ano === anoAnterior;
    } catch {
      return false;
    }
  }).length;

  const crescimento = vendasMesAnterior > 0 
    ? ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100 
    : vendasMesAtual > 0 ? 100 : 0;

  // Calcular média dos últimos 6 meses
  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return { mes: date.getMonth() + 1, ano: date.getFullYear() };
  });

  const vendasUltimos6Meses = ultimos6Meses.map(({ mes, ano }) => {
    const count = vendasFechadas.filter(sale => {
      try {
        // CORREÇÃO: Data tem 3 partes - DD/MM/AAAA
        const [dia, saleMes, saleAno] = sale.date.split('/').map(Number);
        return saleMes === mes && saleAno === ano;
      } catch {
        return false;
      }
    }).length;
    return count;
  });

  const totalVendasUltimos6Meses = vendasUltimos6Meses.reduce((a, b) => a + b, 0);
  const mediaMensal = totalVendasUltimos6Meses / 6;

  return {
    totalVendas: vendasFechadas.length,
    vendasMes: vendasMesAtual,
    mediaMensal: Math.round(mediaMensal * 10) / 10,
    crescimento: Math.round(crescimento * 10) / 10
  };
};

const calcularDadosGrafico = (sales: Sale[]): DadosGrafico => {
  const meses: string[] = [];
  const vendasPorMes: number[] = [];
        
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const mes = date.toLocaleDateString('pt-BR', { month: 'short' });
    const ano = date.getFullYear();
    const mesNumero = date.getMonth() + 1;
    const anoCurto = ano.toString().slice(2);
    
    meses.push(`${mes}/${anoCurto}`);
    
    const vendasNoMes = sales.filter(sale => {
      if (sale.stage !== 'finalizado') return false;
      
      try {
        // CORREÇÃO: Data tem 3 partes - DD/MM/AAAA
        const [dia, saleMes, saleAno] = sale.date.split('/').map(Number);
        return saleMes === mesNumero && saleAno === ano;
      } catch {
        return false;
      }
    }).length;
    
    vendasPorMes.push(vendasNoMes);
  }
  
  return {
    meses,
    vendas: vendasPorMes
  };
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
      'fechado': 'Finalizado', 
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
    if (estagio === 'finalizado') return styles.linhaFechada; 
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
        <h2 className={`${styles.dashboardTitle} ${darkMode ? styles.dark : ''}`}>
          Dashboard de Vendas
        </h2>
        <button 
          className={`${styles.refreshButton} ${darkMode ? styles.dark : ''}`}
          onClick={loadDashboardData}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>
      
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

      {/* Gráfico - Mostra apenas vendas FECHADAS */}
      <div className={`${styles.graficoContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.graficoTitulo} ${darkMode ? styles.dark : ''}`}>
          Vendas Fechadas Mensais (Últimos 6 meses)
        </div>
        <div className={styles.graficoWrapper}>
          {dadosGrafico.vendas.some(v => v > 0) ? (
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

      {/* Tabela - Mostra todas as vendas, mas destaca as fechadas */}
      <div className={`${styles.tabelaContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.tabelaHeader}>
          <div className={`${styles.tabelaTitulo} ${darkMode ? styles.dark : ''}`}>
            Vendas Recentes
          </div>
          <div className={styles.tabelaInfo}>
            Mostrando {Math.min(vendas.length, 10)} vendas mais recentes (todos os estágios)
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
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {vendas.slice(0, 10).map((venda) => (
                <tr key={venda.id} className={getLinhaTabelaClasse(venda.stage)}>
                  <td>{venda.date}</td>
                  <td className={styles.empresa}>{venda.companyName}</td>
                  <td>{venda.type}</td>
                  <td>{venda.contactName}</td>
                  <td>{venda.contactMethod}</td>
                  <td>
                    <span className={`${styles.estagio} ${styles[venda.stage]}`}>
                      {getEstagioLabel(venda.stage)}
                    </span>
                  </td>
                  <td>{venda.productType}</td>
                  <td>{getVendedorName(venda.salesPerson)}</td>
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