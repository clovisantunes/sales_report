// components/EditCustomerModal.tsx
import React from 'react';
import { FiX } from 'react-icons/fi';
import type { Customer } from '../../../../types/Customers';
import styles from '../../styles.module.scss';

interface EditCustomerModalProps {
  show: boolean;
  darkMode: boolean;
  customer: Customer | null;
  submitting: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onCustomerChange: (customer: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  show,
  darkMode,
  customer,
  submitting,
  onClose,
  onSave,
  onCustomerChange
}) => {
  if (!show || !customer) return null;

  return (
    <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
            Editar Cliente
          </h2>
          <button 
            className={`${styles.closeButton} ${darkMode ? styles.dark : ''}`}
            onClick={onClose}
            disabled={submitting}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className={styles.modalForm}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Informações Básicas</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome do Cliente</label>
                <input
                  type="text"
                  id="name"
                  value={customer.name}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                  value={customer.company}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                  value={customer.email}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                  value={customer.phone}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                  value={customer.whatsapp || ''}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                  value={customer.address || ''}
                  onChange={(e) => onCustomerChange({
                    ...customer,
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
                value={customer.notes}
                onChange={(e) => onCustomerChange({
                  ...customer,
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
              onClick={onClose}
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
  );
};

export default EditCustomerModal;