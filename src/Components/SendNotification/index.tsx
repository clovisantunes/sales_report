import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiSend, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import type { SendNotificationProps, NotificationFormData } from '../../types/NotificationForm';
import styles from './styles.module.scss';

const SendNotification: React.FC<SendNotificationProps> = ({
  isOpen,
  onClose,
  onSend,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    image: null,
    type: 'info',
    targetUsers: 'all'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para a notificação.');
      return;
    }

    if (!formData.message.trim()) {
      alert('Por favor, insira uma mensagem para a notificação.');
      return;
    }

    onSend(formData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      image: null,
      type: 'info',
      targetUsers: 'all'
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheckCircle className={styles.successIcon} />;
      case 'warning': return <FiAlertTriangle className={styles.warningIcon} />;
      case 'error': return <FiAlertCircle className={styles.errorIcon} />;
      default: return <FiInfo className={styles.infoIcon} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FiSend className={styles.titleIcon} />
            Enviar Notificação
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            type="button"
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Tipo de Notificação
            </label>
            <div className={styles.typeSelector}>
              {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                <label key={type} className={styles.typeOption}>
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleInputChange}
                    className={styles.typeInput}
                  />
                  <span 
                    className={`${styles.typeLabel} ${formData.type === type ? styles.selected : ''}`}
                    style={formData.type === type ? { borderColor: getTypeColor(type) } : {}}
                  >
                    {getTypeIcon(type)}
                    <span className={styles.typeText}>
                      {type === 'info' && 'Informativa'}
                      {type === 'success' && 'Sucesso'}
                      {type === 'warning' && 'Atenção'}
                      {type === 'error' && 'Erro'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Digite o título da notificação"
              required
              disabled={isLoading}
              maxLength={100}
            />
            <div className={styles.charCount}>
              {formData.title.length}/100 caracteres
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Mensagem *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Digite a mensagem da notificação"
              rows={4}
              required
              disabled={isLoading}
              maxLength={500}
            />
            <div className={styles.charCount}>
              {formData.message.length}/500 caracteres
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.label}>
              Imagem (Opcional)
            </label>
            <div className={styles.imageUpload}>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
                disabled={isLoading}
              />
              
              {!imagePreview ? (
                <label htmlFor="image" className={styles.uploadArea}>
                  <FiUpload className={styles.uploadIcon} />
                  <span>Clique para selecionar uma imagem</span>
                  <small>PNG, JPG, GIF (max 5MB)</small>
                </label>
              ) : (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                  <button
                    type="button"
                    onClick={removeImage}
                    className={styles.removeImage}
                    disabled={isLoading}
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="targetUsers" className={styles.label}>
              Destinatários
            </label>
            <select
              id="targetUsers"
              name="targetUsers"
              value={formData.targetUsers}
              onChange={handleInputChange}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="all">Todos os usuários</option>
              <option value="specific">Usuários específicos</option>
            </select>
          </div>

          {formData.targetUsers === 'specific' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Selecionar Usuários
              </label>
              <div className={styles.userSelection}>
                <p className={styles.helperText}>
                  Funcionalidade em desenvolvimento...
                </p>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend className={styles.sendIcon} />
                  Enviar Notificação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;