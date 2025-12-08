import { useState } from 'react';
import type { Customer } from '../../../types/Customers';

export const useCustomerEdit = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingCustomer(null);
    setSubmitting(false);
  };

  const handleSaveCustomer = async (
    e: React.FormEvent,
    editingCustomer: Customer | null,
    onSave: () => Promise<void>
  ) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSubmitting(true);
    try {
      await onSave();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    showEditModal,
    editingCustomer,
    submitting,
    handleEditCustomer,
    handleCloseModal,
    handleSaveCustomer,
    setEditingCustomer
  };
};