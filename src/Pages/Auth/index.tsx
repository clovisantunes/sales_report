import React, { useState } from 'react';
import { authService } from '../../services/AuthService/authService';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
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
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
      const success = await onLogin({
        email: loginData.email,
        password: loginData.password
      });
      
      if (!success) {
        setError('Credenciais inválidas. Verifique seu email e senha.');
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

    if (!resetEmail.includes('@')) {
      setError('Por favor, digite um email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.resetPassword(resetEmail);
      
      if (result.success) {
        setResetSent(true);
      } else {
        setError(result.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetSent(false);
    setError('');
  };

  return (
    <div className={`${styles.loginContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.loginBackground}>
        <div className={styles.backgroundPattern}></div>
      </div>
      
      <div className={styles.loginContent}>
        <div className={`${styles.loginCard} ${darkMode ? styles.dark : ''}`}>
          {/* Header */}
          <div className={styles.loginHeader}>
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <div className={styles.logoGraphic}>
                  <div className={styles.chartBar}></div>
                  <div className={styles.chartBar}></div>
                  <div className={styles.chartBar}></div>
                </div>
              </div>
              <div className={styles.logoText}>
                <h1 className={`${styles.appName} ${darkMode ? styles.dark : ''}`}>
                  {appName}
                </h1>
                <p className={`${styles.appTagline} ${darkMode ? styles.dark : ''}`}>
                  Gestão Inteligente de Vendas
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.loginBody}>
            {!showForgotPassword ? (
              <>
                <div className={styles.welcomeSection}>
                  <h2 className={`${styles.welcomeTitle} ${darkMode ? styles.dark : ''}`}>
                    Bem-vindo de volta
                  </h2>
                  <p className={`${styles.welcomeSubtitle} ${darkMode ? styles.dark : ''}`}>
                    Entre com suas credenciais para acessar o sistema
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  {error && (
                    <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
                      <div className={styles.errorIcon}>!</div>
                      {error}
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <div className={styles.inputContainer}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        placeholder="Digite seu email"
                        disabled={loading}
                        className={`${styles.formInput} ${darkMode ? styles.dark : ''}`}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.inputContainer}>
                      <FiLock className={styles.inputIcon} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        placeholder="Digite sua senha"
                        disabled={loading}
                        className={`${styles.formInput} ${darkMode ? styles.dark : ''}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={styles.passwordToggle}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formOptions}>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className={`${styles.forgotLink} ${darkMode ? styles.dark : ''}`}
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.loginButton} ${darkMode ? styles.dark : ''} ${loading ? styles.loading : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className={styles.buttonSpinner}></div>
                        Entrando...
                      </>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.forgotPasswordSection}>
                {!resetSent ? (
                  <>
                    <div className={styles.sectionHeader}>
                      <button
                        onClick={handleBackToLogin}
                        className={styles.backButton}
                      >
                        <FiArrowLeft />
                      </button>
                      <h2 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
                        Recuperar Senha
                      </h2>
                    </div>

                    <p className={`${styles.sectionDescription} ${darkMode ? styles.dark : ''}`}>
                      Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
                    </p>

                    {error && (
                      <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
                        <div className={styles.errorIcon}>!</div>
                        {error}
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <div className={styles.inputContainer}>
                        <FiMail className={styles.inputIcon} />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="seu@email.com"
                          disabled={loading}
                          className={`${styles.formInput} ${darkMode ? styles.dark : ''}`}
                          required
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className={`${styles.resetButton} ${darkMode ? styles.dark : ''} ${loading ? styles.loading : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Link de Recuperação'
                      )}
                    </button>
                  </>
                ) : (
                  <div className={styles.successSection}>
                    <div className={styles.successIcon}>
                      <FiCheck />
                    </div>
                    <h3 className={`${styles.successTitle} ${darkMode ? styles.dark : ''}`}>
                      Email enviado!
                    </h3>
                    <p className={`${styles.successDescription} ${darkMode ? styles.dark : ''}`}>
                      Enviamos um link de recuperação para <strong>{resetEmail}</strong>. 
                      Verifique sua caixa de entrada e siga as instruções.
                    </p>
                    <button
                      onClick={handleBackToLogin}
                      className={`${styles.backToLoginButton} ${darkMode ? styles.dark : ''}`}
                    >
                      Voltar para o Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.loginFooter}>
            <p className={`${styles.footerText} ${darkMode ? styles.dark : ''}`}>
              © 2024 {appName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;