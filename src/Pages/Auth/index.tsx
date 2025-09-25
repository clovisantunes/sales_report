import React, { useState } from 'react';
import  type{ LoginData } from '../../types/Auth';
import styles from './styles.module.scss';

interface LoginProps {
  onLogin: (userData: LoginData) => Promise<boolean>;
  darkMode: boolean;
  appName?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, darkMode, appName = "SalesReport Pro" }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onLogin(loginData);
      if (!success) {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implementar lógica de recuperação de senha
    alert('Funcionalidade de recuperação de senha será implementada em breve.');
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
            Acessar Sistema
          </h1>
          <p className={`${styles.subtitle} ${darkMode ? styles.dark : ''}`}>
            Digite suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              value={loginData.username}
              onChange={handleInputChange}
              placeholder="Digite seu usuário"
              disabled={loading}
              className={darkMode ? styles.dark : ''}
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
            />
          </div>

          <div className={styles.forgotPassword}>
            <button
              type="button"
              onClick={handleForgotPassword}
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
      </div>
    </div>
  );
};

export default Login;