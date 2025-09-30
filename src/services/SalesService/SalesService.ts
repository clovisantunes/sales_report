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
      
      statusFechado: sale.statusFechado || false,
      ultimoContato: sale.ultimoContato || '',
      vendedor: sale.vendedor || '',
      contatoTelefone: sale.contatoTelefone || '',
      contatoEmail: sale.contatoEmail || '',
      contatoWhatsapp: sale.contatoWhatsapp || '',
      contatoPresencial: sale.contatoPresencial || '',
      
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
      
      statusFechado: data.statusFechado || false,
      ultimoContato: data.ultimoContato || '',
      vendedor: data.vendedor || '',
      contatoTelefone: data.contatoTelefone || '',
      contatoEmail: data.contatoEmail || '',
      contatoWhatsapp: data.contatoWhatsapp || '',
      contatoPresencial: data.contatoPresencial || '',
      
      createdAt: data.createdAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      updatedAt: data.updatedAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
    };
  }

  async getSales(): Promise<Sale[]> {
    try {
      console.log('📊 Buscando vendas do Firebase...');
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sales: Sale[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Dados da venda:', data);
        sales.push(this.firestoreToSale(doc.id, data));
      });
      
      console.log(`✅ ${sales.length} vendas carregadas`);
      return sales;
    } catch (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      throw new Error('Erro ao carregar vendas');
    }
  }

  async addSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('➕ Adicionando nova venda...', sale);
      
      const validatedSale = {
        ...sale,
        comments: sale.comments || '',
        result: sale.result || '',
        statusFechado: sale.statusFechado || false,
        ultimoContato: sale.ultimoContato || '',
        vendedor: sale.vendedor || '',
        contatoTelefone: sale.contatoTelefone || '',
        contatoEmail: sale.contatoEmail || '',
        contatoWhatsapp: sale.contatoWhatsapp || '',
        contatoPresencial: sale.contatoPresencial || '',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      console.log('📤 Dados validados:', validatedSale);

      const saleData = this.saleToFirestore(validatedSale as any);
      console.log('🔥 Dados para Firestore:', saleData);

      const docRef = await addDoc(collection(db, 'sales'), saleData);
      console.log('✅ Venda adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao adicionar venda:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      throw new Error('Erro ao adicionar venda: ' + error.message);
    }
  }

  async updateSale(saleId: string, sale: Partial<Omit<Sale, 'id' | 'createdAt'>>): Promise<void> {
    try {
      console.log('✏️ Atualizando venda...', saleId, sale);
      
      const saleData = {
        ...sale,
        comments: sale.comments || '',
        result: sale.result || '',
        statusFechado: sale.statusFechado || false,
        ultimoContato: sale.ultimoContato || '',
        vendedor: sale.vendedor || '',
        contatoTelefone: sale.contatoTelefone || '',
        contatoEmail: sale.contatoEmail || '',
        contatoWhatsapp: sale.contatoWhatsapp || '',
        contatoPresencial: sale.contatoPresencial || '',
        updatedAt: new Date().toLocaleDateString('pt-BR')
      };

      console.log('📤 Dados para atualização:', saleData);

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
      
      if (sale.statusFechado !== undefined) updateData.statusFechado = sale.statusFechado;
      if (sale.ultimoContato !== undefined) updateData.ultimoContato = sale.ultimoContato || '';
      if (sale.vendedor !== undefined) updateData.vendedor = sale.vendedor || '';
      if (sale.contatoTelefone !== undefined) updateData.contatoTelefone = sale.contatoTelefone || '';
      if (sale.contatoEmail !== undefined) updateData.contatoEmail = sale.contatoEmail || '';
      if (sale.contatoWhatsapp !== undefined) updateData.contatoWhatsapp = sale.contatoWhatsapp || '';
      if (sale.contatoPresencial !== undefined) updateData.contatoPresencial = sale.contatoPresencial || '';

      console.log('🔥 Dados para atualização no Firestore:', updateData);

      await updateDoc(docRef, updateData);
      console.log('✅ Venda atualizada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar venda:', error);
      throw new Error('Erro ao atualizar venda: ' + error.message);
    }
  }

  async deleteSale(saleId: string): Promise<void> {
    try {
      console.log('🗑️ Deletando venda...', saleId);
      await deleteDoc(doc(db, 'sales', saleId));
      console.log('✅ Venda deletada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao deletar venda:', error);
      throw new Error('Erro ao deletar venda: ' + error.message);
    }
  }
}

export const salesService = new SalesService();