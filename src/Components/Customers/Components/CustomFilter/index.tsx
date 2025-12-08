import React from 'react';
import type { CustomerFilters } from '../../../../types/Customers';
import styles from '../../styles.module.scss';

interface CustomerFiltersProps {
  darkMode: boolean;
  filters: CustomerFilters;
  users: any[];
  loading: boolean;
  onFilterChange: (key: keyof CustomerFilters, value: string) => void;
  onApplyFilters: () => void;
  onResetData: () => void;
}

const CustomerFiltersComponent: React.FC<CustomerFiltersProps> = ({
  darkMode,
  filters,
  users,
  loading,
  onFilterChange,
  onApplyFilters,
  onResetData
}) => {
  return (
    <div className={`${styles.filtersContainer} ${darkMode ? styles.dark : ''}`}>
      <h3 className={`${styles.filtersTitle} ${darkMode ? styles.dark : ''}`}>Filtros</h3>
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label>Status do Cliente</label>
          <select 
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
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
            onChange={(e) => onFilterChange('salesStatus', e.target.value)}
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
            onChange={(e) => onFilterChange('contactMethod', e.target.value)}
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
            onChange={(e) => onFilterChange('salesPerson', e.target.value)}
          >
            <option value="">Todos os vendedores</option>
            {users.map(user => (
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
          onClick={onApplyFilters}
          disabled={loading}
        >
          {loading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>
        <button 
          className={`${styles.clearButton} ${darkMode ? styles.dark : ''}`} 
          onClick={onResetData}
          disabled={loading}
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default CustomerFiltersComponent;