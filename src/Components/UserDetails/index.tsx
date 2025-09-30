import React, { useState, useEffect } from 'react';
import { FiX, FiEdit, FiCalendar, FiMail, FiUser, FiClock, FiShield } from 'react-icons/fi';
import type { User, LoginHistory } from '../../types/User';
import { userService } from '../../services/userService/userService';
import { authService } from '../../services/AuthService/authService';
import styles from './styles.module.scss';

interface UserDetailsProps {
  user: Omit<User, 'password'>;
  onClose: () => void;
  onEdit: () => void;
  darkMode?: boolean;
  currentUserIsAdmin?: boolean;
  canEdit?: boolean;
}

const UserDetails: React.FC<UserDetailsProps> = ({ 
  user, 
  onClose, 
  onEdit, 
  darkMode = false,
  currentUserIsAdmin = false,
  canEdit = false 
}) => {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLoginHistory();
    const currentUser = authService.getCurrentUser();
    setCurrentUserId(currentUser?.uid || null);
  }, [user.id]);

  const loadLoginHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await userService.getLoginHistory(user.id);
      setLoginHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isCurrentUser = user.id === currentUserId;

  return (
    <div className={`${styles.modalOverlay} ${darkMode ? styles.dark : ''}`}>
      <div className={`${styles.modal} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2>Detalhes do Usuário</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.userDetails}>
          <div className={styles.userHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={`${user.name} ${user.lastName}`}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials(user.name, user.lastName)}
                  </div>
                )}
                {isCurrentUser && (
                  <div className={styles.currentUserBadge} title="Este é você">
                    <FiUser size={12} />
                  </div>
                )}
              </div>
              <div className={styles.userStatus}>
                <div className={styles.statusRow}>
                  {user.isAdmin && (
                    <span className={styles.adminBadge}>
                      <FiShield size={12} />
                      Administrador
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className={styles.youBadge}>
                      <FiUser size={12} />
                      Seu perfil
                    </span>
                  )}
                </div>
                <span className={styles.createdDate}>
                  <FiCalendar size={14} />
                  Criado em {formatDate(user.createdAt)}
                </span>
                {currentUserIsAdmin && (
                  <span className={styles.userId}>
                    ID: {user.id}
                  </span>
                )}
              </div>
            </div>

            {canEdit && (
              <button onClick={onEdit} className={styles.editButton}>
                <FiEdit size={16} />
                {isCurrentUser ? 'Editar Meu Perfil' : 'Editar Usuário'}
              </button>
            )}
          </div>

          <div className={styles.section}>
            <h3>Informações Pessoais</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <FiUser className={styles.infoIcon} />
                <div>
                  <label>Nome Completo</label>
                  <p>{user.name} {user.lastName}</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FiMail className={styles.infoIcon} />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FiCalendar className={styles.infoIcon} />
                <div>
                  <label>Última Atualização</label>
                  <p>{formatDate(user.updatedAt)}</p>
                </div>
              </div>

  
              {currentUserIsAdmin && (
                <>
                  <div className={styles.infoItem}>
                    <FiShield className={styles.infoIcon} />
                    <div>
                      <label>Tipo de Usuário</label>
                      <p>{user.isAdmin ? 'Administrador' : 'Usuário Comum'}</p>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <FiCalendar className={styles.infoIcon} />
                    <div>
                      <label>Membro desde</label>
                      <p>{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {(currentUserIsAdmin || isCurrentUser) && (
            <div className={styles.section}>
              <h3>Histórico de Login</h3>
              {loadingHistory ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  Carregando histórico...
                </div>
              ) : loginHistory.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <FiClock size={32} />
                  <p>Nenhum registro de login encontrado</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {loginHistory.slice(0, 10).map((login) => (
                    <div key={login.id} className={styles.historyItem}>
                      <div className={styles.historyMain}>
                        <FiClock className={styles.historyIcon} />
                        <div className={styles.historyInfo}>
                          <span className={styles.loginTime}>
                            {formatDate(login.loginAt)}
                          </span>
                          {login.ipAddress && (
                            <span className={styles.loginIp}>
                              IP: {login.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      {login.userAgent && (
                        <div className={styles.userAgent}>
                          {login.userAgent}
                        </div>
                      )}
                    </div>
                  ))}
                  {loginHistory.length > 10 && (
                    <div className={styles.historyMore}>
                      + {loginHistory.length - 10} logins anteriores
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!currentUserIsAdmin && !isCurrentUser && (
            <div className={styles.permissionNotice}>
              <FiUser size={20} />
              <div>
                <h4>Visualização Limitada</h4>
                <p>Você está visualizando informações básicas deste usuário. Apenas administradores têm acesso ao histórico completo.</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.closeBtn}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;