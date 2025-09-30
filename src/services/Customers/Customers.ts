// services/CustomerService/CustomerService.ts
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import type { Customer } from '../../types/Customers';
import type { Sale } from '../../types/Sales';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('📊 Buscando clientes das vendas...');
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
          comments: data.comments || '',
          salesPerson: data.salesPerson || '',
          result: data.result || '',
          statusFechado: data.statusFechado || false,
          ultimoContato: data.ultimoContato || '',
          vendedor: data.vendedor || '',
          contatoTelefone: data.contatoTelefone || '',
          contatoEmail: data.contatoEmail || '',
          contatoWhatsapp: data.contatoWhatsapp || '',
          contatoPresencial: data.contatoPresencial || '',
          createdAt: data.createdAt?.toDate?.().toLocaleDateString('pt-BR') || '',
          updatedAt: data.updatedAt?.toDate?.().toLocaleDateString('pt-BR') || ''
        } as Sale;
      });

      console.log(`✅ ${sales.length} vendas encontradas para converter em clientes`);

      const customers = sales.map(sale => this.convertSaleToCustomer(sale));
      console.log(`✅ ${customers.length} clientes convertidos`);
      
      return customers;
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      throw error;
    }
  },

  async getCustomersWithFilters(filters: any): Promise<Customer[]> {
    try {
      console.log('🔍 Aplicando filtros:', filters);
      const salesRef = collection(db, 'sales');
      let q = query(salesRef, orderBy('createdAt', 'desc'));

      if (filters.salesStatus && filters.salesStatus !== '') {
        q = query(q, where('stage', '==', filters.salesStatus));
      }
      if (filters.salesPerson && filters.salesPerson !== '') {
        q = query(q, where('salesPerson', '==', filters.salesPerson));
      }
      if (filters.contactMethod && filters.contactMethod !== '') {
        q = query(q, where('contactMethod', '==', filters.contactMethod));
      }

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
          comments: data.comments || '',
          salesPerson: data.salesPerson || '',
          result: data.result || '',
          statusFechado: data.statusFechado || false,
          ultimoContato: data.ultimoContato || '',
          vendedor: data.vendedor || '',
          contatoTelefone: data.contatoTelefone || '',
          contatoEmail: data.contatoEmail || '',
          contatoWhatsapp: data.contatoWhatsapp || '',
          contatoPresencial: data.contatoPresencial || '',
          createdAt: data.createdAt?.toDate?.().toLocaleDateString('pt-BR') || '',
          updatedAt: data.updatedAt?.toDate?.().toLocaleDateString('pt-BR') || ''
        } as Sale;
      });

      console.log(`✅ ${sales.length} vendas encontradas com filtros`);

      const customers = sales.map(sale => this.convertSaleToCustomer(sale));
      console.log(`✅ ${customers.length} clientes após filtros`);
      
      return customers;
    } catch (error) {
      console.error('❌ Erro ao buscar clientes com filtros:', error);
      throw error;
    }
  },

  convertSaleToCustomer(sale: Sale): Customer {
    const customer: Customer = {
      id: sale.id,
      name: sale.contactName || 'Nome não informado',
      company: sale.companyName || 'Empresa não informada',
      email: sale.contatoEmail || '',
      phone: sale.contatoTelefone || '',
      status: this.getCustomerStatus(sale.stage, sale.statusFechado),
      salesStatus: sale.stage || 'prospecção',
      lastContact: sale.ultimoContato || sale.date || '',
      salesPerson: sale.vendedor || sale.salesPerson || '',
      notes: sale.comments || '',
      whatsapp: sale.contatoWhatsapp || '',
      address: sale.contatoPresencial || '',
      contactMethod: sale.contactMethod || 'email'
    };

    console.log('🔧 Convertendo venda para cliente:', {
      venda: {
        contactName: sale.contactName,
        companyName: sale.companyName,
        contatoEmail: sale.contatoEmail,
        contatoTelefone: sale.contatoTelefone,
        stage: sale.stage,
        statusFechado: sale.statusFechado,
        ultimoContato: sale.ultimoContato,
        vendedor: sale.vendedor,
        salesPerson: sale.salesPerson,
        contatoWhatsapp: sale.contatoWhatsapp,
        contatoPresencial: sale.contatoPresencial,
        contactMethod: sale.contactMethod
      },
      cliente: customer
    });

    return customer;
  },

  getCustomerStatus(stage: string, statusFechado: boolean): 'active' | 'inactive' | 'pending' {
    if (statusFechado === true) return 'active';
    
    if (stage === 'fechado' || stage === 'pós venda') return 'active';
    
    if (stage === 'perdida') return 'inactive';
    
    return 'pending';
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customers = await this.getCustomers();
      const customer = customers.find(customer => customer.id === id) || null;
      console.log('👤 Cliente encontrado por ID:', customer);
      return customer;
    } catch (error) {
      console.error('❌ Erro ao buscar cliente por ID:', error);
      throw error;
    }
  },

  async getCustomerByIdDirect(id: string): Promise<Customer | null> {
    try {
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, where('__name__', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ Cliente não encontrado com ID:', id);
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      const sale: Sale = {
        id: doc.id,
        date: data.date || '',
        companyName: data.companyName || '',
        type: data.type || '',
        contactName: data.contactName || '',
        contactMethod: data.contactMethod || 'email',
        stage: data.stage || 'prospecção',
        productType: data.productType || '',
        comments: data.comments || '',
        salesPerson: data.salesPerson || '',
        result: data.result || '',
        statusFechado: data.statusFechado || false,
        ultimoContato: data.ultimoContato || '',
        vendedor: data.vendedor || '',
        contatoTelefone: data.contatoTelefone || '',
        contatoEmail: data.contatoEmail || '',
        contatoWhatsapp: data.contatoWhatsapp || '',
        contatoPresencial: data.contatoPresencial || '',
        createdAt: data.createdAt?.toDate?.().toLocaleDateString('pt-BR') || '',
        updatedAt: data.updatedAt?.toDate?.().toLocaleDateString('pt-BR') || ''
      };

      return this.convertSaleToCustomer(sale);
    } catch (error) {
      console.error('❌ Erro ao buscar cliente direto por ID:', error);
      throw error;
    }
  }
};