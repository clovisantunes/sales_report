import React from 'react';
import styles from './styles.module.scss';

import { useCustomers } from './Hooks/useCustomers';
import { useCustomerFilters } from './Hooks/useCustomerFilters';
import { useSalesPerson } from './Hooks/useSalesPerson';
import { useCustomerEdit } from './Hooks/useCustomerEdit';

import CustomerFiltersComponent from './Components/CustomFilter/index'; 
import CustomersTable from './Components/CostomersTable/index';
import EditCustomerModal from './Components/EditCustomerModal/index';


interface CustomersProps {
  darkMode: boolean;
  className?: string;
  users?: any[];
}

const Customers: React.FC<CustomersProps> = ({ darkMode, className = "", users = [] }) => {
  console.log('🔍 Customers renderizando - Props:', { 
    usersCount: users?.length,
    darkMode,
    className
  });

  const { customers, loading, error, loadCustomers, applyFilters } = useCustomers();
  const { filters, filteredCustomers, counts, handleFilterChange, clearFilters } = 
    useCustomerFilters(customers);
  const { getSalesPersonName } = useSalesPerson(users);
  const { 
    showEditModal, 
    editingCustomer, 
    submitting, 
    handleEditCustomer, 
    handleCloseModal, 
    handleSaveCustomer,
    setEditingCustomer 
  } = useCustomerEdit();

  const getContactMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'presencial': 'Presencial',
      'telefone': 'Telefone',
      'email': 'Email',
      'whatsapp': 'WhatsApp'
    };
    return labels[method] || method;
  };

  const handleApplyFilters = async () => {
    console.log('🔍 Aplicando filtros:', filters);
    await applyFilters(filters);
  };

  const handleResetData = async () => {
    console.log('🔄 Recarregando dados...');
    await loadCustomers();
    clearFilters();
  };

  const handleModalSave = async (e: React.FormEvent) => {
    console.log('💾 Salvando cliente...');
    await handleSaveCustomer(e, editingCustomer, loadCustomers);
  };

  if (loading && customers.length === 0) {
    console.log('⏳ Mostrando loading...');
    return (
      <div className={`${styles.customers} ${darkMode ? styles.dark : ''} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <div>Carregando clientes...</div>
        </div>
      </div>
    );
  }

  console.log('🎨 Renderizando interface...');

  return (
    <div className={`${styles.customers} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.customersHeader}>
        <h1 className={`${styles.customersTitle} ${darkMode ? styles.dark : ''}`}>
          Gerenciamento de Clientes
        </h1>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.refreshButton} ${darkMode ? styles.dark : ''}`}
            onClick={loadCustomers}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={loadCustomers}>Tentar Novamente</button>
        </div>
      )}

      <CustomerFiltersComponent
        darkMode={darkMode}
        filters={filters}
        users={users}
        loading={loading}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetData={handleResetData}
      />

      <CustomersTable
        darkMode={darkMode}
        customers={filteredCustomers}
        loading={loading}
        counts={counts}
        getSalesPersonName={getSalesPersonName}
        getContactMethodLabel={getContactMethodLabel}
        onEditCustomer={handleEditCustomer}
        onResetData={handleResetData}
      />

      <EditCustomerModal
        show={showEditModal}
        darkMode={darkMode}
        customer={editingCustomer}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleModalSave}
        onCustomerChange={setEditingCustomer}
      />
    </div>
  );
};

export default Customers;