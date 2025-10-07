export interface Prospection {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  productType: string;
  expectedContactDate: string;
  priority: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'contatado' | 'agendado' | 'cancelado';
  notes?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectionsFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  productType?: string;
  startDate?: string;
  endDate?: string;
}