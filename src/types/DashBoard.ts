// types/DashBoard.ts
export interface Metricas {
  totalVendas: number;
  vendasMes: number;
  mediaMensal: number;
  crescimento: number;
}

export interface Venda {
  id: string;
  data: string;
  empresa: string;
  tipo: string;
  nomeContato: string;
  formaContato: string;
  estagio: string;
  tipoProduto: string;
  resultado: string; 
  vendedor: string; 
}

export interface DadosGrafico {
  meses: string[];
  vendas: number[];
}