import React from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiMessageSquare, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import type { Sale } from '../../types/Sales';
import styles from './styles.module.scss';

interface SaleDetailsModalProps {
  sale: Sale;
  darkMode: boolean;
  onClose: () => void;
  getUserName: (userId: string, sale?: Sale) => string;
  getContactMethodLabel: (method: string) => string;
  getProductTypeLabel: (productName: string) => string;
  getStageLabel: (stage: string) => string;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  sale,
  darkMode,
  onClose,
  getUserName,
  getContactMethodLabel,
  getProductTypeLabel,
  getStageLabel
}) => {
  return (
    <div className={`${styles.detailsModal} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.modalHeader}>
        <h3 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
          <FiTrendingUp size={20} />
          Detalhes da Visita
        </h3>
        <button
          className={`${styles.closeButton} ${darkMode ? styles.dark : ''}`}
          onClick={onClose}
          aria-label="Fechar detalhes"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className={styles.modalContent}>
        <div className={styles.section}>
          <h4 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
            Informações da Empresa
          </h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Empresa:</span>
              <span className={styles.value}>{sale.companyName}</span>
            </div>
            {sale.cnpj ? (
              <div className={styles.detailItem}>
                <span className={styles.label}>CNPJ:</span>
                <span className={styles.value}>{sale.cnpj}</span>
              </div>
            ) : (
              <div className={styles.detailItem}>
               <span className={styles.label}>CNPJ:</span>
               <span className={styles.value}>Não informado</span>
              </div>
            )}
            {sale.lifes && sale.lifes > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Número de Vidas:</span>
                <span className={styles.value}>{sale.lifes}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.label}>Data:</span>
              <span className={styles.value}>
                <FiCalendar size={14} />
                {sale.date}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
            Informações de Contato
          </h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Contato:</span>
              <span className={styles.value}>
                <FiUser size={14} />
                {sale.contactName}
              </span>
            </div>
            
            {sale.contatoEmail && (
              <div className={styles.detailItem}>
                <span className={styles.label}>E-mail:</span>
                <span className={styles.value}>
                  <FiMail size={14} />
                  {sale.contatoEmail}
                </span>
              </div>
            )}
            
            {sale.contatoWhatsapp && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Telefone/WhatsApp:</span>
                <span className={styles.value}>
                  <FiPhone size={14} />
                  {sale.contatoWhatsapp}
                </span>
              </div>
            )}
            
            {sale.contatoPresencial && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Endereço:</span>
                <span className={styles.value}>
                  <FiMapPin size={14} />
                  {sale.contatoPresencial}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
            Detalhes da Visita
          </h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Vendedor:</span>
              <span className={styles.value}>{getUserName(sale.salesPerson, sale)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Primeiro Contato:</span>
              <span className={styles.value}>{getContactMethodLabel(sale.contactMethod || 'email')}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Produto:</span>
              <span className={styles.value}>{getProductTypeLabel(sale.productType)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Estágio:</span>
              <span className={`${styles.value} ${styles.stage}`}>
                {getStageLabel(sale.stage)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Resultado:</span>
              <span className={`${styles.value} ${styles.result} ${sale.stage === 'finalizado' ? styles.success : sale.stage === 'perdida' ? styles.error : styles.warning}`}>
                {sale.stage === 'finalizado' ? 'Fechado' : sale.stage === 'perdida' ? 'Perdida' : 'Em andamento'}
              </span>
            </div>
          </div>
        </div>

        {sale.comments && (
          <div className={styles.section}>
            <h4 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
              <FiMessageSquare size={16} />
              Comentários
            </h4>
            <div className={styles.comments}>
              {sale.comments}
            </div>
          </div>
        )}

        <div className={styles.modalActions}>
          <button
            className={`${styles.closeActionButton} ${darkMode ? styles.dark : ''}`}
            onClick={onClose}
          >
            <FiX size={16} />
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;