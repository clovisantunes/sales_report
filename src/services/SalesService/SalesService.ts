import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import type { Sale } from '../../types/Sales';
import { userService } from '../userService/userService';

class SalesService {
  private saleToFirestore(sale: Omit<Sale, 'id'> | Partial<Sale>): any {
    return {
      date: sale.date,
      companyName: sale.companyName,
      type: sale.type,
      contactName: sale.contactName,
      contactMethod: sale.contactMethod,
      stage: sale.stage,
      productType: sale.productType,
      comments: sale.comments || '',
      salesPerson: sale.salesPerson,
      result: sale.result || '',
      
      cnpj: sale.cnpj || '',
      lifes: sale.lifes || 0,
      
      statusFechado: sale.statusFechado || false,
      vendedor: sale.vendedor || '',
      contatoTelefone: sale.contatoTelefone || '',
      contatoEmail: sale.contatoEmail || '',
      contatoWhatsapp: sale.contatoWhatsapp || '',
      contatoPresencial: sale.contatoPresencial || '',
      
      periodicidade: sale.periodicidade || 'anual',
      valor: sale.valor || '',

      createdAt: sale.createdAt ? 
        this.parseDateToTimestamp(sale.createdAt) : 
        Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  private parseDateToTimestamp(dateString: string): Timestamp {
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Timestamp.fromDate(date);
    } catch (error) {
      console.warn('Erro ao converter data, usando data atual:', dateString);
      return Timestamp.now();
    }
  }

  private firestoreToSale(docId: string, data: any): Sale {
    return {
      id: docId,
      date: data.date,
      companyName: data.companyName,
      type: data.type,
      contactName: data.contactName,
      contactMethod: data.contactMethod,
      stage: data.stage,
      productType: data.productType,
      comments: data.comments || '',
      salesPerson: data.salesPerson,
      result: data.result || '',
      periodicidade: data.periodicidade || 'anual',
      valor: data.valor || '',
      cnpj: data.cnpj || '',
      lifes: data.lifes || 0,
      
      statusFechado: data.statusFechado || false,
      vendedor: data.vendedor || '',
      contatoTelefone: data.contatoTelefone || '',
      contatoEmail: data.contatoEmail || '',
      contatoWhatsapp: data.contatoWhatsapp || '',
      contatoPresencial: data.contatoPresencial || '',
      

      createdAt: data.createdAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      updatedAt: data.updatedAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
    };
  }

  private async enrichSalesWithSellerInfo(sales: Sale[]): Promise<Sale[]> {
    try {
      console.log('👥 [SALES SERVICE] Buscando usuários para enriquecer vendas...');
      const allUsers = await userService.getAllUsers();
      console.log(`👥 [SALES SERVICE] ${allUsers.length} usuários carregados`);
      
      const usersMap = new Map();
      allUsers.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      const enrichedSales = sales.map(sale => {
        const sellerInfo = usersMap.get(sale.salesPerson);
        const sellerInfoVendedor = usersMap.get(sale.vendedor);
        
        console.log(`👤 [SALES SERVICE] Venda ${sale.id}:`, {
          salesPersonId: sale.salesPerson,
          salesPersonName: sellerInfo ? `${sellerInfo.name} ${sellerInfo.lastName}` : 'N/A',
          vendedorId: sale.vendedor,
          vendedorName: sellerInfoVendedor ? `${sellerInfoVendedor.name} ${sellerInfoVendedor.lastName}` : 'N/A',
          cnpj: sale.cnpj,
          lifes: sale.lifes
        });
        
        return {
          ...sale,
          sellerInfo: sellerInfo ? {
            name: sellerInfo.name,
            lastName: sellerInfo.lastName,
            email: sellerInfo.email,
            fullName: `${sellerInfo.name} ${sellerInfo.lastName}`
          } : undefined,
          vendedorInfo: sellerInfoVendedor ? {
            name: sellerInfoVendedor.name,
            lastName: sellerInfoVendedor.lastName,
            email: sellerInfoVendedor.email,
            fullName: `${sellerInfoVendedor.name} ${sellerInfoVendedor.lastName}`
          } : undefined
        };
      });
      
      console.log('✅ [SALES SERVICE] Vendas enriquecidas com informações dos vendedores');
      return enrichedSales;
    } catch (error) {
      console.error('❌ [SALES SERVICE] Erro ao enriquecer vendas com informações do vendedor:', error);
      return sales; 
    }
  }

  async getSales(): Promise<Sale[]> {
    try {
      console.log('🔄 [SALES SERVICE] Buscando vendas...');
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sales: Sale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const sale = this.firestoreToSale(doc.id, data);
        console.log(`📄 [SALES SERVICE] Venda ${doc.id}:`, {
          cnpj: sale.cnpj,
          lifes: sale.lifes,
          company: sale.companyName
        });
        sales.push(sale);
      });
      
      console.log(`✅ [SALES SERVICE] ${sales.length} vendas carregadas do Firestore`);
      
      const enrichedSales = await this.enrichSalesWithSellerInfo(sales);
      
      console.log('✅ [SALES SERVICE] Vendas retornadas com informações dos vendedores');
      return enrichedSales;
    } catch (error) {
      console.error('❌ [SALES SERVICE] Erro ao buscar vendas:', error);
      throw new Error('Erro ao carregar vendas');
    }
  }

  async addSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('➕ [SALES SERVICE] Adicionando nova venda...', sale);
      
      const validatedSale = {
        ...sale,
        comments: sale.comments || '',
        result: sale.result || '',
        statusFechado: sale.statusFechado || false,
        vendedor: sale.vendedor || '',
        contatoTelefone: sale.contatoTelefone || '',
        contatoEmail: sale.contatoEmail || '',
        contatoWhatsapp: sale.contatoWhatsapp || '',
        contatoPresencial: sale.contatoPresencial || '',
        cnpj: sale.cnpj || 'N/A',
        lifes: sale.lifes || 0,
        
        periodicidade: sale.periodicidade || 'anual',
        valor: sale.valor || '',

        createdAt: new Date().toLocaleDateString('pt-BR'),
      };

      console.log('📤 [SALES SERVICE] Dados validados:', validatedSale);

      const saleData = this.saleToFirestore(validatedSale as any);
      console.log('🔥 [SALES SERVICE] Dados para Firestore:', saleData);

      const docRef = await addDoc(collection(db, 'sales'), saleData);
      console.log('✅ [SALES SERVICE] Venda adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ [SALES SERVICE] Erro detalhado ao adicionar venda:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      throw new Error('Erro ao adicionar venda: ' + error.message);
    }
  }

  async updateSale(saleId: string, sale: Partial<Omit<Sale, 'id' | 'createdAt'>>): Promise<void> {
    try {
      console.log('✏️ [SALES SERVICE] Atualizando venda...', saleId, sale);
      
      const saleData = {
        ...sale,
        comments: sale.comments || '',
        result: sale.result || '',
        statusFechado: sale.statusFechado || false,
        vendedor: sale.vendedor || '',
        contatoTelefone: sale.contatoTelefone || '',
        contatoEmail: sale.contatoEmail || '',
        contatoWhatsapp: sale.contatoWhatsapp || '',
        contatoPresencial: sale.contatoPresencial || '',
        cnpj: sale.cnpj || '',
        lifes: sale.lifes || 0,
        
        periodicidade: sale.periodicidade || 'anual',
        valor: sale.valor || '',

        updatedAt: new Date().toLocaleDateString('pt-BR')
      };

      console.log('📤 [SALES SERVICE] Dados para atualização:', saleData);

      const docRef = doc(db, 'sales', saleId);
      
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (sale.date !== undefined) updateData.date = sale.date;
      if (sale.companyName !== undefined) updateData.companyName = sale.companyName;
      if (sale.type !== undefined) updateData.type = sale.type;
      if (sale.contactName !== undefined) updateData.contactName = sale.contactName;
      if (sale.contactMethod !== undefined) updateData.contactMethod = sale.contactMethod;
      if (sale.stage !== undefined) updateData.stage = sale.stage;
      if (sale.productType !== undefined) updateData.productType = sale.productType;
      if (sale.comments !== undefined) updateData.comments = sale.comments || '';
      if (sale.salesPerson !== undefined) updateData.salesPerson = sale.salesPerson;
      if (sale.result !== undefined) updateData.result = sale.result || '';
      
      if (sale.cnpj !== undefined) updateData.cnpj = sale.cnpj || '';
      if (sale.lifes !== undefined) updateData.lifes = sale.lifes || 0;
      
      if (sale.statusFechado !== undefined) updateData.statusFechado = sale.statusFechado;
      if (sale.vendedor !== undefined) updateData.vendedor = sale.vendedor || '';
      if (sale.contatoTelefone !== undefined) updateData.contatoTelefone = sale.contatoTelefone || '';
      if (sale.contatoEmail !== undefined) updateData.contatoEmail = sale.contatoEmail || '';
      if (sale.contatoWhatsapp !== undefined) updateData.contatoWhatsapp = sale.contatoWhatsapp || '';
      if (sale.contatoPresencial !== undefined) updateData.contatoPresencial = sale.contatoPresencial || '';

       if (sale.periodicidade !== undefined) updateData.periodicidade = sale.periodicidade || 'anual';
      if (sale.valor !== undefined) updateData.valor = sale.valor || '';
      
      console.log('🔥 [SALES SERVICE] Dados para atualização no Firestore:', updateData);

      await updateDoc(docRef, updateData);
      console.log('✅ [SALES SERVICE] Venda atualizada com sucesso');
    } catch (error: any) {
      console.error('❌ [SALES SERVICE] Erro ao atualizar venda:', error);
      throw new Error('Erro ao atualizar venda: ' + error.message);
    }
  }

  async deleteSale(saleId: string): Promise<void> {
    try {
      console.log('🗑️ [SALES SERVICE] Deletando venda...', saleId);
      await deleteDoc(doc(db, 'sales', saleId));
      console.log('✅ [SALES SERVICE] Venda deletada com sucesso');
    } catch (error: any) {
      console.error('❌ [SALES SERVICE] Erro ao deletar venda:', error);
      throw new Error('Erro ao deletar venda: ' + error.message);
    }
  }

  async getSalesBySeller(): Promise<{ sellerId: string; sellerName: string; salesCount: number; sales: Sale[] }[]> {
    try {
      const sales = await this.getSales();
      
      const salesBySeller = sales.reduce((acc, sale) => {
        const sellerId = sale.salesPerson;
        const sellerName = sale.sellerInfo?.fullName || sellerId;
        
        if (!acc[sellerId]) {
          acc[sellerId] = {
            sellerId,
            sellerName,
            salesCount: 0,
            sales: []
          };
        }
        
        acc[sellerId].salesCount++;
        acc[sellerId].sales.push(sale);
        
        return acc;
      }, {} as Record<string, { sellerId: string; sellerName: string; salesCount: number; sales: Sale[] }>);
      
      return Object.values(salesBySeller).sort((a, b) => b.salesCount - a.salesCount);
    } catch (error) {
      console.error('❌ [SALES SERVICE] Erro ao buscar vendas por vendedor:', error);
      return [];
    }
  }
}

export const salesService = new SalesService();