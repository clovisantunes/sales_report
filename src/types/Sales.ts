export interface Sale {
  id: string;
  date: string;
  company: string;
  type: string;
  contactName: string;
  contactMethod: string;
  stage: string;
  productType: string;
  amount: number;
  comments: string;
  salesPerson: string;
}
export interface SalesFilters {
  stage?: string;
  salesPerson?: string;
  productType?: string;
  contactMethod?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}