export interface Sale {
  id: string;
  date: string;
  companyName: string;
  type: string;
  contactName: string;
  contactMethod: 'presencial' | 'telefone' | 'email' | 'whatsapp';
  stage: 'prospecção' | 'apresentada proposta' | 'negociar' | 'fechar proposta' | 'fechado' | 'pós venda' | 'visita manutenção' | 'renegociar contrato' | 'perdida';
  productType: string;
  comments: string;
  salesPerson: string;
  createdAt?: string;
  updatedAt?: string;
  result: string;
  statusFechado: boolean;
  ultimoContato: string; 
  vendedor: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  contatoWhatsapp?: string;
  contatoPresencial?: string; 
}

export interface SalesFilters {
  stage?: string;
  salesPerson?: string;
  productType?: string;
  type?: string;
  contactMethod?: string;
  startDate?: string;
  endDate?: string;
  statusFechado?: boolean;
  vendedor?: string;
}