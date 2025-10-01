import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Sale, SalesFilters } from '../../types/Sales';
import { salesService } from '../../services/SalesService/SalesService';
import { productsService } from '../../services/ProductService/ProductService';
import type { Product } from '../../types/Products';
import styles from './styles.module.scss';
import ExportButton from '../ExportButton';

interface SalesProps {
  darkMode: boolean;
  className?: string;
  currentUser: any;
  users: any[];
}

const Sales: React.FC<SalesProps> = ({ darkMode, className = "", currentUser, users }) => {
  const [filters, setFilters] = useState<SalesFilters>({});
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('pt-BR'),
    company: '',
    type: 'Novo cliente',
    contactName: '',
    contactMethod: 'email' as 'presencial' | 'telefone' | 'email' | 'whatsapp',
    stage: 'prospecção' as 'prospecção' | 'apresentada proposta' | 'negociar' | 'fechar proposta' | 'fechado' | 'pós venda' | 'visita manutenção' | 'renegociar contrato' | 'perdida',
    productType: '',
    comments: '',
    salesPerson: currentUser?.id || '',
    statusFechado: false,
    ultimoContato: new Date().toLocaleDateString('pt-BR'),
    vendedor: currentUser?.id || '',
    contatoTelefone: '',
    contatoEmail: '',
    contatoWhatsapp: '',
    contatoPresencial: ''
  });

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await salesService.getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
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

  const getProductTypeLabel = (productName: string) => {
    const product = products.find(p => p.name === productName);
    
    if (product) {
      return product.name;
    }
    
    const fallbackLabels = {
      'medicina do trabalho': 'Medicina do Trabalho',
      'assistencia medica': 'Assistência Médica', 
    };
    
    return fallbackLabels[productName as keyof typeof fallbackLabels] || productName;
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

  const handleAddSale = () => {
    setEditingSale(null);
    setFormData({
      date: new Date().toLocaleDateString('pt-BR'),
      company: '',
      type: 'Novo cliente',
      contactName: '',
      contactMethod: 'email',
      stage: 'prospecção',
      productType: '',
      comments: '',
      salesPerson: currentUser?.id || '',
      statusFechado: false,
      ultimoContato: new Date().toLocaleDateString('pt-BR'),
      vendedor: currentUser?.id || '',
      contatoTelefone: '',
      contatoEmail: '',
      contatoWhatsapp: '',
      contatoPresencial: ''
    });
    setShowModal(true);
  };

  const handleEditSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      setEditingSale(sale);
      setFormData({
        date: sale.date,
        company: sale.companyName,
        type: sale.type,
        contactName: sale.contactName,
        contactMethod: sale.contactMethod,
        stage: sale.stage,
        productType: sale.productType,
        comments: sale.comments,
        salesPerson: sale.salesPerson,
        statusFechado: sale.statusFechado,
        ultimoContato: sale.ultimoContato,
        vendedor: sale.vendedor,
        contatoTelefone: sale.contatoTelefone || '',
        contatoEmail: sale.contatoEmail || '',
        contatoWhatsapp: sale.contatoWhatsapp || '',
        contatoPresencial: sale.contatoPresencial || ''
      });
      setShowModal(true);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) {
      return;
    }

    try {
      await salesService.deleteSale(saleId);
      await loadSales();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      alert('Erro ao excluir venda. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSale(null);
    setSubmitting(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company || !formData.contactName || !formData.productType) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      const saleData = {
        date: formData.date,
        companyName: formData.company,
        type: formData.type,
        contactName: formData.contactName,
        contactMethod: formData.contactMethod,
        stage: formData.stage,
        productType: formData.productType,
        comments: formData.comments,
        salesPerson: formData.salesPerson,
        result: formData.stage === 'fechado' ? 'Fechado' : (formData.stage === 'perdida' ? 'Perdida' : 'Negociação em andamento'),
        statusFechado: formData.statusFechado,
        ultimoContato: formData.ultimoContato,
        vendedor: formData.vendedor,
        contatoTelefone: formData.contatoTelefone,
        contatoEmail: formData.contatoEmail,
        contatoWhatsapp: formData.contatoWhatsapp,
        contatoPresencial: formData.contatoPresencial
      };

      if (editingSale) {
        await salesService.updateSale(editingSale.id, saleData);
      } else {
        await salesService.addSale(saleData);
      }

      await loadSales();
      handleCloseModal();
      
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    if (filters.stage && sale.stage !== filters.stage) return false;
    if (filters.salesPerson && sale.salesPerson !== filters.salesPerson) return false;
    if (filters.productType && sale.productType !== filters.productType) return false;
    if (filters.type && sale.type !== filters.type) return false;
    if (filters.contactMethod && sale.contactMethod !== filters.contactMethod) return false;
    if (filters.startDate && new Date(sale.date.split('/').reverse().join('-')) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(sale.date.split('/').reverse().join('-')) > new Date(filters.endDate)) return false;
    return true;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'N/A';
  };

  return (
    <div className={`${styles.sales} ${darkMode ? styles.dark : ''} ${className}`}>

<div className={styles.salesHeader}>
  <h1 className={`${styles.salesTitle} ${darkMode ? styles.dark : ''}`}>
    Gerenciamento de Vendas
  </h1>
  <div className={styles.headerActions}>
    <ExportButton
      sales={filteredSales}
      users={users}
      products={products}
      darkMode={darkMode}
      disabled={filteredSales.length === 0}
    />
    <button 
      className={`${styles.addButton} ${darkMode ? styles.dark : ''}`}
      onClick={handleAddSale}
    >
      <FiPlus size={16} />
      Nova Venda
    </button>
  </div>
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
              {products.map(product => (
                <option key={product.id} value={product.name}>{product.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Vendedor</label>
            <select 
              value={filters.salesPerson || ''}
              onChange={(e) => handleFilterChange('salesPerson', e.target.value)}
            >
              <option value="">Todos os vendedores</option>
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

      <div className={`${styles.salesTableContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.tableTitle} ${darkMode ? styles.dark : ''}`}>
          Registro de Vendas ({filteredSales.length} resultados)
        </div>
        
        {loading ? (
          <div className={styles.loadingState}>
            <div>Carregando vendas...</div>
          </div>
        ) : filteredSales.length === 0 ? (
         <div className={styles.emptyState}>
  <div className={styles.emptyStateIcon}>
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9H21M9 21V9M5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5Z" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" 
            stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  </div>
  <h3 className={styles.emptyStateTitle}>Nenhuma venda encontrada</h3>
  <p className={styles.emptyStateDescription}>
    {Object.keys(filters).length > 0 
      ? "Tente ajustar os filtros para ver mais resultados."
      : "Comece adicionando sua primeira venda usando o botão acima."
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.date}</td>
                  <td><strong>{sale.companyName}</strong></td>
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
                  <td>{getUserName(sale.salesPerson)}</td>
                  <td className={styles.comments} title={sale.comments}>
                    {sale.comments}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.actionButton} ${styles.editButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleEditSale(sale.id)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton} ${darkMode ? styles.dark : ''}`}
                        onClick={() => handleDeleteSale(sale.id)}
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
                {editingSale ? 'Editar Venda' : 'Nova Venda'}
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
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Data *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date.split('/').reverse().join('-')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      date: new Date(e.target.value).toLocaleDateString('pt-BR')
                    }))}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="type">Tipo *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="Novo cliente">Novo cliente</option>
                    <option value="Em negociação">Em negociação</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">Nome da Empresa *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
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
                  <label htmlFor="contactMethod">Forma de Contato *</label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="presencial">Presencial</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="stage">Estágio *</label>
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
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

              <div className={styles.formGroup}>
                <label htmlFor="salesPerson">Vendedor *</label>
                <select
                  id="salesPerson"
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleFormChange}
                  required
                  disabled={submitting}
                  className={darkMode ? styles.dark : ''}
                >
                  <option value="">Selecione um vendedor</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="ultimoContato">Último Contato</label>
                  <input
                    type="date"
                    id="ultimoContato"
                    name="ultimoContato"
                    value={formData.ultimoContato.split('/').reverse().join('-')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ultimoContato: new Date(e.target.value).toLocaleDateString('pt-BR')
                    }))}
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="vendedor">Vendedor Responsável</label>
                  <select
                    id="vendedor"
                    name="vendedor"
                    value={formData.vendedor}
                    onChange={handleFormChange}
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  >
                    <option value="">Selecione um vendedor</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contatoTelefone">Telefone</label>
                  <input
                    type="tel"
                    id="contatoTelefone"
                    name="contatoTelefone"
                    value={formData.contatoTelefone}
                    onChange={handleFormChange}
                    placeholder="(00) 00000-0000"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contatoEmail">E-mail</label>
                  <input
                    type="email"
                    id="contatoEmail"
                    name="contatoEmail"
                    value={formData.contatoEmail}
                    onChange={handleFormChange}
                    placeholder="email@empresa.com"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contatoWhatsapp">WhatsApp</label>
                  <input
                    type="text"
                    id="contatoWhatsapp"
                    name="contatoWhatsapp"
                    value={formData.contatoWhatsapp}
                    onChange={handleFormChange}
                    placeholder="(00) 00000-0000"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contatoPresencial">Local Presencial</label>
                  <input
                    type="text"
                    id="contatoPresencial"
                    name="contatoPresencial"
                    value={formData.contatoPresencial}
                    onChange={handleFormChange}
                    placeholder="Endereço ou local de reunião"
                    disabled={submitting}
                    className={darkMode ? styles.dark : ''}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    id="statusFechado"
                    name="statusFechado"
                    checked={formData.statusFechado}
                    onChange={handleFormChange}
                    disabled={submitting}
                  />
                  <span>Status Fechado</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="comments">Comentário</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleFormChange}
                  placeholder="Digite observações sobre a venda..."
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
                  {submitting ? 'Salvando...' : (editingSale ? 'Salvar Alterações' : 'Criar Venda')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;