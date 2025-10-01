import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';
import type { User, CreateUserData, UpdateUserData } from '../../types/User';
import { userService } from '../../services/userService/userService';
import styles from './styles.module.scss';

interface UserFormProps {
  user?: Omit<User, 'password'> | null;
  onSave: () => void;
  onClose: () => void;
  darkMode?: boolean;
  isAdmin?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose, darkMode = false, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    profilePhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: '',
        confirmPassword: '',
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (!isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && user) {
        const updateData: UpdateUserData = {
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          isAdmin: formData.isAdmin,
          profilePhoto: formData.profilePhoto
        };
        await userService.updateUser(user.id, updateData);
      } else {
        const createData: CreateUserData = {
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          isAdmin: formData.isAdmin,
          profilePhoto: formData.profilePhoto
        };
        await userService.createUser(createData);
      }

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setErrors({ submit: error.message || 'Erro ao salvar usuário' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h2 className={`${styles.modalTitle} ${darkMode ? styles.dark : ''}`}>
                {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <p className={`${styles.modalSubtitle} ${darkMode ? styles.dark : ''}`}>
                {isEditing 
                  ? 'Atualize as informações do usuário' 
                  : 'Preencha os dados para criar um novo usuário'
                }
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`${styles.closeButton} ${darkMode ? styles.dark : ''}`}
              disabled={loading}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && (
            <div className={`${styles.submitError} ${darkMode ? styles.dark : ''}`}>
              <div className={styles.errorIcon}>!</div>
              {errors.submit}
            </div>
          )}

          <div className={styles.formSection}>
            <h3 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
              Informações Pessoais
            </h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                  Nome *
                </label>
                <div className={styles.inputContainer}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`${styles.formInput} ${errors.name ? styles.error : ''} ${darkMode ? styles.dark : ''}`}
                    placeholder="Digite o nome"
                    disabled={loading}
                  />
                </div>
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                  Sobrenome *
                </label>
                <div className={styles.inputContainer}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={`${styles.formInput} ${errors.lastName ? styles.error : ''} ${darkMode ? styles.dark : ''}`}
                    placeholder="Digite o sobrenome"
                    disabled={loading}
                  />
                </div>
                {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                Email *
              </label>
              <div className={styles.inputContainer}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${styles.formInput} ${errors.email ? styles.error : ''} ${darkMode ? styles.dark : ''}`}
                  placeholder="usuario@empresa.com"
                  disabled={loading || isEditing}
                />
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              {isEditing && (
                <small className={`${styles.helpText} ${darkMode ? styles.dark : ''}`}>
                  O email não pode ser alterado
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="profilePhoto" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                Foto de Perfil
              </label>
              <div className={styles.inputContainer}>
                <FiCamera className={styles.inputIcon} />
                <input
                  type="url"
                  id="profilePhoto"
                  value={formData.profilePhoto}
                  onChange={(e) => handleChange('profilePhoto', e.target.value)}
                  className={`${styles.formInput} ${darkMode ? styles.dark : ''}`}
                  placeholder="https://exemplo.com/foto.jpg"
                  disabled={loading}
                />
              </div>
              <small className={`${styles.helpText} ${darkMode ? styles.dark : ''}`}>
                Cole a URL da imagem de perfil
              </small>
            </div>
          </div>

          {!isEditing && (
            <div className={styles.formSection}>
              <h3 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
                Segurança
              </h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                    Senha *
                  </label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`${styles.formInput} ${errors.password ? styles.error : ''} ${darkMode ? styles.dark : ''}`}
                      placeholder="Digite a senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className={styles.passwordToggle}
                      disabled={loading}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                  <small className={`${styles.helpText} ${darkMode ? styles.dark : ''}`}>
                    Mínimo de 6 caracteres
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={`${styles.formLabel} ${darkMode ? styles.dark : ''}`}>
                    Confirmar Senha *
                  </label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''} ${darkMode ? styles.dark : ''}`}
                      placeholder="Confirme a senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className={styles.passwordToggle}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className={styles.errorText}>{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className={styles.formSection}>
              <h3 className={`${styles.sectionTitle} ${darkMode ? styles.dark : ''}`}>
                Permissões
              </h3>
              
              <div className={styles.checkboxCard}>
                <label className={`${styles.checkboxLabel} ${darkMode ? styles.dark : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) => handleChange('isAdmin', e.target.checked)}
                    className={styles.checkboxInput}
                    disabled={loading}
                  />
                  <span className={`${styles.checkmark} ${darkMode ? styles.dark : ''}`}></span>
                  <div className={styles.checkboxContent}>
                    <span className={styles.checkboxTitle}>Usuário Administrador</span>
                    <span className={`${styles.checkboxDescription} ${darkMode ? styles.dark : ''}`}>
                      Administradores têm acesso completo a todas as funcionalidades do sistema
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.cancelButton} ${darkMode ? styles.dark : ''}`}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.saveButton} ${darkMode ? styles.dark : ''} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  {isEditing ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                isEditing ? 'Atualizar Usuário' : 'Criar Usuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;