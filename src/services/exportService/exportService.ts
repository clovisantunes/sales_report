import { utils, writeFile } from 'xlsx';
import type { Sale } from '../../types/Sales';

export class ExportService {
  static exportSalesToExcel(
    sales: Sale[], 
    users: any[], 
    products: any[],
    filename: string = 'relatorio_vendas.xlsx'
  ) {
    try {
      const excelData = sales.map(sale => {
        const user = users.find(u => u.id === sale.salesPerson);
        const vendedor = users.find(u => u.id === sale.vendedor);
        
        return {
          'Data': sale.date,
          'Empresa': sale.companyName,
          'Tipo': this.getTypeLabel(sale.type),
          'Nome do Contato': sale.contactName,
          'Forma de Contato': this.getContactMethodLabel(sale.contactMethod),
          'Estágio': this.getStageLabel(sale.stage),
          'Tipo de Produto': this.getProductTypeLabel(sale.productType, products),
          'Resultado': this.getResultLabel(sale.stage),
          'Vendedor': user ? user.name : 'N/A',
          'Vendedor Responsável': vendedor ? vendedor.name : 'N/A',
          'Último Contato': sale.ultimoContato,
          'Status Fechado': sale.statusFechado ? 'Sim' : 'Não',
          'Comentários': sale.comments || '',
          'Telefone': sale.contatoTelefone || '',
          'Email': sale.contatoEmail || '',
          'WhatsApp': sale.contatoWhatsapp || '',
          'Local Presencial': sale.contatoPresencial || ''
        };
      });

      const worksheet = utils.json_to_sheet(excelData);
      const workbook = utils.book_new();
      
      utils.book_append_sheet(workbook, worksheet, 'Relatório de Vendas');
      
      this.autoFitColumns(worksheet, excelData);
      
      this.addHeaderInfo(workbook, sales.length);
      
      writeFile(workbook, filename);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      return false;
    }
  }

  private static autoFitColumns(worksheet: any, data: any[]) {
    if (!data.length) return;

    const maxWidth = data.reduce((acc, row) => {
      Object.keys(row).forEach(key => {
        const length = String(row[key]).length;
        if (!acc[key] || length > acc[key]) {
          acc[key] = length;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(maxWidth).map(key => ({
      wch: Math.min(Math.max(maxWidth[key], key.length), 50)
    }));
  }

  private static addHeaderInfo(workbook: any, totalRecords: number) {
    const info = {
      'Total de Registros': totalRecords,
      'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
      'Hora de Exportação': new Date().toLocaleTimeString('pt-BR')
    };
    
    const infoSheet = utils.json_to_sheet([info]);
    utils.book_append_sheet(workbook, infoSheet, 'Informações');
  }

  private static getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'Novo cliente': 'Novo Cliente',
      'Em negociação': 'Em Negociação'
    };
    return labels[type] || type;
  }

  private static getContactMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'presencial': 'Presencial',
      'telefone': 'Telefone',
      'email': 'Email',
      'whatsapp': 'WhatsApp'
    };
    return labels[method] || method;
  }

  private static getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
      'prospecção': 'Prospecção',
      'apresentada proposta': 'Proposta Apresentada',
      'negociar': 'Negociar',
      'fechar proposta': 'Fechar Proposta',
      'fechado': 'Fechado',
      'pós venda': 'Pós Venda',
      'visita manutenção': 'Visita Manutenção',
      'renegociar contrato': 'Renegociar Contrato',
      'perdida': 'Perdida'
    };
    return labels[stage] || stage;
  }

  private static getProductTypeLabel(productName: string, products: any[]): string {
    const product = products.find(p => p.name === productName);
    return product ? product.name : productName;
  }

  private static getResultLabel(stage: string): string {
    if (stage === 'fechado') return 'Fechado';
    if (stage === 'perdida') return 'Perdida';
    return 'Negociação em andamento';
  }
}