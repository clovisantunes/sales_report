// services/DashboardService/DashboardService.ts
import type { Venda, Metricas, DadosGrafico } from '../../types/DashBoard';
import { salesService } from '../SalesService/SalesService';
import { userService } from '../userService/userService'; // Importar o serviço de usuários

export const dashboardService = {
  async getMetricas(): Promise<Metricas> {
    try {
      const todasVendas = await salesService.getSales();
      
      // Filtrar apenas vendas FECHADAS (considera vendas reais)
      const vendasFechadas = todasVendas.filter(venda => 
        venda.stage === 'fechado'
      );

      console.log('📊 Total de vendas:', todasVendas.length);
      console.log('✅ Vendas fechadas:', vendasFechadas.length);
      console.log('❌ Vendas em prospecção/negociação:', todasVendas.length - vendasFechadas.length);

      // Vendas do mês atual (fechadas)
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth();
      const anoAtual = dataAtual.getFullYear();
      
      const vendasMesAtual = vendasFechadas.filter(venda => {
        try {
          const dataVenda = new Date(venda.date.split('/').reverse().join('-'));
          return dataVenda.getMonth() === mesAtual && 
                 dataVenda.getFullYear() === anoAtual;
        } catch {
          return false;
        }
      });

      // Vendas do mês anterior (fechadas)
      const vendasMesAnterior = vendasFechadas.filter(venda => {
        try {
          const dataVenda = new Date(venda.date.split('/').reverse().join('-'));
          const mesVenda = dataVenda.getMonth();
          const anoVenda = dataVenda.getFullYear();
          
          let mesAnterior = mesAtual - 1;
          let anoAnterior = anoAtual;
          if (mesAnterior < 0) {
            mesAnterior = 11;
            anoAnterior = anoAtual - 1;
          }
          
          return mesVenda === mesAnterior && anoVenda === anoAnterior;
        } catch {
          return false;
        }
      });

      // Calcular crescimento
      const crescimento = vendasMesAnterior.length > 0 
        ? ((vendasMesAtual.length - vendasMesAnterior.length) / vendasMesAnterior.length) * 100
        : vendasMesAtual.length > 0 ? 100 : 0;

      // Calcular média mensal (últimos 6 meses)
      const ultimos6Meses = this.getUltimos6Meses();
      const vendasUltimos6Meses = vendasFechadas.filter(venda => {
        try {
          const dataVenda = new Date(venda.date.split('/').reverse().join('-'));
          const mesVenda = dataVenda.getMonth() + 1;
          const anoVenda = dataVenda.getFullYear();
          const mesAnoVenda = `${mesVenda}/${anoVenda}`;
          return ultimos6Meses.includes(mesAnoVenda);
        } catch {
          return false;
        }
      });

      const mediaMensal = Math.round(vendasUltimos6Meses.length / 6);

      return {
        totalVendas: vendasFechadas.length, // Apenas vendas fechadas
        vendasMes: vendasMesAtual.length,   // Apenas vendas fechadas do mês
        mediaMensal: mediaMensal,           // Média de vendas fechadas
        crescimento: Math.round(crescimento * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      return {
        totalVendas: 0,
        vendasMes: 0,
        mediaMensal: 0,
        crescimento: 0
      };
    }
  },

  async getVendasRecentes(): Promise<Venda[]> {
    try {
      const todasVendas = await salesService.getSales();
      
      const todosUsuarios = await userService.getAllUsers();
      console.log('👥 [DASHBOARD] Usuários carregados:', todosUsuarios.length);
      
      const vendasOrdenadas = todasVendas
        .sort((a, b) => {
          try {
            const dataA = new Date(a.date.split('/').reverse().join('-'));
            const dataB = new Date(b.date.split('/').reverse().join('-'));
            return dataB.getTime() - dataA.getTime();
          } catch {
            return 0;
          }
        })
        .slice(0, 10);

      return vendasOrdenadas.map(venda => {
        const vendedor = todosUsuarios.find(u => u.id === venda.salesPerson);
        const nomeVendedor = vendedor ? `${vendedor.name} ${vendedor.lastName}` : venda.salesPerson;
        
        console.log(`👤 [DASHBOARD] Venda ${venda.id}: Vendedor ${venda.salesPerson} -> ${nomeVendedor}`);
        
        return {
          id: venda.id,
          data: venda.date,
          empresa: venda.companyName,
          tipo: venda.type,
          nomeContato: venda.contactName,
          formaContato: venda.contactMethod,
          estagio: venda.stage,
          tipoProduto: venda.productType,
          resultado: this.getResultadoLabel(venda.stage),
          vendedor: nomeVendedor,
          vendedorId: venda.salesPerson 
        };
      });
    } catch (error) {
      console.error('Erro ao buscar vendas recentes:', error);
      return [];
    }
  },

  async getDadosGrafico(): Promise<DadosGrafico> {
    try {
      const todasVendas = await salesService.getSales();
      const ultimos6Meses = this.getUltimos6Meses();
      
      const vendasFechadas = todasVendas.filter(venda => 
        venda.stage === 'fechado'
      );

      const vendasPorMes = ultimos6Meses.map(mes => {
        const [mesStr, anoStr] = mes.split('/');
        const mesNum = parseInt(mesStr) - 1;
        const anoNum = parseInt(anoStr);

        const vendasNoMes = vendasFechadas.filter(venda => {
          try {
            const dataVenda = new Date(venda.date.split('/').reverse().join('-'));
            return dataVenda.getMonth() === mesNum && 
                   dataVenda.getFullYear() === anoNum;
          } catch {
            return false;
          }
        });

        return vendasNoMes.length;
      });

      return {
        meses: ultimos6Meses.map(mes => {
          const [mesNum, ano] = mes.split('/');
          const nomesMeses = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
          ];
          return `${nomesMeses[parseInt(mesNum) - 1]}/${ano}`;
        }),
        vendas: vendasPorMes
      };
    } catch (error) {
      console.error('Erro ao gerar dados do gráfico:', error);
      return { meses: [], vendas: [] };
    }
  },

  async getEstatisticasVendedores(): Promise<any> {
    try {
      const todasVendas = await salesService.getSales();
      const todosUsuarios = await userService.getAllUsers();
      
      const vendasFechadas = todasVendas.filter(venda => venda.stage === 'fechado');
      
      const vendasPorVendedor = vendasFechadas.reduce((acc, venda) => {
        const vendedorId = venda.salesPerson;
        if (!acc[vendedorId]) {
          acc[vendedorId] = [];
        }
        acc[vendedorId].push(venda);
        return acc;
      }, {} as Record<string, any[]>);

      const estatisticas = Object.entries(vendasPorVendedor).map(([vendedorId, vendas]) => {
        const usuario = todosUsuarios.find(u => u.id === vendedorId);
        const nomeVendedor = usuario ? `${usuario.name} ${usuario.lastName}` : `Vendedor ${vendedorId}`;
        
        const dataAtual = new Date();
        const vendasEsteMes = vendas.filter(venda => {
          try {
            const dataVenda = new Date(venda.date.split('/').reverse().join('-'));
            return dataVenda.getMonth() === dataAtual.getMonth() && 
                   dataVenda.getFullYear() === dataAtual.getFullYear();
          } catch {
            return false;
          }
        });

        return {
          vendedorId,
          nomeVendedor,
          totalVendas: vendas.length,
          vendasEsteMes: vendasEsteMes.length,
          email: usuario?.email || 'N/A'
        };
      });

      return estatisticas.sort((a, b) => b.totalVendas - a.totalVendas);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de vendedores:', error);
      return [];
    }
  },

  getUltimos6Meses(): string[] {
    const meses = [];
    const dataAtual = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      meses.push(`${mes}/${ano}`);
    }
    
    return meses;
  },

  getResultadoLabel(estagio: string): string {
    const resultados = {
      'fechado': 'Fechado',
      'perdida': 'Perdida',
      'prospecção': 'Em prospecção',
      'negociar': 'Em negociação',
      'apresentada proposta': 'Proposta apresentada',
      'fechar proposta': 'Fechando proposta',
      'pós venda': 'Pós-venda',
      'visita manutenção': 'Visita manutenção',
      'renegociar contrato': 'Renegociar contrato'
    };
    
    return resultados[estagio as keyof typeof resultados] || estagio;
  }
};