// services/DashboardService/DashboardService.ts
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import type { Sale } from '../../types/Sales';
import type { Venda, Metricas, DadosGrafico } from '../../types/DashBoard';

export const dashboardService = {
  async getMetricas(): Promise<Metricas> {
    try {
      console.log('📊 Buscando métricas do dashboard...');
      
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const salesSnapshot = await getDocs(q);
      
      const sales = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || '',
          companyName: data.companyName || '',
          type: data.type || '',
          contactName: data.contactName || '',
          contactMethod: data.contactMethod || 'email',
          stage: data.stage || 'prospecção',
          productType: data.productType || '',
          salesPerson: data.salesPerson || '',
          vendedor: data.vendedor || '',
          createdAt: data.createdAt?.toDate?.() || new Date()
        } as Sale;
      });

      // Calcular métricas
      const totalVendas = sales.length;
      
      // Vendas do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const vendasMes = sales.filter(sale => {
        const dataVenda = this.parseDateString(sale.date);
        return dataVenda >= primeiroDiaMes;
      }).length;

      // Média mensal (últimos 6 meses)
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      
      const vendasUltimos6Meses = sales.filter(sale => {
        const dataVenda = this.parseDateString(sale.date);
        return dataVenda >= seisMesesAtras;
      });
      
      const mediaMensal = vendasUltimos6Meses.length > 0 ? 
        Math.round(vendasUltimos6Meses.length / 6) : 0;

      // Crescimento vs mês anterior
      const primeiroDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      
      const vendasMesAnterior = sales.filter(sale => {
        const dataVenda = this.parseDateString(sale.date);
        return dataVenda >= primeiroDiaMesAnterior && dataVenda <= ultimoDiaMesAnterior;
      }).length;

      const crescimento = vendasMesAnterior > 0 ? 
        ((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100 : 0;

      const metricas: Metricas = {
        totalVendas,
        vendasMes,
        mediaMensal,
        crescimento: Math.round(crescimento * 10) / 10
      };

      console.log('✅ Métricas calculadas:', metricas);
      return metricas;

    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      throw error;
    }
  },

  async getDadosGrafico(): Promise<DadosGrafico> {
    try {
      console.log('📈 Buscando dados para gráfico...');
      
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const salesSnapshot = await getDocs(q);
      
      const sales = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || '',
          stage: data.stage || 'prospecção',
          createdAt: data.createdAt?.toDate?.() || new Date()
        } as Sale;
      });

      // Agrupar vendas por mês (últimos 6 meses)
      const meses = [];
      const vendasPorMes = [];
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
        const ano = data.getFullYear();
        const mesAno = `${mes}/${ano}`;
        
        const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);
        
        const vendasMes = sales.filter(sale => {
          const dataVenda = this.parseDateString(sale.date);
          return dataVenda >= primeiroDia && dataVenda <= ultimoDia;
        }).length;
        
        meses.push(mesAno);
        vendasPorMes.push(vendasMes);
      }

      const dadosGrafico: DadosGrafico = {
        meses,
        vendas: vendasPorMes
      };

      console.log('✅ Dados do gráfico:', dadosGrafico);
      return dadosGrafico;

    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico:', error);
      throw error;
    }
  },

  async getVendasRecentes(): Promise<Venda[]> {
    try {
      console.log('📋 Buscando vendas recentes...');
      
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const salesSnapshot = await getDocs(q);
      
      const sales = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || '',
          companyName: data.companyName || '',
          type: data.type || '',
          contactName: data.contactName || '',
          contactMethod: data.contactMethod || 'email',
          stage: data.stage || 'prospecção',
          productType: data.productType || '',
          salesPerson: data.salesPerson || '',
          vendedor: data.vendedor || '',
          result: data.result || '',
          createdAt: data.createdAt?.toDate?.().toLocaleDateString('pt-BR') || ''
        } as Sale;
      });

      // Converter para o formato Venda com APENAS as colunas especificadas
      const vendas: Venda[] = sales.slice(0, 10).map(sale => ({
        id: sale.id,
        data: sale.date,
        empresa: sale.companyName,
        tipo: sale.type,
        nomeContato: sale.contactName,
        formaContato: this.getFormaContatoLabel(sale.contactMethod),
        estagio: this.mapEstagio(sale.stage),
        tipoProduto: sale.productType,
        resultado: sale.result,
        vendedor: sale.vendedor || sale.salesPerson
      }));

      console.log('✅ Vendas recentes:', vendas.length);
      return vendas;

    } catch (error) {
      console.error('❌ Erro ao buscar vendas recentes:', error);
      throw error;
    }
  },

  // Métodos auxiliares
  parseDateString(dateString: string): Date {
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day));
    } catch (error) {
      console.warn('Erro ao converter data:', dateString);
      return new Date();
    }
  },

  getFormaContatoLabel(contactMethod: string): string {
    const labels = {
      'presencial': 'Presencial',
      'telefone': 'Telefone',
      'email': 'Email',
      'whatsapp': 'WhatsApp'
    };
    return labels[contactMethod as keyof typeof labels] || contactMethod;
  },

  mapEstagio(stage: string): string {
    const mapping = {
      'prospecção': 'prospect',
      'apresentada proposta': 'negociacao',
      'negociar': 'negociacao',
      'fechar proposta': 'negociacao',
      'fechado': 'fechado',
      'pós venda': 'fechado',
      'visita manutenção': 'fechado',
      'renegociar contrato': 'negociacao',
      'perdida': 'perdido'
    };
    return mapping[stage as keyof typeof mapping] || 'prospect';
  }
};