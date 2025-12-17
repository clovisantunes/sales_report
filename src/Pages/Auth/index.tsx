import React, { useState } from 'react';
import { authService } from '../../services/AuthService/authService';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import styles from './styles.module.scss';
import logoImage from '../../assets/logo.png'; 

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
      <div className={styles.backgroundImage}></div>
      <div className={styles.overlay}></div>
      
      <div className={styles.loginWrapper}>
        <div className={styles.loginLeftPanel}>
          <div className={styles.brandSection}>
            <div className={styles.logoContainer}>
              <img 
                src={logoImage} 
                alt={`${appName} Logo`} 
                className={styles.logoImage}
              />
            </div>
            <div className={styles.appInfo}>
              <h1 className={styles.appNameLarge}>{appName}</h1>
              <p className={styles.appDescription}>
                Gestão Inteligente de Vendas e Relatórios
              </p>
            </div>
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>📊</div>
                <span>Relatórios em tempo real</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>🔒</div>
                <span>Segurança avançada</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>⚡</div>
                <span>Alta performance</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.loginRightPanel}>
          <div className={`${styles.loginCard} ${darkMode ? styles.dark : ''}`}>
            <div className={styles.cardHeader}>
              {!showForgotPassword ? (
                <h2 className={styles.cardTitle}>Bem-vindo de volta</h2>
              ) : (
                <div className={styles.sectionHeader}>
                  <button
                    onClick={handleBackToLogin}
                    className={styles.backButton}
                  >
                    <FiArrowLeft />
                  </button>
                  <h2 className={styles.cardTitle}>Recuperar Senha</h2>
                </div>
              )}
              <p className={styles.cardSubtitle}>
                {!showForgotPassword 
                  ? 'Entre com suas credenciais para continuar'
                  : 'Digite seu email para recuperar sua senha'
                }
              </p>
            </div>

            <div className={styles.cardBody}>
              {error && (
                <div className={`${styles.errorMessage} ${darkMode ? styles.dark : ''}`}>
                  <div className={styles.errorIcon}>!</div>
                  <div className={styles.errorText}>{error}</div>
                </div>
              )}

              {!showForgotPassword ? (
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <div className={styles.inputWrapper}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        disabled={loading}
                        className={`${styles.formInput} ${darkMode ? styles.dark : ''}`}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.labelContainer}>
                      <label className={styles.formLabel}>Senha</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={`${styles.forgotLink} ${darkMode ? styles.dark : ''}`}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className={styles.inputWrapper}>
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
              ) : !resetSent ? (
                <div className={styles.forgotPasswordForm}>
                  <p className={styles.resetDescription}>
                    Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
                  </p>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <div className={styles.inputWrapper}>
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
                </div>
              ) : (
                <div className={styles.successSection}>
                  <div className={styles.successIcon}>
                    <FiCheck />
                  </div>
                  <h3 className={styles.successTitle}>Email enviado!</h3>
                  <p className={styles.successDescription}>
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

            <div className={styles.cardFooter}>
              
              <p className={styles.copyright}>
                © 2025 Clovis Antunes. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;