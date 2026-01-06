import type { Sale } from '../../../types/Sales';

export interface Metricas {
  totalVendas: number;
  vendasMes: number;
  mediaMensal: number;
  crescimento: number;
}

export interface DadosGrafico {
  meses: string[];
  vendas: number[];
}

export const calcularMetricas = (sales: Sale[]): Metricas => {
  console.log('🔍 Calculando métricas para', sales.length, 'vendas');
  
  const vendasFechadas = sales.filter(sale => {
    return sale.stage === 'finalizado';
  });

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  const vendasMesAtual = vendasFechadas.filter(sale => {
    try {
      const [ _, mes, ano] = sale.date.split('/').map(Number);
      return mes === mesAtual && ano === anoAtual;
    } catch (error) {
      console.error('Erro ao processar data:', sale.date);
      return false;
    }
  }).length;

  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }

  const vendasMesAnterior = vendasFechadas.filter(sale => {
    try {
      const [ _, mes, ano] = sale.date.split('/').map(Number);
      return mes === mesAnterior && ano === anoAnterior;
    } catch {
      return false;
    }
  }).length;

  const crescimento = vendasMesAnterior > 0 
    ? ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100 
    : vendasMesAtual > 0 ? 100 : 0;

  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return { mes: date.getMonth() + 1, ano: date.getFullYear() };
  });

  const vendasUltimos6Meses = ultimos6Meses.map(({ mes, ano }) => {
    const count = vendasFechadas.filter(sale => {
      try {
        const [ _, saleMes, saleAno] = sale.date.split('/').map(Number);
        return saleMes === mes && saleAno === ano;
      } catch {
        return false;
      }
    }).length;
    return count;
  });

  const totalVendasUltimos6Meses = vendasUltimos6Meses.reduce((a, b) => a + b, 0);
  const mediaMensal = totalVendasUltimos6Meses / 6;

  return {
    totalVendas: vendasFechadas.length,
    vendasMes: vendasMesAtual,
    mediaMensal: Math.round(mediaMensal * 10) / 10,
    crescimento: Math.round(crescimento * 10) / 10
  };
};

export const calcularDadosGrafico = (sales: Sale[]): DadosGrafico => {
  const meses: string[] = [];
  const vendasPorMes: number[] = [];
        
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const mes = date.toLocaleDateString('pt-BR', { month: 'short' });
    const ano = date.getFullYear();
    const mesNumero = date.getMonth() + 1;
    const anoCurto = ano.toString().slice(2);
    
    meses.push(`${mes}/${anoCurto}`);
    
    const vendasNoMes = sales.filter(sale => {
      if (sale.stage !== 'finalizado') return false;
      
      try {
        const [ _, saleMes, saleAno] = sale.date.split('/').map(Number);
        return saleMes === mesNumero && saleAno === ano;
      } catch {
        return false;
      }
    }).length;
    
    vendasPorMes.push(vendasNoMes);
  }
  
  return {
    meses,
    vendas: vendasPorMes
  };
};