export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
}

export interface ProductFilters {
  status?: string;
}