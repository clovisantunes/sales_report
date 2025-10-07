import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiTrash2, FiCalendar, FiMail, FiPhone } from 'react-icons/fi';
import type { Prospection, ProspectionsFilters } from '../../types/Prospections';
import { prospectionsService } from '../../services/ProspectionsService/ProspectionsService.ts';
import { productsService } from '../../services/ProductService/ProductService';
import type { Product } from '../../types/Products';
import styles from './styles.module.scss';

interface ProspectionsProps {
  darkMode: boolean;
  className?: string;
  currentUser: any;
  users: any[];
}

const Prospections: React.FC<ProspectionsProps> = ({ darkMode, className = "", currentUser, users = [] }) => {
  const [filters, setFilters] = useState<ProspectionsFilters>({});
  const [prospections, setProspections] = useState<Prospection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProspection, setEditingProspection] = useState<Prospection | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    productType: '',
    expectedContactDate: new Date().toISOString().split('T')[0],
    priority: 'media' as 'baixa' | 'media' | 'alta',
    status: 'pendente' as 'pendente' | 'contatado' | 'agendado' | 'cancelado',
    notes: '',
    assignedTo: currentUser?.id || ''
  });

  useEffect(() => {
    loadProspections();
    loadProducts();
  }, []);

  const loadProspections = async () => {
    try {
      setLoading(true);
      const prospectionsData = await prospectionsService.getProspections();
      const sortedProspections = prospectionsData.sort((a, b) => {
        const dateA = new Date(a.expectedContactDate.split('/').reverse().join('-'));
        const dateB = new Date(b.expectedContactDate.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      setProspections(sortedProspections);
    } catch (error) {
      console.error('Erro ao carregar prospecções:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await productsService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pendente': 'Pendente',
      'contatado': 'Contatado',
      'agendado': 'Agendado',
      'cancelado': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getProductTypeLabel = (productName: string) => {
    const product = products.find(p => p.name === productName);
    return product ? product.name : productName;
  };

  const getPriorityClass = (priority: string) => {
    return styles[`priority-${priority}`];
  };

  const getStatusClass = (status: string) => {
    return styles[`status-${status}`];
  };

  const handleFilterChange = (key: keyof ProspectionsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleAddProspection = () => {
    setEditingProspection(null);
    setFormData({
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      productType: '',
      expectedContactDate: new Date().toISOString().split('T')[0],
      priority: 'media',
      status: 'pendente',
      notes: '',
      assignedTo: currentUser?.id || ''
    });
    setShowModal(true);
  };

  const handleEditProspection = (prospectionId: string) => {
    const prospection = prospections.find(p => p.id === prospectionId);
    if (prospection) {
      setEditingProspection(prospection);
      setFormData({
        companyName: prospection.companyName,
        contactName: prospection.contactName,
        contactEmail: prospection.contactEmail || '',
        contactPhone: prospection.contactPhone || '',
        productType: prospection.productType,
        expectedContactDate: prospection.expectedContactDate.split('/').reverse().join('-'),
        priority: prospection.priority,
        status: prospection.status,
        notes: prospection.notes || '',
        assignedTo: prospection.assignedTo
      });
      setShowModal(true);
    }
  };

  const handleDeleteProspection = async (prospectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prospecção?')) {
      return;
    }

    try {
      await prospectionsService.deleteProspection(prospectionId);
      await loadProspections();
    } catch (error) {
      console.error('Erro ao excluir prospecção:', error);
      alert('Erro ao excluir prospecção. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProspection(null);
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

    if (!formData.companyName || !formData.contactName || !formData.productType || !formData.expectedContactDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      const prospectionData = {
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        productType: formData.productType,
        expectedContactDate: formData.expectedContactDate.split('-').reverse().join('/'),
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes,
        assignedTo: formData.assignedTo
      };

      if (editingProspection) {
        await prospectionsService.updateProspection(editingProspection.id, prospectionData);
      } else {
        await prospectionsService.addProspection(prospectionData);
      }

      await loadProspections();
      handleCloseModal();

    } catch (error) {
      console.error('Erro ao salvar prospecção:', error);
      alert('Erro ao salvar prospecção. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProspections = prospections.filter(prospection => {
    if (filters.status && prospection.status !== filters.status) return false;
    if (filters.priority && prospection.priority !== filters.priority) return false;
    if (filters.assignedTo && prospection.assignedTo !== filters.assignedTo) return false;
    if (filters.productType && prospection.productType !== filters.productType) return false;
    if (filters.startDate && new Date(prospection.expectedContactDate.split('/').reverse().join('-')) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(prospection.expectedContactDate.split('/').reverse().join('-')) > new Date(filters.endDate)) return false;
    return true;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} ${user.lastName}` : userId;
  };

  return (
    <div className={`${styles.prospections} ${darkMode ? styles.dark : ''} ${className}`}>

      <div className={styles.prospectionsHeader}>
        <h1 className={`${styles.prospectionsTitle} ${darkMode ? styles.dark : ''}`}>
          Prospecções Futuras
        </h1>
        <button
          className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}
          onClick={handleAddProspection}
        >
          <FiPlus size={16} />
          Nova Prospecção
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
              <option value="pendente">Pendente</option>
              <option value="contatado">Contatado</option>
              <option value="agendado">Agendado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Prioridade</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Todas as prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Tipo de Produto</label>
            <select
              value={filters.productType || ''}
              onChange={(e) => handleFilterChange('productType', e.target.value)}
            >
              <option value="">Todos os produtos</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>{product.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Responsável</label>
            <select
              value={filters.assignedTo || ''}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            >
              <option value="">Todos os responsáveis</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
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
          <button className={`${styles.clearButton} ${darkMode ? styles.dark : ''}`} onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className={`${styles.prospectionsTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Prospecções ({filteredProspections.length} resultados)
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div>Carregando Prospecções...</div>
          </div>
        ) : filteredProspections.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <FiCalendar size={80} />
            </div>
            <h3 className={styles.emptyStateTitle}>Nenhuma prospecção encontrada</h3>
            <p className={styles.emptyStateDescription}>
              {Object.keys(filters).length > 0
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Comece adicionando sua primeira prospecção usando o botão acima."
              }
            </p>
            {Object.keys(filters).length > 0 && (
              <button
                className={`${styles.emptyStateButton} ${darkMode ? styles.dark : ''}`}
                onClick={clearFilters}
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <table className={styles.prospectionsTable}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Produto</th>
                <th>Data Prevista</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProspections.map((prospection) => (
                <tr key={prospection.id}>
                  <td><strong>{prospection.companyName}</strong></td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{prospection.contactName}</div>
                      {prospection.contactEmail && (
                        <div className={styles.contactDetail}>
                          <FiMail size={12} />
                          {prospection.contactEmail}
                        </div>
                      )}
                      {prospection.contactPhone && (
                        <div className={styles.contactDetail}>
                          <FiPhone size={12} />
                          {prospection.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getProductTypeLabel(prospection.productType)}</td>
                  <td>{prospection.expectedContactDate}</td>
                  <td>
                    <span className={`${styles.priority} ${getPriorityClass(prospection.priority)}`}>
                      {getPriorityLabel(prospection.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(prospection.status)}`}>
                      {getStatusLabel(prospection.status)}
                    </span>
                  </td>
                  <td>{getUserName(prospection.assignedTo)}</td>
                  <td className={styles.notes} title={prospection.notes}>
                    {prospection.notes}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleEditProspection(prospection.id)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleDeleteProspection(prospection.id)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
          <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
            <div className={styles.modalHeader}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
                {editingProspection ? 'Editar Prospecção' : 'Nova Prospecção'}
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
                <label htmlFor="companyName">Nome da Empresa *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleFormChange}
                  placeholder="Digite o nome da empresa"
                  required
                  disabled={submitting}
                  className={darkMode ? styles.dark : ''}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactName">Nome do Contato *</label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleFormChange}
                    placeholder="Digite o nome do contato"
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="productType">Tipo de Produto *</label>
                  <select
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.name}>{product.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactEmail">E-mail</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleFormChange}
                    placeholder="email@empresa.com"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactPhone">Telefone</label>
                  <input
                    type="text"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleFormChange}
                    placeholder="(00) 00000-0000"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="expectedContactDate">Data Prevista de Contato *</label>
                  <input
                    type="date"
                    id="expectedContactDate"
                    name="expectedContactDate"
                    value={formData.expectedContactDate}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="priority">Prioridade *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="contatado">Contatado</option>
                    <option value="agendado">Agendado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="assignedTo">Responsável</label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleFormChange}
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="">Selecione um responsável</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">Observações</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Digite observações sobre a prospecção..."
                  rows={3}
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
                  {submitting ? 'Salvando...' : (editingProspection ? 'Salvar Alterações' : 'Criar Prospecção')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prospections;