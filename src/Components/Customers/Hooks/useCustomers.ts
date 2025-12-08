import { useState, useEffect } from 'react';
import type { Customer, CustomerFilters } from '../../../types/Customers';
import { customerService } from '../../../services/Customers/Customers';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const customersData = await customerService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Tente novamente.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (filters: CustomerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filteredData = await customerService.getCustomersWithFilters(filters);
      setCustomers(filteredData);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      setError('Erro ao aplicar filtros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    loadCustomers,
    applyFilters,
    setCustomers
  };
};