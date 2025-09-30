// components/Users/UserForm.tsx

import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';
import type { User, CreateUserData, UpdateUserData } from '../../types/User';
import { userService } from '../../services/userService/userService';
import styles from './styles.module.scss';

interface UserFormProps {
  user?: Omit<User, 'password'> | null;
  onSave: () => void;
  onClose: () => void;
  darkMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
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
      alert(error.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                <FiUser className={styles.inputIcon} />
                Nome *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? styles.error : ''}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Sobrenome *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={errors.lastName ? styles.error : ''}
              />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FiMail className={styles.inputIcon} />
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? styles.error : ''}
              disabled={isEditing} // Não permitir alterar email em edição
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          {!isEditing && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="password">
                  <FiLock className={styles.inputIcon} />
                  Senha *
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={errors.password ? styles.error : ''}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? styles.error : ''}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="profilePhoto">
              <FiCamera className={styles.inputIcon} />
              Foto de Perfil (URL)
            </label>
            <input
              type="url"
              id="profilePhoto"
              value={formData.profilePhoto}
              onChange={(e) => handleChange('profilePhoto', e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => handleChange('isAdmin', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkmark}></span>
              Usuário Administrador
            </label>
            <small className={styles.helpText}>
              Administradores têm acesso completo ao sistema
            </small>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;