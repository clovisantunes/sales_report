import React from 'react';
import type { Venda, Metricas } from '../../types/DashBoard';
import styles from './styles.module.scss';

interface DashboardProps {
  darkMode: boolean;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, className = "" }) => {
  const metricas: Metricas = {
    totalVendas: 54, // Número de vendas totais
    vendasMes: 7,    // Número de vendas deste mês
    mediaMensal: 5,  // Média de vendas por mês
    crescimento: 12.5
  };

  const vendas: Venda[] = [
    {
      id: '1',
      data: '15/03/2024',
      empresa: 'Tech Solutions Ltda',
      tipo: 'B2B',
      nomeContato: 'Maria Silva',
      formaContato: 'Email',
      estagio: 'fechado',
      tipoProduto: 'Software',
      resultado: 12500,
      comentario: 'Cliente satisfeito com a demonstração'
    },
    {
      id: '2',
      data: '14/03/2024',
      empresa: 'Comércio Express',
      tipo: 'B2C',
      nomeContato: 'João Santos',
      formaContato: 'Telefone',
      estagio: 'negociacao',
      tipoProduto: 'Hardware',
      resultado: 3200,
      comentario: 'Aguardando aprovação do budget'
    },
    {
      id: '3',
      data: '13/03/2024',
      empresa: 'Indústria Moderna',
      tipo: 'B2B',
      nomeContato: 'Carlos Oliveira',
      formaContato: 'Reunião',
      estagio: 'prospect',
      tipoProduto: 'Consultoria',
      resultado: 0,
      comentario: 'Primeiro contato, agendar follow-up'
    },
    {
      id: '4',
      data: '12/03/2024',
      empresa: 'Serviços Rápidos',
      tipo: 'B2B',
      nomeContato: 'Ana Costa',
      formaContato: 'LinkedIn',
      estagio: 'perdido',
      tipoProduto: 'Software',
      resultado: 0,
      comentario: 'Cliente optou por concorrente'
    },
    {
      id: '5',
      data: '11/03/2024',
      empresa: 'Digital Marketing',
      tipo: 'B2B',
      nomeContato: 'Pedro Rocha',
      formaContato: 'Email',
      estagio: 'fechado',
      tipoProduto: 'Marketing',
      resultado: 8500,
      comentario: 'Fechamento rápido, cliente decidido'
    }
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat('pt-BR').format(numero);
  };

  const getEstagioLabel = (estagio: string) => {
    const labels = {
      prospect: 'Prospect',
      negociacao: 'Negociação',
      fechado: 'Fechado',
      perdido: 'Perdido'
    };
    return labels[estagio as keyof typeof labels] || estagio;
  };

  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.dark : ''} ${className}`}>
      {/* Métricas - APENAS NÚMEROS */}
      <div className={styles.metricasContainer}>
        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Total de Vendas Geral
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.totalVendas)}
          </div>
          <div className={`${styles.metricaInfo} ${darkMode ? styles.dark : ''}`}>
            Quantidade total de vendas
          </div>
        </div>

        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Vendas do Mês
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.vendasMes)}
          </div>
          <div className={`${styles.metricaInfo} ${metricas.crescimento >= 0 ? styles.positivo : styles.negativo}`}>
            {metricas.crescimento >= 0 ? '↑' : '↓'} {Math.abs(metricas.crescimento)}% vs mês anterior
          </div>
        </div>

        <div className={`${styles.metricaCard} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.metricaTitulo} ${darkMode ? styles.dark : ''}`}>
            Média Mensal
          </div>
          <div className={`${styles.metricaValor} ${darkMode ? styles.dark : ''}`}>
            {formatarNumero(metricas.mediaMensal)}
          </div>
          <div className={`${styles.metricaInfo} ${darkMode ? styles.dark : ''}`}>
            Média de vendas por mês
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className={`${styles.graficoContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.graficoTitulo} ${darkMode ? styles.dark : ''}`}>
          Quantidade de Vendas Mensais (Últimos 6 meses)
        </div>
        <div className={`${styles.graficoPlaceholder} ${darkMode ? styles.dark : ''}`}>
          📊 Gráfico de quantidade de vendas
        </div>
      </div>

      {/* Tabela de Vendas - AQUI SIM COM VALORES MONETÁRIOS */}
      <div className={`${styles.tabelaContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tabelaTitulo} ${darkMode ? styles.dark : ''}`}>
          Registro de Vendas
        </div>
        <table className={styles.tabelaVendas}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Contato</th>
              <th>Forma de Contato</th>
              <th>Estágio</th>
              <th>Produto</th>
              <th>Valor</th>
              <th>Comentário</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.data}</td>
                <td>{venda.empresa}</td>
                <td>{venda.tipo}</td>
                <td>{venda.nomeContato}</td>
                <td>{venda.formaContato}</td>
                <td>
                  <span className={`${styles.estagio} ${styles[venda.estagio]}`}>
                    {getEstagioLabel(venda.estagio)}
                  </span>
                </td>
                <td>{venda.tipoProduto}</td>
                <td className={venda.resultado > 0 ? styles.resultadoPositivo : styles.resultadoNegativo}>
                  {venda.resultado > 0 ? formatarMoeda(venda.resultado) : '-'}
                </td>
                <td>{venda.comentario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;