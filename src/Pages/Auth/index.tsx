import React, { useState } from 'react';
import { authService } from '../../services/AuthService/authService';
import styles from './styles.module.scss';

interface LoginData {
  email: string;
  password: string;
}

interface LoginProps {
  onLogin: (userData: any) => Promise<boolean>;
  darkMode: boolean;
  appName?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, darkMode, appName = "SalesReport Pro" }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!loginData.email.trim() || !loginData.password.trim()) {
    setError('Por favor, preencha todos os campos');
    return;
  }

  if (!loginData.email.includes('@')) {
    setError('Por favor, digite um email válido');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('📤 Enviando para Firebase:', { 
      email: loginData.email, 
      password: loginData.password ? '***' : 'vazio' 
    });
    
   const success = await onLogin({
      email: loginData.email,
      password: loginData.password
    });
    
    console.log('📤 Resultado do onLogin:', success);
    
    if (!success) {
      setError('Erro ao processar login');
    }
  } catch (err) {
    console.error('❌ Erro no handleSubmit:', err);
    setError('Erro ao fazer login. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError('Por favor, digite seu email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.resetPassword(resetEmail);
      
      if (result.success) {
        alert('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        setError(result.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.loginContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.loginBox} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>📊</div>
            <div className={`${styles.logoText} ${darkMode ? styles.dark : ''}`}>
              {appName}
            </div>
          </div>
          <h1 className={`${styles.title} ${darkMode ? styles.dark : ''}`}>
            {showForgotPassword ? 'Recuperar Senha' : 'Acessar Sistema'}
          </h1>
          <p className={`${styles.subtitle} ${darkMode ? styles.dark : ''}`}>
            {showForgotPassword 
              ? 'Digite seu email para receber o link de recuperação' 
              : 'Digite suas credenciais para continuar'
            }
          </p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email" 
                id="email"
                name="email" 
                value={loginData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                disabled={loading}
                className={darkMode ? styles.dark : ''}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
                disabled={loading}
                className={darkMode ? styles.dark : ''}
                required
              />
            </div>

            <div className={styles.forgotPassword}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className={`${styles.forgotLink} ${darkMode ? styles.dark : ''}`}
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.loginButton} ${darkMode ? styles.dark : ''}`}
            >
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        ) : (
          <div className={styles.forgotPasswordForm}>
            {error && (
              <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="resetEmail">Email</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Digite seu email cadastrado"
                disabled={loading}
                className={darkMode ? styles.dark : ''}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className={`${styles.loginButton} ${darkMode ? styles.dark : ''}`}
              >
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setError('');
                }}
                disabled={loading}
                className={`${styles.backButton} ${darkMode ? styles.dark : ''}`}
              >
                Voltar para Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;