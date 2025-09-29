import { 
  signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../Firebase/Firebase'; 
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;

export interface AuthResponse {
  success: boolean;
  user?: {
    uid: string;
    email: string | null;
    displayName?: string | null;
  };
  error?: string;
  errorCode?: string;
}

class AuthService {
async login(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log('🔐 [DEBUG] Iniciando login no authService');
    console.log('🔐 [DEBUG] Email recebido:', email);
    console.log('🔐 [DEBUG] Password recebido:', password ? '***' : 'vazio');
    
    // Verificar se o email é válido
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('❌ [DEBUG] Email é inválido:', email);
      return {
        success: false,
        error: 'Email é obrigatório',
        errorCode: 'auth/missing-email'
      };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      console.error('❌ [DEBUG] Password é inválido');
      return {
        success: false,
        error: 'Senha é obrigatória',
        errorCode: 'auth/missing-password'
      };
    }

    console.log('🔐 [DEBUG] Chamando Firebase Auth...');
    
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;
    
    console.log('✅ [DEBUG] Login bem-sucedido no Firebase:', user.email);
    
    await this.generateAndStoreToken(user);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuário'
      }
    };
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro completo no login:', error);
    console.error('❌ [DEBUG] Código do erro:', error.code);
    console.error('❌ [DEBUG] Mensagem do erro:', error.message);
    console.error('❌ [DEBUG] Stack:', error.stack);
    
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta conta foi desativada.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login com email/senha não está habilitado.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        default:
          errorMessage = `Erro: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      };
    }
  }

  private async generateAndStoreToken(user: User): Promise<void> {
    try {
      const idToken = await user.getIdToken();
      const tokenData = {
        token: idToken,
        uid: user.uid,
        email: user.email,
        expiration: Date.now() + TOKEN_EXPIRY_TIME
      };
      
      localStorage.setItem('authToken', JSON.stringify(tokenData));
      console.log('🔑 Token salvo com sucesso');
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      throw error;
    }
  }

  isTokenValid(): boolean {
    try {
      const tokenDataString = localStorage.getItem('authToken');
      if (!tokenDataString) return false;
      
      const tokenData = JSON.parse(tokenDataString);
      const isValid = Date.now() < tokenData.expiration;
      
      if (!isValid) {
        this.logout();
      }
      
      return isValid;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  }

  getCurrentUser(): { uid: string; email: string | null } | null {
    try {
      if (!this.isTokenValid()) return null;
      
      const tokenDataString = localStorage.getItem('authToken');
      if (!tokenDataString) return null;
      
      const tokenData = JSON.parse(tokenDataString);
      return {
        uid: tokenData.uid,
        email: tokenData.email
      };
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Erro ao enviar email de recuperação.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Nenhum usuário encontrado com este email.';
          break;
        default:
          errorMessage = `Erro: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      };
    }
  }
}

export const authService = new AuthService();