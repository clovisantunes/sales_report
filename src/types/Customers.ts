export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  salesStatus: string;
  lastContact: string;
  salesPerson: string;
  notes: string;
  whatsapp?: string;
  address?: string;
  contactMethod?: 'presencial' | 'telefone' | 'email' | 'whatsapp';
}

export interface CustomerFilters {
  status?: string;
  salesPerson?: string;
  salesStatus?: string;
  contactMethod?: string;
}