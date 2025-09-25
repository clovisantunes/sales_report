export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  salesStatus: string;
  lastContact: string;
  totalSales: number;
  salesPerson: string;
  notes: string;
}

export interface CustomerFilters {
  status?: string;
  salesPerson?: string;
  salesStatus?: string;
}