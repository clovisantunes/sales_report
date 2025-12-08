import React from 'react';
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiUser, FiBriefcase } from 'react-icons/fi';
import type { Customer } from '../../../../types/Customers';
import styles from '../../styles.module.scss';

interface CustomersTableProps {
  darkMode: boolean;
  customers: Customer[];
  loading: boolean;
  counts: { active: number; pending: number; inactive: number };
  getSalesPersonName: (id: string) => string;
  getContactMethodLabel: (method: string) => string;
  onEditCustomer: (customer: Customer) => void;
  onResetData: () => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  darkMode,
  customers,
  loading,
  counts,
  getSalesPersonName,
  getContactMethodLabel,
  onEditCustomer,
  onResetData
}) => {
  const hasContactInfo = (customer: Customer) => {
    return !!(customer.email || customer.phone || customer.whatsapp || customer.address);
  };

  if (loading && customers.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <div>Carregando clientes...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <p>Nenhum cliente encontrado.</p>
        <button 
          className={`${styles.resetButton} ${darkMode ? styles.dark : ''}`}
          onClick={onResetData}
        >
          Recarregar Dados
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.customersTableContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.tableHeader}>
        <h2 className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Lista de Clientes ({customers.length} resultados)
        </h2>
        <div className={styles.tableStats}>
          <span className={styles.statItem}>
            <span className={`${styles.statDot} ${styles.active}`}></span>
            Ativos: {counts.active}
          </span>
          <span className={styles.statItem}>
            <span className={`${styles.statDot} ${styles.pending}`}></span>
            Pendentes: {counts.pending}
          </span>
          <span className={styles.statItem}>
            <span className={`${styles.statDot} ${styles.inactive}`}></span>
            Inativos: {counts.inactive}
          </span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.customersTable}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Contato</th>
              <th>Vendedor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className={styles.customerRow}>
                <td>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                      <FiUser size={16} />
                    </div>
                    <div className={styles.customerDetails}>
                      <strong className={styles.customerName}>
                        {customer.name || 'Nome não informado'}
                      </strong>
                      {customer.contactMethod && (
                        <div className={styles.contactMethod}>
                          {getContactMethodLabel(customer.contactMethod)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.companyInfo}>
                    <FiBriefcase size={14} />
                    <span>{customer.company || 'Empresa não informada'}</span>
                  </div>
                </td>
                <td>
                  {hasContactInfo(customer) ? (
                    <div className={styles.contactInfo}>
                      {customer.email && (
                        <div className={styles.contactItem}>
                          <FiMail size={12} />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className={styles.contactItem}>
                          <FiPhone size={12} />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.whatsapp && (
                        <div className={`${styles.contactItem} ${styles.whatsapp}`}>
                          <FiPhone size={12} />
                          <span>{customer.whatsapp}</span>
                          <span className={styles.whatsappBadge}>WhatsApp</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className={styles.contactItem}>
                          <FiMapPin size={12} />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className={styles.noContact}>Sem informações de contato</span>
                  )}
                </td>
                <td>
                  <span className={styles.salesPerson}>
                    {getSalesPersonName(customer.salesPerson)}
                  </span>
                </td>
                <td>
                  <button 
                    className={`${styles.actionButton} ${darkMode ? styles.dark : ''}`}
                    onClick={() => onEditCustomer(customer)}
                    title="Editar cliente"
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

export default CustomersTable;