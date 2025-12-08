import { useState, useMemo } from 'react';
import type { Customer, CustomerFilters } from '../../../types/Customers';

export const useCustomerFilters = (customers: Customer[]) => {
  const [filters, setFilters] = useState<CustomerFilters>({});

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (!customer) return false;
      
      if (filters.status && customer.status !== filters.status) return false;
      if (filters.salesPerson && customer.salesPerson !== filters.salesPerson) return false;
      if (filters.salesStatus && customer.salesStatus !== filters.salesStatus) return false;
      if (filters.contactMethod && customer.contactMethod !== filters.contactMethod) return false;
      
      return true;
    });
  }, [customers, filters]);

  const counts = useMemo(() => ({
    active: filteredCustomers.filter(c => c.status === 'active').length,
    pending: filteredCustomers.filter(c => c.status === 'pending').length,
    inactive: filteredCustomers.filter(c => c.status === 'inactive').length,
  }), [filteredCustomers]);

  return {
    filters,
    filteredCustomers,
    counts,
    handleFilterChange,
    clearFilters,
    setFilters
  };
};