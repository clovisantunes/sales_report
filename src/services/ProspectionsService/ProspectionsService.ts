// services/ProspectionsService/ProspectionsService.ts
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
import type { Prospection } from '../../types/Prospections';

class ProspectionsService {
  private prospectionToFirestore(prospection: Omit<Prospection, 'id'> | Partial<Prospection>): any {
    return {
      companyName: prospection.companyName,
      contactName: prospection.contactName,
      contactEmail: prospection.contactEmail || '',
      contactPhone: prospection.contactPhone || '',
      productType: prospection.productType,
      expectedContactDate: prospection.expectedContactDate,
      priority: prospection.priority,
      status: prospection.status,
      notes: prospection.notes || '',
      assignedTo: prospection.assignedTo,
      createdAt: prospection.createdAt ? 
        this.parseDateToTimestamp(prospection.createdAt) : 
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

  private firestoreToProspection(docId: string, data: any): Prospection {
    return {
      id: docId,
      companyName: data.companyName,
      contactName: data.contactName,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      productType: data.productType,
      expectedContactDate: data.expectedContactDate,
      priority: data.priority,
      status: data.status,
      notes: data.notes || '',
      assignedTo: data.assignedTo,
      createdAt: data.createdAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      updatedAt: data.updatedAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
    };
  }

  async getProspections(): Promise<Prospection[]> {
    try {
      console.log('🔄 [PROSPECTIONS SERVICE] Buscando prospecções...');
      const prospectionsRef = collection(db, 'prospections');
      const q = query(prospectionsRef, orderBy('expectedContactDate', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const prospections: Prospection[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const prospection = this.firestoreToProspection(doc.id, data);
        prospections.push(prospection);
      });
      
      console.log(`✅ [PROSPECTIONS SERVICE] ${prospections.length} prospecções carregadas`);
      return prospections;
    } catch (error) {
      console.error('❌ [PROSPECTIONS SERVICE] Erro ao buscar prospecções:', error);
      throw new Error('Erro ao carregar prospecções');
    }
  }

  async addProspection(prospection: Omit<Prospection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('➕ [PROSPECTIONS SERVICE] Adicionando nova prospecção...', prospection);
      
      const prospectionData = this.prospectionToFirestore(prospection);
      const docRef = await addDoc(collection(db, 'prospections'), prospectionData);
      
      console.log('✅ [PROSPECTIONS SERVICE] Prospecção adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ [PROSPECTIONS SERVICE] Erro ao adicionar prospecção:', error);
      throw new Error('Erro ao adicionar prospecção: ' + error.message);
    }
  }

  async updateProspection(prospectionId: string, prospection: Partial<Omit<Prospection, 'id' | 'createdAt'>>): Promise<void> {
    try {
      console.log('✏️ [PROSPECTIONS SERVICE] Atualizando prospecção...', prospectionId, prospection);
      
      const docRef = doc(db, 'prospections', prospectionId);
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (prospection.companyName !== undefined) updateData.companyName = prospection.companyName;
      if (prospection.contactName !== undefined) updateData.contactName = prospection.contactName;
      if (prospection.contactEmail !== undefined) updateData.contactEmail = prospection.contactEmail || '';
      if (prospection.contactPhone !== undefined) updateData.contactPhone = prospection.contactPhone || '';
      if (prospection.productType !== undefined) updateData.productType = prospection.productType;
      if (prospection.expectedContactDate !== undefined) updateData.expectedContactDate = prospection.expectedContactDate;
      if (prospection.priority !== undefined) updateData.priority = prospection.priority;
      if (prospection.status !== undefined) updateData.status = prospection.status;
      if (prospection.notes !== undefined) updateData.notes = prospection.notes || '';
      if (prospection.assignedTo !== undefined) updateData.assignedTo = prospection.assignedTo;

      await updateDoc(docRef, updateData);
      console.log('✅ [PROSPECTIONS SERVICE] Prospecção atualizada com sucesso');
    } catch (error: any) {
      console.error('❌ [PROSPECTIONS SERVICE] Erro ao atualizar prospecção:', error);
      throw new Error('Erro ao atualizar prospecção: ' + error.message);
    }
  }

  async deleteProspection(prospectionId: string): Promise<void> {
    try {
      console.log('🗑️ [PROSPECTIONS SERVICE] Deletando prospecção...', prospectionId);
      await deleteDoc(doc(db, 'prospections', prospectionId));
      console.log('✅ [PROSPECTIONS SERVICE] Prospecção deletada com sucesso');
    } catch (error: any) {
      console.error('❌ [PROSPECTIONS SERVICE] Erro ao deletar prospecção:', error);
      throw new Error('Erro ao deletar prospecção: ' + error.message);
    }
  }
}

export const prospectionsService = new ProspectionsService();