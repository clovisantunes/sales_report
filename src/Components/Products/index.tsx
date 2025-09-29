import React, { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiTrash2 } from 'react-icons/fi';
import type { Product, ProductFilters } from '../../types/Products';
import { productsService } from '../../services/ProductService/ProductService';
import styles from './styles.module.scss';

interface ProductsProps {
  darkMode: boolean;
  className?: string;
}

const Products: React.FC<ProductsProps> = ({ darkMode, className = "" }) => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Carregar produtos do Firebase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const productsData = await productsService.getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        status: product.status,
        description: product.description
      });
      setShowModal(true);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      status: 'active',
      description: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      status: 'active',
      description: ''
    });
    setSubmitting(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      if (editingProduct) {
        // Editar produto existente
        await productsService.updateProduct(editingProduct.id, {
          name: formData.name,
          status: formData.status,
          description: formData.description
        });
      } else {
        // Adicionar novo produto
        await productsService.addProduct({
          name: formData.name,
          category: 'Geral',
          price: 0,
          status: formData.status,
          description: formData.description
        });
      }

      // Recarregar a lista de produtos
      await loadProducts();
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await productsService.deleteProduct(productId);
      await loadProducts(); // Recarregar a lista
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto. Tente novamente.');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filters.status && product.status !== filters.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`${styles.products} ${darkMode ? styles.dark : ''} ${className}`}>
        <div className={styles.loadingState}>
          <div>Carregando produtos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.products} ${darkMode ? styles.dark : ''} ${className}`}>
      <div className={styles.productsHeader}>
        <h1 className={`${styles.productsTitle} ${darkMode ? styles.dark : ''}`}>
          Lista de Produtos
        </h1>
        <button 
          className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}
          onClick={handleAddProduct}
        >
          + Novo Produto
        </button>
      </div>

      {error && (
        <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
          {error}
          <button onClick={loadProducts} className={styles.retryButton}>
            Tentar Novamente
          </button>
        </div>
      )}

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
          <button className={`${styles.clearButton} ${darkMode ? styles.dark : ''}`} onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className={`${styles.productsTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Produtos Cadastrados ({filteredProducts.length} resultados)
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum produto encontrado.</p>
            <button 
              className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}
              onClick={handleAddProduct}
            >
              + Adicionar Primeiro Produto
            </button>
          </div>
        ) : (
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
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <FiEdit2 size={14} />
                        Editar
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <FiTrash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Adicionar/Editar Produto */}
      {showModal && (
        <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
            <div className={styles.modalHeader}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button 
                className={`${styles.closeButton} ${darkMode ? styles.dark : ''}`}
                onClick={handleCloseModal}
                disabled={submitting}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome do Produto *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Digite o nome do produto"
                  required
                  disabled={submitting}
                  className={darkMode ? styles.dark : ''}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  disabled={submitting}
                  className={darkMode ? styles.dark : ''}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Descrição *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Digite uma breve descrição do produto"
                  rows={3}
                  required
                  disabled={submitting}
                  className={darkMode ? styles.dark : ''}
                />
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
                  {submitting ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Criar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;