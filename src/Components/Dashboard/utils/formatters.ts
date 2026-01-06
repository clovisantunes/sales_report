export const formatarNumero = (numero: number): string => {
  return new Intl.NumberFormat('pt-BR').format(numero);
};

export const getEstagioLabel = (estagio: string): string => {
  const labels = {
    'prospecção': 'Prospecção',
    'apresentada proposta': 'Proposta Apresentada',
    'negociar': 'Em Negociação',
    'fechar proposta': 'Fechar Proposta',
    'fechado': 'Finalizado', 
    'pós venda': 'Pós Venda',
    'visita manutenção': 'Visita Manutenção',
    'renegociar contrato': 'Renegociar Contrato',
    'perdida': 'Perdida'
  };
  return labels[estagio as keyof typeof labels] || estagio;
};

export const getVendedorName = (vendedorId: string, users: any[] = []): string => {
  if (!users || users.length === 0) return vendedorId;
  const user = users.find(u => u.id === vendedorId);
  return user ? `${user.name} ${user.lastName}` : vendedorId;
};