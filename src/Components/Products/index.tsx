import React, { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import type { Product, ProductFilters } from '../../types/Products';
import styles from './styles.module.scss';

interface ProductsProps {
  darkMode: boolean;
  className?: string;
}

const Products: React.FC<ProductsProps> = ({ darkMode, className = "" }) => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Medicina do Trabalho',
      category: 'Saúde Ocupacional',
      price: 0,
      status: 'active',
      description: 'Programa completo de medicina ocupacional para empresas',
      createdAt: '15/01/2024'
    },
    {
      id: '2',
      name: 'Assistência Médica',
      category: 'Plano de Saúde',
      price: 0,
      status: 'active',
      description: 'Plano de saúde empresarial com ampla rede credenciada',
      createdAt: '20/01/2024'
    },
    {
      id: '3',
      name: 'Plano Odontológico',
      category: 'Odontologia',
      price: 0,
      status: 'active',
      description: 'Cobertura odontológica completa para colaboradores',
      createdAt: '10/02/2024'
    },
    {
      id: '4',
      name: 'Minha Saúde',
      category: 'Bem-estar',
      price: 0,
      status: 'active',
      description: 'Programa de bem-estar e saúde preventiva',
      createdAt: '05/03/2024'
    }
  ]);

  const getStatusLabel = (status: string) => {
    const labels = {
      'active': 'Ativo',
      'inactive': 'Inativo'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleEditProduct = (productId: string) => {
    console.log('Editando produto:', productId);
    // Aqui você implementaria a lógica de edição
  };

  const filteredProducts = products.filter(product => {
    if (filters.status && product.status !== filters.status) return false;
    return true;
  });

  return (
    <div className={`${styles.products} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.productsHeader}>
        <h1 className={`${styles.productsTitle} ${darkMode ? styles.dark : ''}`}>
          Lista de Produtos
        </h1>
        <button className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}>
          + Novo Produto
        </button>
      </div>

      <div className={`${styles.filtersContainer} ${darkMode ? styles.dark : ''}`}>
        <h3 className={`${styles.filtersTitle} ${darkMode ? styles.dark : ''}`}>Filtros</h3>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select 
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
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

      <div className={`${styles.productsTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Produtos Cadastrados ({filteredProducts.length} resultados)
        </div>
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th>Nome do Produto</th>
              <th>Status</th>
              <th>Descrição</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[product.status]} ${darkMode ? styles.dark : ''}`}>
                    {getStatusLabel(product.status)}
                  </span>
                </td>
                <td className={styles.description} title={product.description}>
                  {product.description}
                </td>
                <td>{product.createdAt}</td>
                <td>
                  <button 
                    className={`${styles.actionButton} ${darkMode ? styles.dark : ''}`}
                    onClick={() => handleEditProduct(product.id)}
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

export default Products;