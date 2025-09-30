import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    query, 
    where,
    orderBy,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { db, auth } from '../../Firebase/Firebase';
import type { 
    User, 
    LoginHistory, 
    CreateUserData, 
    UpdateUserData 
} from '../../types/User';
import { createUserWithEmailAndPassword, updatePassword  } from 'firebase/auth';

class UserService {
    private usersCollection = collection(db, 'users');
    private loginHistoryCollection = collection(db, 'loginHistory');

    async getAllUsers(): Promise<Omit<User, 'password'>[]> {
        try {
            const querySnapshot = await getDocs(this.usersCollection);
            
            if (querySnapshot.empty) {
                console.log('🔍 Nenhum usuário encontrado no Firestore');
                return [];
            }

            const users: Omit<User, 'password'>[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const { password, ...userWithoutPassword } = userData;
                users.push({
                    id: doc.id,
                    ...userWithoutPassword,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    updatedAt: userData.updatedAt?.toDate() || new Date(),
                } as Omit<User, 'password'>);
            });

            return users;
        } catch (error) {
            console.error('❌ Erro ao buscar usuários:', error);
            return [];
        }
    }

    async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            const userDoc = await getDoc(doc(this.usersCollection, userId));
            
            if (!userDoc.exists()) {
                console.log('📝 Criando perfil para usuário...');
                return await this.createUserProfileFromAuth(userId);
            }

            const userData = userDoc.data();
            const { password, ...userWithoutPassword } = userData;

            return {
                id: userDoc.id,
                ...userWithoutPassword,
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as Omit<User, 'password'>;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário atual:', error);
            return null;
        }
    }

    private async createUserProfileFromAuth(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                return null;
            }

            const userData = {
                email: currentUser.email || '',
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                lastName: '',
                profilePhoto: currentUser.photoURL || '',
                isAdmin: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(doc(this.usersCollection, userId), userData);

            return {
                id: userId,
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Omit<User, 'password'>;
        } catch (error) {
            console.error('❌ Erro ao criar perfil do usuário:', error);
            return null;
        }
    }

    async createUser(userData: CreateUserData): Promise<User> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                userData.email, 
                userData.password
            );

            const userId = userCredential.user.uid;
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
        }
    }

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

    async deleteUser(userId: string): Promise<void> {
        try {
            console.log('🗑️ Iniciando exclusão do usuário:', userId);
            
            const userRef = doc(this.usersCollection, userId);
            await deleteDoc(userRef);
            console.log('✅ Usuário excluído do Firestore');
            
         
            
        } catch (error: any) {
            console.error('❌ Erro ao excluir usuário:', error);
            
            if (error.code === 'permission-denied') {
                throw new Error('Sem permissão para excluir usuário. Atualize as regras do Firestore!');
            }
            
            throw new Error('Erro ao excluir usuário: ' + error.message);
        }
    }

    async softDeleteUser(userId: string): Promise<void> {
        try {
            const userRef = doc(this.usersCollection, userId);
            await updateDoc(userRef, {
                isActive: false,
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log('✅ Usuário marcado como inativo');
        } catch (error) {
            console.error('Erro ao desativar usuário:', error);
            throw new Error('Erro ao desativar usuário');
        }
    }
}

export const userService = new UserService();