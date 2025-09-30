// services/userService.ts

import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    where,
    serverTimestamp, 
    CollectionReference,
    FieldValue,
    type DocumentData,
    addDoc as firestoreAddDoc
} from 'firebase/firestore';
import { db, auth } from '../../Firebase/Firebase';
import type { 
    User, 
    LoginHistory, 
    CreateUserData, 
    UpdateUserData 
} from '../../types/User';
import { createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { orderBy as firebaseOrderBy } from 'firebase/firestore';

class UserService {
    private usersCollection = collection(db, 'users');
    private loginHistoryCollection = collection(db, 'loginHistory');

    // Buscar todos os usuários (sem senha)
    async getAllUsers(): Promise<Omit<User, 'password'>[]> {
        try {
            const querySnapshot = await getDocs(this.usersCollection);
            
            if (querySnapshot.empty) {
                console.log('🔍 [DEBUG] Nenhum usuário encontrado no Firestore');
                return [];
            }

            const users: Omit<User, 'password'>[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                console.log('📄 [DEBUG] Usuário encontrado:', doc.id, userData);
                
                const { password, ...userWithoutPassword } = userData;
                users.push({
                    id: doc.id,
                    ...userWithoutPassword,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    updatedAt: userData.updatedAt?.toDate() || new Date(),
                } as Omit<User, 'password'>);
            });

            console.log('👥 [DEBUG] Total de usuários carregados:', users.length);
            return users;
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao buscar usuários:', error);
            
            if (error instanceof Error && 'code' in error) {
                console.error('❌ [DEBUG] Código do erro:', (error as any).code);
            }
            
            return [];
        }
    }

    // Buscar informações do usuário logado E criar se não existir
    async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            console.log('🔍 [DEBUG] Buscando usuário no Firestore:', userId);
            
            const userDoc = await getDoc(doc(this.usersCollection, userId));
            
            if (!userDoc.exists()) {
                console.log('📝 [DEBUG] Usuário não encontrado no Firestore, criando perfil...');
                return await this.createUserProfileFromAuth(userId);
            }

            const userData = userDoc.data();
            console.log('✅ [DEBUG] Usuário encontrado no Firestore:', userData);
            
            const { password, ...userWithoutPassword } = userData;

            return {
                id: userDoc.id,
                ...userWithoutPassword,
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as Omit<User, 'password'>;
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao buscar usuário atual:', error);
            return null;
        }
    }

    // Criar perfil de usuário a partir do Authentication
    private async createUserProfileFromAuth(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                console.error('❌ [DEBUG] Nenhum usuário autenticado encontrado');
                return null;
            }

            console.log('👤 [DEBUG] Criando perfil para usuário:', currentUser.email);
            
            const userData = {
                email: currentUser.email || '',
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                lastName: '',
                profilePhoto: currentUser.photoURL || '',
                isAdmin: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            console.log('💾 [DEBUG] Salvando dados do usuário:', userData);

            // ✅ CORREÇÃO: Use setDoc em vez de updateDoc para criar o documento
            await setDoc(doc(this.usersCollection, userId), userData);

            console.log('✅ [DEBUG] Perfil do usuário criado com sucesso no Firestore');

            return {
                id: userId,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Omit<User, 'password'>;
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao criar perfil do usuário:', error);
            
            if (error instanceof Error && 'code' in error) {
                console.error('❌ [DEBUG] Código do erro:', (error as any).code);
                console.error('❌ [DEBUG] Mensagem do erro:', error.message);
            }
            
            return null;
        }
    }

 async createUser(userData: CreateUserData): Promise<User> {
        try {
            // 1. Criar usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                userData.email, 
                userData.password
            );

            const userId = userCredential.user.uid;

            // 2. Salvar dados adicionais no Firestore
            const userProfile = {
                email: userData.email,
                name: userData.name,
                lastName: userData.lastName,
                profilePhoto: userData.profilePhoto || '',
                isAdmin: userData.isAdmin || false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(doc(this.usersCollection, userId), userProfile);

            // 3. Retornar usuário criado
            return {
                id: userId,
                ...userProfile,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Email já está em uso');
            }
            
            throw new Error('Erro ao criar usuário: ' + error.message);
        }
    }

    // Atualizar usuário
    async updateUser(userId: string, userData: UpdateUserData): Promise<void> {
        try {
            const userRef = doc(this.usersCollection, userId);
            
            await updateDoc(userRef, {
                ...userData,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw new Error('Erro ao atualizar usuário');
        }
    }

    // Alterar senha do usuário
    async changePassword(newPassword: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            await updatePassword(user, newPassword);
        } catch (error: any) {
            console.error('Erro ao alterar senha:', error);
            throw new Error('Erro ao alterar senha: ' + error.message);
        }
    }

    // Registrar histórico de login
    async recordLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
        try {
            await addDoc(this.loginHistoryCollection, {
                userId,
                ipAddress: ipAddress || '',
                userAgent: userAgent || '',
                loginAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Erro ao registrar login:', error);
            // Não throw error aqui para não bloquear o login
        }
    }

    // Buscar histórico de login do usuário
    async getLoginHistory(userId: string): Promise<LoginHistory[]> {
        try {
            const q = query(
                this.loginHistoryCollection, 
                where('userId', '==', userId),
                orderBy('loginAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const history: LoginHistory[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                history.push({
                    id: doc.id,
                    userId: data.userId,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    loginAt: data.loginAt?.toDate() || new Date(),
                });
            });

            return history;
        } catch (error) {
            console.error('Erro ao buscar histórico de login:', error);
            return [];
        }
    }
}

// Implementação do addDoc
async function addDoc(
    loginHistoryCollection: CollectionReference<DocumentData, DocumentData>,
    arg1: { userId: string; ipAddress: string; userAgent: string; loginAt: FieldValue; }
) {
    return await firestoreAddDoc(loginHistoryCollection, arg1);
}

function orderBy(field: string, direction: 'asc' | 'desc'): import("@firebase/firestore").QueryConstraint {
        return firestoreOrderBy(field, direction);
}

export const userService = new UserService();

function firestoreOrderBy(field: string, direction: 'asc' | 'desc'): import("@firebase/firestore").QueryConstraint {
    return firebaseOrderBy(field, direction);
}

