import React, { useState } from 'react';
import { FiEdit2, FiMail, FiPhone } from 'react-icons/fi';
import type { Customer, CustomerFilters } from '../../types/Customers';
import styles from './styles.module.scss';

interface CustomersProps {
  darkMode: boolean;
  className?: string;
}

const Customers: React.FC<CustomersProps> = ({ darkMode, className = "" }) => {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Maria Silva',
      company: 'Tech Solutions Ltda',
      email: 'maria.silva@techsolutions.com',
      phone: '(11) 99999-9999',
      status: 'active',
      salesStatus: 'fechado',
      lastContact: '15/03/2024',
      totalSales: 12500,
      salesPerson: 'João Silva',
      notes: 'Cliente satisfeito com os serviços'
    },
    {
      id: '2',
      name: 'João Santos',
      company: 'Comércio Express',
      email: 'joao.santos@comercioexpress.com',
      phone: '(11) 98888-8888',
      status: 'active',
      salesStatus: 'negociar',
      lastContact: '14/03/2024',
      totalSales: 3200,
      salesPerson: 'Ana Costa',
      notes: 'Aguardando aprovação do orçamento'
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      company: 'Indústria Moderna',
      email: 'carlos.oliveira@industriamoderna.com',
      phone: '(11) 97777-7777',
      status: 'pending',
      salesStatus: 'prospecção',
      lastContact: '13/03/2024',
      totalSales: 0,
      salesPerson: 'João Silva',
      notes: 'Primeiro contato, agendar reunião'
    },
    {
      id: '4',
      name: 'Ana Costa',
      company: 'Serviços Rápidos',
      email: 'ana.costa@servicosrapidos.com',
      phone: '(11) 96666-6666',
      status: 'inactive',
      salesStatus: 'perdida',
      lastContact: '12/03/2024',
      totalSales: 0,
      salesPerson: 'Ana Costa',
      notes: 'Cliente optou por concorrente'
    },
    {
      id: '5',
      name: 'Pedro Rocha',
      company: 'Marketing Digital',
      email: 'pedro.rocha@marketingdigital.com',
      phone: '(11) 95555-5555',
      status: 'active',
      salesStatus: 'fechado',
      lastContact: '11/03/2024',
      totalSales: 8500,
      salesPerson: 'João Silva',
      notes: 'Fechamento rápido, cliente decidido'
    },
    {
      id: '6',
      name: 'Roberto Almeida',
      company: 'Construção Civil SA',
      email: 'roberto.almeida@construcaocivil.com',
      phone: '(11) 94444-4444',
      status: 'active',
      salesStatus: 'apresentada proposta',
      lastContact: '10/03/2024',
      totalSales: 0,
      salesPerson: 'Ana Costa',
      notes: 'Proposta enviada, aguardando retorno'
    },
    {
      id: '7',
      name: 'Fernanda Lima',
      company: 'Alimentos Premium',
      email: 'fernanda.lima@alimentospremium.com',
      phone: '(11) 93333-3333',
      status: 'active',
      salesStatus: 'pós venda',
      lastContact: '09/03/2024',
      totalSales: 5600,
      salesPerson: 'João Silva',
      notes: 'Cliente em fase de implementação'
    },
    {
      id: '8',
      name: 'Ricardo Souza',
      company: 'Logística Express',
      email: 'ricardo.souza@logisticaexpress.com',
      phone: '(11) 92222-2222',
      status: 'active',
      salesStatus: 'pós venda',
      lastContact: '08/03/2024',
      totalSales: 4200,
      salesPerson: 'Ana Costa',
      notes: 'Visita de manutenção agendada'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getSalesStatusLabel = (status: string) => {
    const labels = {
      'prospecção': 'Prospecção',
      'apresentada proposta': 'Proposta Apresentada',
      'negociar': 'Em Negociação',
      'fechar proposta': 'Fechar Proposta',
      'fechado': 'Fechado',
      'pós venda': 'Pós Venda',
      'perdida': 'Perdida'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleEditCustomer = (customerId: string) => {
    console.log('Editando cliente:', customerId);
    // Aqui você implementaria a lógica de edição
  };

  const filteredCustomers = customers.filter(customer => {
    if (filters.status && customer.status !== filters.status) return false;
    if (filters.salesPerson && customer.salesPerson !== filters.salesPerson) return false;
    if (filters.salesStatus && customer.salesStatus !== filters.salesStatus) return false;
    return true;
  });

  return (
    <div className={`${styles.customers} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.customersHeader}>
        <h1 className={`${styles.customersTitle} ${darkMode ? styles.dark : ''}`}>
          Gerenciamento de Clientes
        </h1>
        <button className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}>
          + Novo Cliente
        </button>
      </div>

      <div className={`${styles.filtersContainer} ${darkMode ? styles.dark : ''}`}>
        <h3 className={`${styles.filtersTitle} ${darkMode ? styles.dark : ''}`}>Filtros</h3>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Status do Cliente</label>
            <select 
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Status da Venda</label>
            <select 
              value={filters.salesStatus || ''}
              onChange={(e) => handleFilterChange('salesStatus', e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="prospecção">Prospecção</option>
              <option value="apresentada proposta">Proposta Apresentada</option>
              <option value="negociar">Em Negociação</option>
              <option value="fechar proposta">Fechar Proposta</option>
              <option value="fechado">Fechado</option>
              <option value="pós venda">Pós Venda</option>
              <option value="perdida">Perdida</option>
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

      <div className={`${styles.customersTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Lista de Clientes ({filteredCustomers.length} resultados)
        </div>
        <table className={styles.customersTable}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Contato</th>
              <th>Status</th>
              <th>Status da Venda</th>
              <th>Último Contato</th>
              <th>Total de Vendas</th>
              <th>Vendedor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <strong>{customer.name}</strong>
                </td>
                <td>{customer.company}</td>
                <td>
                  <div className={styles.contactInfo}>
                    <div className={styles.email}>
                      <FiMail size={12} /> {customer.email}
                    </div>
                    <div className={styles.phone}>
                      <FiPhone size={12} /> {customer.phone}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[customer.status]} ${darkMode ? styles.dark : ''}`}>
                    {getStatusLabel(customer.status)}
                  </span>
                </td>
                <td>
                  <span className={`${styles.salesStatus} ${styles[customer.salesStatus]}`}>
                    {getSalesStatusLabel(customer.salesStatus)}
                  </span>
                </td>
                <td>{customer.lastContact}</td>
                <td>
                  <strong>{formatCurrency(customer.totalSales)}</strong>
                </td>
                <td>{customer.salesPerson}</td>
                <td>
                  <button 
                    className={`${styles.actionButton} ${darkMode ? styles.dark : ''}`}
                    onClick={() => handleEditCustomer(customer.id)}
                  >
                    <FiEdit2 size={14} />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;