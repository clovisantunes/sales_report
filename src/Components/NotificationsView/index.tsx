import React, { useState } from 'react';
import { FiX, FiCheck, FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import type { NotificationsViewProps, Notification } from '../../types/NotificationForm';
import styles from './styles.module.scss';

const NotificationsView: React.FC<NotificationsViewProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : !notification.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    if (!notification.read) {
      setSelectedNotification(notification);
    }
  };

  const handleMarkAsRead = () => {
    if (selectedNotification && !selectedNotification.read) {
      onNotificationClick(selectedNotification);
    }
    setSelectedNotification(null);
  };

  const handleCloseDetail = () => {
    setSelectedNotification(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              <FiEye className={styles.titleIcon} />
              Notificações
            </h2>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className={styles.headerRight}>
            {unreadCount > 0 && (
              <button
                className={styles.markAllButton}
                onClick={onMarkAllAsRead}
                disabled={isLoading}
                type="button"
              >
                <FiCheck className={styles.markAllIcon} />
                Marcar todas como lidas
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={onClose}
              type="button"
              disabled={isLoading}
            >
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
            type="button"
          >
            Todas ({notifications.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
            type="button"
          >
            Não lidas ({unreadCount})
          </button>
        </div>

        <div className={styles.notificationsList}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <FiEyeOff className={styles.emptyIcon} />
              <h3>Nenhuma notificação</h3>
              <p>
                {filter === 'unread' 
                  ? 'Você não tem notificações não lidas.'
                  : 'Você não tem notificações.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${
                  !notification.read ? styles.unread : ''
                } ${selectedNotification?.id === notification.id ? styles.selected : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles.notificationHeader}>
                  <div className={styles.notificationType}>
                    {getTypeIcon(notification.type)}
                    <span 
                      className={styles.typeBadge}
                      style={{ 
                        backgroundColor: getTypeColor(notification.type),
                        color: 'white'
                      }}
                    >
                      {notification.type === 'info' && 'Informativa'}
                      {notification.type === 'success' && 'Sucesso'}
                      {notification.type === 'warning' && 'Atenção'}
                      {notification.type === 'error' && 'Erro'}
                    </span>
                  </div>
                  <div className={styles.notificationMeta}>
                    <span className={styles.timestamp}>
                      {formatDate(notification.timestamp)}
                    </span>
                    {!notification.read && (
                      <span className={styles.unreadDot}></span>
                    )}
                  </div>
                </div>

                <div className={styles.notificationContent}>
                  <h4 className={styles.notificationTitle}>
                    {notification.title}
                  </h4>
                  <p className={styles.notificationMessage}>
                    {notification.message.length > 150 
                      ? `${notification.message.substring(0, 150)}...` 
                      : notification.message
                    }
                  </p>
                  
                  {notification.image && (
                    <div className={styles.notificationImagePreview}>
                      <img 
                        src={notification.image} 
                        alt="Preview" 
                        className={styles.imagePreview}
                      />
                      <span className={styles.imageLabel}>Contém imagem</span>
                    </div>
                  )}
                </div>

                {notification.senderName && (
                  <div className={styles.notificationFooter}>
                    <span className={styles.sender}>
                      Enviado por: {notification.senderName}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedNotification && (
          <div className={styles.detailOverlay}>
            <div className={styles.detailModal}>
              <div className={styles.detailHeader}>
                <button
                  className={styles.backButton}
                  onClick={handleCloseDetail}
                  type="button"
                >
                  ← Voltar
                </button>
                <h3 className={styles.detailTitle}>Detalhes da Notificação</h3>
                <button
                  className={styles.closeDetailButton}
                  onClick={handleCloseDetail}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <div className={styles.detailContent}>
                <div className={styles.detailType}>
                  {getTypeIcon(selectedNotification.type)}
                  <span 
                    className={styles.detailTypeBadge}
                    style={{ backgroundColor: getTypeColor(selectedNotification.type) }}
                  >
                    {selectedNotification.type === 'info' && 'Informativa'}
                    {selectedNotification.type === 'success' && 'Sucesso'}
                    {selectedNotification.type === 'warning' && 'Atenção'}
                    {selectedNotification.type === 'error' && 'Erro'}
                  </span>
                </div>

                <h2 className={styles.detailNotificationTitle}>
                  {selectedNotification.title}
                </h2>

                <div className={styles.detailMeta}>
                  <span className={styles.detailTimestamp}>
                    {formatDate(selectedNotification.timestamp)}
                  </span>
                  {selectedNotification.senderName && (
                    <span className={styles.detailSender}>
                      • Enviado por: {selectedNotification.senderName}
                    </span>
                  )}
                </div>

                <div className={styles.detailMessage}>
                  {selectedNotification.message}
                </div>

                {selectedNotification.image && (
                  <div className={styles.detailImage}>
                    <img 
                      src={selectedNotification.image} 
                      alt="Notificação" 
                      className={styles.fullImage}
                    />
                  </div>
                )}

                {!selectedNotification.read && (
                  <div className={styles.detailActions}>
                    <button
                      className={styles.markAsReadButton}
                      onClick={handleMarkAsRead}
                      type="button"
                    >
                      <FiCheck className={styles.markAsReadIcon} />
                      Marcar como lida
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;