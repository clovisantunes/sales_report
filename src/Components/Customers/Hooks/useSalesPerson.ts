import { useCallback } from 'react';

export const useSalesPerson = (users: any[] = []) => {
  const getSalesPersonName = useCallback((salesPersonId: string) => {
    if (!users || users.length === 0) return salesPersonId;
    
    const user = users.find(u => u.id === salesPersonId);
    if (!user) return salesPersonId;
    
    const nomeCompleto = `${user.name || ''} ${user.lastName || ''}`.trim();
    if (nomeCompleto) return nomeCompleto;
    
    const nomeAlternativo = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (nomeAlternativo) return nomeAlternativo;
    
    return user.email || salesPersonId;
  }, [users]);

  return { getSalesPersonName };
};