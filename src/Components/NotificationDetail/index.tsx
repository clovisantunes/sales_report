import React from 'react';
import { FiX, FiCheck, FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertCircle, FiUser, FiCalendar } from 'react-icons/fi';
import type { NotificationDetailProps } from '../../types/NotificationForm';
import styles from './styles.module.scss';

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  isOpen,
  onClose,
  notification,
  onMarkAsRead
}) => {
  if (!isOpen || !notification) return null;

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'success': return 'Sucesso';
      case 'warning': return 'Atenção';
      case 'error': return 'Erro';
      default: return 'Informativa';
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.notificationType}>
              {getTypeIcon(notification.type)}
              <span 
                className={styles.typeBadge}
                style={{ backgroundColor: getTypeColor(notification.type) }}
              >
                {getTypeLabel(notification.type)}
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            {!notification.read && (
              <button
                className={styles.markAsReadButton}
                onClick={handleMarkAsRead}
                type="button"
              >
                <FiCheck className={styles.markAsReadIcon} />
                Marcar como lida
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={handleClose}
              type="button"
            >
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{notification.title}</h1>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <FiCalendar className={styles.metaIcon} />
                <span>{formatDateTime(notification.timestamp)}</span>
              </div>
              {notification.senderName && (
                <div className={styles.metaItem}>
                  <FiUser className={styles.metaIcon} />
                  <span>Enviado por: {notification.senderName}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.messageSection}>
            <h3 className={styles.sectionTitle}>Mensagem</h3>
            <div className={styles.message}>
              {notification.message.split('\n').map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {notification.image && (
            <div className={styles.imageSection}>
              <h3 className={styles.sectionTitle}>Imagem</h3>
              <div className={styles.imageContainer}>
                <img 
                  src={notification.image} 
                  alt="Notificação" 
                  className={styles.image}
                />
              </div>
            </div>
          )}

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Informações</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Data de envio:</span>
                <span className={styles.infoValue}>{formatDate(notification.timestamp)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Horário:</span>
                <span className={styles.infoValue}>{formatTime(notification.timestamp)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={`${styles.infoValue} ${notification.read ? styles.read : styles.unread}`}>
                  {notification.read ? 'Lida' : 'Não lida'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo:</span>
                <span 
                  className={styles.infoValue}
                  style={{ color: getTypeColor(notification.type) }}
                >
                  {getTypeLabel(notification.type)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.closeFooterButton}
            onClick={handleClose}
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;