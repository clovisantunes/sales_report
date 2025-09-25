import React, { useState } from 'react';
import type { Sale, SalesFilters } from '../../types/Sales';
import styles from './styles.module.scss';

interface SalesProps {
  darkMode: boolean;
  className?: string;
}

const Sales: React.FC<SalesProps> = ({ darkMode, className = "" }) => {
  const [filters, setFilters] = useState<SalesFilters>({});
  const [sales] = useState<Sale[]>([
    {
      id: '1',
      date: '15/03/2024',
      company: 'Tech Solutions Ltda',
      type: 'Novo cliente',
      contactName: 'Maria Silva',
      contactMethod: 'email',
      stage: 'fechado',
      productType: 'medicina do trabalho',
      amount: 12500,
      comments: 'Cliente satisfeito com a demonstração',
      salesPerson: 'João Silva'
    },
    {
      id: '2',
      date: '14/03/2024',
      company: 'Comércio Express',
      type: 'Em negociação',
      contactName: 'João Santos',
      contactMethod: 'telefone',
      stage: 'negociar',
      productType: 'assistencia medica',
      amount: 3200,
      comments: 'Aguardando aprovação do orçamento',
      salesPerson: 'Ana Costa'
    },
    {
      id: '3',
      date: '13/03/2024',
      company: 'Indústria Moderna',
      type: 'Novo cliente',
      contactName: 'Carlos Oliveira',
      contactMethod: 'presencial',
      stage: 'prospecção',
      productType: 'plano odontologico',
      amount: 0,
      comments: 'Primeiro contato, agendar follow-up',
      salesPerson: 'João Silva'
    },
    {
      id: '4',
      date: '12/03/2024',
      company: 'Serviços Rápidos',
      type: 'Em negociação',
      contactName: 'Ana Costa',
      contactMethod: 'whatsapp',
      stage: 'perdida',
      productType: 'minha saude',
      amount: 0,
      comments: 'Cliente optou por concorrente',
      salesPerson: 'Ana Costa'
    },
    {
      id: '5',
      date: '11/03/2024',
      company: 'Marketing Digital',
      type: 'Novo cliente',
      contactName: 'Pedro Rocha',
      contactMethod: 'email',
      stage: 'fechado',
      productType: 'medicina do trabalho',
      amount: 8500,
      comments: 'Fechamento rápido, cliente decidido',
      salesPerson: 'João Silva'
    },
    {
      id: '6',
      date: '10/03/2024',
      company: 'Construção Civil SA',
      type: 'Em negociação',
      contactName: 'Roberto Almeida',
      contactMethod: 'presencial',
      stage: 'apresentada proposta',
      productType: 'assistencia medica',
      amount: 0,
      comments: 'Proposta enviada, aguardando retorno',
      salesPerson: 'Ana Costa'
    },
    {
      id: '7',
      date: '09/03/2024',
      company: 'Alimentos Premium',
      type: 'Novo cliente',
      contactName: 'Fernanda Lima',
      contactMethod: 'telefone',
      stage: 'pós venda',
      productType: 'plano odontologico',
      amount: 5600,
      comments: 'Cliente em fase de implementação',
      salesPerson: 'João Silva'
    },
    {
      id: '8',
      date: '08/03/2024',
      company: 'Logística Express',
      type: 'Em negociação',
      contactName: 'Ricardo Souza',
      contactMethod: 'whatsapp',
      stage: 'visita manutenção',
      productType: 'minha saude',
      amount: 4200,
      comments: 'Visita de manutenção agendada',
      salesPerson: 'Ana Costa'
    }
  ]);

  const getTypeLabel = (type: string) => {
    const labels = {
      'Novo cliente': 'Novo cliente',
      'Em negociação': 'Em negociação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getContactMethodLabel = (method: string) => {
    const labels = {
      'presencial': 'Presencial',
      'telefone': 'Telefone',
      'email': 'Email',
      'whatsapp': 'WhatsApp'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      'prospecção': 'Prospecção',
      'apresentada proposta': 'Apresentada proposta',
      'negociar': 'Negociar',
      'fechar proposta': 'Fechar proposta',
      'fechado': 'Fechado',
      'pós venda': 'Pós venda',
      'visita manutenção': 'Visita manutenção',
      'renegociar contrato': 'Renegociar contrato',
      'perdida': 'Perdida'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getProductTypeLabel = (product: string) => {
    const labels = {
      'medicina do trabalho': 'Medicina do Trabalho',
      'assistencia medica': 'Assistência Médica',
      'plano odontologico': 'Plano Odontológico',
      'minha saude': 'Minha Saúde'
    };
    return labels[product as keyof typeof labels] || product;
  };

  const getResultClass = (stage: string) => {
    if (stage === 'fechado') return 'fechado';
    if (stage === 'perdida') return 'perdida';
    return 'em-andamento';
  };

  const getResultLabel = (stage: string) => {
    if (stage === 'fechado') return 'Fechado';
    if (stage === 'perdida') return 'Perdida';
    return 'Negociação em andamento';
  };

  const handleFilterChange = (key: keyof SalesFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const filteredSales = sales.filter(sale => {
    if (filters.stage && sale.stage !== filters.stage) return false;
    if (filters.salesPerson && sale.salesPerson !== filters.salesPerson) return false;
    if (filters.productType && sale.productType !== filters.productType) return false;
    if (filters.type && sale.type !== filters.type) return false;
    if (filters.contactMethod && sale.contactMethod !== filters.contactMethod) return false;
    return true;
  });

  return (
    <div className={`${styles.sales} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.salesHeader}>
        <h1 className={`${styles.salesTitle} ${darkMode ? styles.dark : ''}`}>
          Gerenciamento de Vendas
        </h1>
        <button className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}>
          + Nova Venda
        </button>
      </div>

      <div className={`${styles.filtersContainer} ${darkMode ? styles.dark : ''}`}>
        <h3 className={`${styles.filtersTitle} ${darkMode ? styles.dark : ''}`}>Filtros</h3>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Tipo</label>
            <select 
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="Novo cliente">Novo cliente</option>
              <option value="Em negociação">Em negociação</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Forma de Contato</label>
            <select 
              value={filters.contactMethod || ''}
              onChange={(e) => handleFilterChange('contactMethod', e.target.value)}
            >
              <option value="">Todas as formas</option>
              <option value="presencial">Presencial</option>
              <option value="telefone">Telefone</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Estágio</label>
            <select 
              value={filters.stage || ''}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
            >
              <option value="">Todos os estágios</option>
              <option value="prospecção">Prospecção</option>
              <option value="apresentada proposta">Apresentada proposta</option>
              <option value="negociar">Negociar</option>
              <option value="fechar proposta">Fechar proposta</option>
              <option value="fechado">Fechado</option>
              <option value="pós venda">Pós venda</option>
              <option value="visita manutenção">Visita manutenção</option>
              <option value="renegociar contrato">Renegociar contrato</option>
              <option value="perdida">Perdida</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Tipo de Produto</label>
            <select 
              value={filters.productType || ''}
              onChange={(e) => handleFilterChange('productType', e.target.value)}
            >
              <option value="">Todos os produtos</option>
              <option value="medicina do trabalho">Medicina do Trabalho</option>
              <option value="assistencia medica">Assistência Médica</option>
              <option value="plano odontologico">Plano Odontológico</option>
              <option value="minha saude">Minha Saúde</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Vendedor</label>
            <select 
              value={filters.salesPerson || ''}
              onChange={(e) => handleFilterChange('salesPerson', e.target.value)}
            >
              <option value="">Todos os vendedores</option>
              <option value="João Silva">João Silva</option>
              <option value="Ana Costa">Ana Costa</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Data Início</label>
            <input 
              type="date" 
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Data Fim</label>
            <input 
              type="date" 
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className={`${styles.applyButton} ${darkMode ? styles.dark : ''}`}>
            Aplicar Filtros
          </button>
          <button className={`${styles.clearButton} ${darkMode ? styles.dark : ''}`} onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className={`${styles.salesTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Registro de Vendas ({filteredSales.length} resultados)
        </div>
        <table className={styles.salesTable}>
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
              <th>Comentário</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.date}</td>
                <td>{sale.company}</td>
                <td>{getTypeLabel(sale.type)}</td>
                <td>{sale.contactName}</td>
                <td>{getContactMethodLabel(sale.contactMethod)}</td>
                <td>
                  <span className={`${styles.stage} ${styles[sale.stage]}`}>
                    {getStageLabel(sale.stage)}
                  </span>
                </td>
                <td>{getProductTypeLabel(sale.productType)}</td>
                <td className={`${styles.resultado} ${styles[getResultClass(sale.stage)]} ${darkMode ? styles.dark : ''}`}>
                  {getResultLabel(sale.stage)}
                </td>
                <td>{sale.salesPerson}</td>
                <td>{sale.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;