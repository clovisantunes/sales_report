// src/services/productsService.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import type { Product } from '../../types/Products';


class ProductsService {
  private productToFirestore(product: Omit<Product, 'id'>): any {
    return {
      name: product.name,
      category: product.category,
      price: product.price,
      status: product.status,
      description: product.description,
      createdAt: Timestamp.fromDate(new Date(product.createdAt.split('/').reverse().join('-'))),
      updatedAt: Timestamp.now()
    };
  }

  private firestoreToProduct(docId: string, data: any): Product {
    return {
      id: docId,
      name: data.name,
      category: data.category,
      price: data.price,
      status: data.status,
      description: data.description,
      createdAt: data.createdAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
    };
  }

  async getProducts(): Promise<Product[]> {
    try {
      console.log('📦 Buscando produtos do Firebase...');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push(this.firestoreToProduct(doc.id, doc.data()));
      });
      
      console.log(`✅ ${products.length} produtos carregados`);
      return products;
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      throw new Error('Erro ao carregar produtos');
    }
  }
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.firestoreToProduct(docSnap.id, docSnap.data());
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar produto:', error);
      throw new Error('Erro ao buscar produto');
    }
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('➕ Adicionando novo produto...', product);
      
      const productData = {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log('✅ Produto adicionado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      throw new Error('Erro ao adicionar produto');
    }
  }
  async updateProduct(productId: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    try {
      console.log('✏️ Atualizando produto...', productId, product);
      
      const productData = {
        ...product,
        updatedAt: Timestamp.now()
      };

      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, productData);
      console.log('✅ Produto atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw new Error('Erro ao atualizar produto');
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('🗑️ Deletando produto...', productId);
      await deleteDoc(doc(db, 'products', productId));
      console.log('✅ Produto deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw new Error('Erro ao deletar produto');
    }
  }

  async getProductsByStatus(status: 'active' | 'inactive'): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push(this.firestoreToProduct(doc.id, doc.data()));
      });
      
      return products;
    } catch (error) {
      console.error('❌ Erro ao buscar produtos por status:', error);
      throw new Error('Erro ao buscar produtos filtrados');
    }
  }
}

export const productsService = new ProductsService();