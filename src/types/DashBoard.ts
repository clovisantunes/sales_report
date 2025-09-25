export interface Venda {
  id: string;
  data: string;
  empresa: string;
  tipo: string;
  nomeContato: string;
  formaContato: string;
  estagio: string;
  tipoProduto: string;
  resultado: number;
  comentario: string;
}

export interface Metricas {
  totalVendas: number;
  vendasMes: number;
  mediaMensal: number;
  crescimento: number;
}