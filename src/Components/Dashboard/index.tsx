// Dashboard.tsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { salesService } from '../../services/SalesService/SalesService';
import type { Sale } from '../../types/Sales';
import type { DadosGrafico } from './utils/dashboardCalculations';
import { calcularMetricas, calcularDadosGrafico } from './utils/dashboardCalculations';

import MetricCard from './components/MetricCard';
import SalesChart from './components/SalesChart';
import SalesTable from './components/SalesTable';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

import styles from './styles.module.scss';

interface DashboardProps {
  darkMode: boolean;
  className?: string;
  users?: any[]; 
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, className = "", users = [] }) => {
  const [metricas, setMetricas] = useState({
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
      
      const salesData = await salesService.getSales();
      setVendas(salesData);
      
      const metricasData = calcularMetricas(salesData);
      setMetricas(metricasData);
      
      const graficoData = calcularDadosGrafico(salesData);
      setDadosGrafico(graficoData);
      
    } catch (error) {
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    loadDashboardData();
  };

  if (loading) {
    return <LoadingState darkMode={darkMode} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={loadDashboardData}
        loading={loading}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.dashboardHeader}>
        <h2 className={`${styles.dashboardTitle} ${darkMode ? styles.dark : ''}`}>
          Resumo
        </h2>
        <button 
          className={`${styles.refreshButton} ${darkMode ? styles.dark : ''}`}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>
      
      <div className={styles.metricasContainer}>
        <MetricCard
          title="Total de Vendas Fechadas"
          value={metricas.totalVendas}
          info="Vendas concluídas com sucesso"
          trend="total"
          darkMode={darkMode}
          icon="💰"
        />

        <MetricCard
          title="Vendas Fechadas Este Mês"
          value={metricas.vendasMes}
          info={`${metricas.crescimento >= 0 ? '↗' : '↘'} ${Math.abs(metricas.crescimento)}% vs mês anterior`}
          trend={metricas.crescimento >= 0 ? "positive" : "negative"}
          darkMode={darkMode}
          icon={metricas.crescimento >= 0 ? "📈" : "📉"}
        />

        <MetricCard
          title="Média Mensal de Vendas"
          value={metricas.mediaMensal}
          info="Média de vendas fechadas (últimos 6 meses)"
          trend="neutral"
          darkMode={darkMode}
          icon="📊"
        />
      </div>

      <SalesChart
        meses={dadosGrafico.meses}
        vendas={dadosGrafico.vendas}
        darkMode={darkMode}
      />

      <SalesTable
        vendas={vendas}
        users={users}
        darkMode={darkMode}
      />
    </div>
  );
};

export default Dashboard;