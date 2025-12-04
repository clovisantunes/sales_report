import React, { useState, useEffect } from 'react';
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiX, FiUser, FiBriefcase } from 'react-icons/fi';
import type { Customer, CustomerFilters } from '../../types/Customers';
import { customerService } from '../../services/Customers/Customers';
import styles from './styles.module.scss';

interface CustomersProps {
  darkMode: boolean;
  className?: string;
  users?: any[];
}

const Customers: React.FC<CustomersProps> = ({ darkMode, className = "", users = [] }) => {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando clientes...');
      const customersData = await customerService.getCustomers();
      console.log('✅ Clientes carregados:', customersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Tente novamente.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const getSalesPersonName = (salesPersonId: string) => {
    if (!users || users.length === 0) return salesPersonId;
    
    const user = users.find(u => u.id === salesPersonId);
    if (user) {
      return user.name || `${user.firstName} ${user.lastName}` || salesPersonId;
    }
    
    return salesPersonId;
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

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Aplicando filtros:', filters);
      const filteredData = await customerService.getCustomersWithFilters(filters);
      console.log('✅ Dados filtrados:', filteredData);
      setCustomers(filteredData);
    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      setError('Erro ao aplicar filtros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    console.log('✏️ Editando cliente:', customer);
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingCustomer(null);
    setSubmitting(false);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSubmitting(true);
    try {
      console.log('💾 Salvando alterações:', editingCustomer);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await loadCustomers();
      handleCloseModal();
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      setError('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetData = async () => {
    await loadCustomers();
    clearFilters();
  };

  const hasContactInfo = (customer: Customer) => {
    return customer.email || customer.phone || customer.whatsapp || customer.address;
  };

  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    
    if (filters.status && customer.status !== filters.status) return false;
    if (filters.salesPerson && customer.salesPerson !== filters.salesPerson) return false;
    if (filters.salesStatus && customer.salesStatus !== filters.salesStatus) return false;
    if (filters.contactMethod && customer.contactMethod !== filters.contactMethod) return false;
    
    return true;
  });

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
                 <option value="">Todos os estágios</option>
              <option value="apresentada proposta">Apresentada proposta</option>
              <option value="negociar">Negociar</option>
              <option value="finalizado">Finalizado</option>
              <option value="pós venda">Pós venda</option>
              <option value="visita manutenção">Visita manutenção</option>
              <option value="renegociar contrato">Renegociar contrato</option>
              <option value="perdida">Perdida</option>
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
            <label>Vendedor</label>
            <select 
              value={filters.salesPerson || ''}
              onChange={(e) => handleFilterChange('salesPerson', e.target.value)}
            >
              <option value="">Todos os vendedores</option>
              {users && users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || `${user.firstName} ${user.lastName}` || user.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button 
            className={`${styles.applyButton} ${darkMode ? styles.dark : ''}`}
            onClick={handleApplyFilters}
            disabled={loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>
          <button 
            className={`${styles.clearButton} ${darkMode ? styles.dark : ''}`} 
            onClick={handleResetData}
            disabled={loading}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className={`${styles.customersTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.tableHeader}>
          <h2 className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
            Lista de Clientes ({filteredCustomers.length} resultados)
          </h2>
          <div className={styles.tableStats}>
            <span className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.active}`}></span>
              Ativos: {filteredCustomers.filter(c => c.status === 'active').length}
            </span>
            <span className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.pending}`}></span>
              Pendentes: {filteredCustomers.filter(c => c.status === 'pending').length}
            </span>
            <span className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.inactive}`}></span>
              Inativos: {filteredCustomers.filter(c => c.status === 'inactive').length}
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <div>Carregando clientes...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p>Nenhum cliente encontrado.</p>
            <button 
              className={`${styles.resetButton} ${darkMode ? styles.dark : ''}`}
              onClick={handleResetData}
            >
              Recarregar Dados
            </button>
          </div>
        ) : (
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
                {filteredCustomers.map((customer) => (
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
                        onClick={() => handleEditCustomer(customer)}
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
        )}
      </div>

      {showEditModal && editingCustomer && (
        <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
            <div className={styles.modalHeader}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
                Editar Cliente
              </h2>
              <button 
                className={`${styles.closeButton} ${darkMode ? styles.dark : ''}`}
                onClick={handleCloseModal}
                disabled={submitting}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className={styles.modalForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Informações Básicas</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nome do Cliente</label>
                    <input
                      type="text"
                      id="name"
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        name: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="company">Empresa</label>
                    <input
                      type="text"
                      id="company"
                      value={editingCustomer.company}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        company: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Informações de Contato</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        email: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Telefone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        phone: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="whatsapp">WhatsApp</label>
                    <input
                      type="tel"
                      id="whatsapp"
                      value={editingCustomer.whatsapp || ''}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        whatsapp: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="address">Endereço</label>
                    <input
                      type="text"
                      id="address"
                      value={editingCustomer.address || ''}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer,
                        address: e.target.value
                      })}
                      disabled={submitting}
                      className={darkMode ? styles.dark : ''}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="notes">Observações</label>
                  <textarea
                    id="notes"
                    value={editingCustomer.notes}
                    onChange={(e) => setEditingCustomer({
                      ...editingCustomer,
                      notes: e.target.value
                    })}
                    rows={3}
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={`${styles.cancelButton} ${darkMode ? styles.dark : ''}`}
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.saveButton} ${darkMode ? styles.dark : ''}`}
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;