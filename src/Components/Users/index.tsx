import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUser } from 'react-icons/fi';
import type { User } from '../../types/User';
import { userService } from '../../services/userService/userService';
import { authService } from '../../services/AuthService/authService';
import UserForm from '../UserForm/UserForm';
import UserDetails from './../UserDetails/index';
import styles from './styles.module.scss';

interface UsersProps {
  darkMode?: boolean;
}

const Users: React.FC<UsersProps> = ({ darkMode = false }) => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Omit<User, 'password'> | null>(null);
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>('all');
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    checkCurrentUserAdmin();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 [DEBUG] Carregando usuários...');
      const usersData = await userService.getAllUsers();
      console.log('👥 [DEBUG] Usuários recebidos:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUserAdmin = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      console.log('🔍 [DEBUG] Usuário atual do auth:', currentUser);
      
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
        const userProfile = await userService.getCurrentUser(currentUser.uid);
        console.log('👤 [DEBUG] Perfil do usuário atual:', userProfile);
        
        const isAdmin = userProfile?.isAdmin || false;
        console.log('🎯 [DEBUG] Usuário é administrador?', isAdmin);
        setCurrentUserIsAdmin(isAdmin);
      } else {
        console.log('⚠️ [DEBUG] Nenhum usuário autenticado encontrado');
        setCurrentUserIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao verificar permissões:', error);
      setCurrentUserIsAdmin(false);
    }
  };

  const handleCreateUser = () => {
    if (!currentUserIsAdmin) {
      alert('Você não tem permissão para criar usuários');
      return;
    }
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: Omit<User, 'password'>) => {
    if (currentUserIsAdmin || user.id === currentUserId) {
      setEditingUser(user);
      setShowForm(true);
    } else {
      alert('Você não tem permissão para editar este usuário');
    }
  };

  const handleViewUser = (user: Omit<User, 'password'>) => {
    setSelectedUser(user);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  const handleUserSaved = () => {
    loadUsers();
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (user: Omit<User, 'password'>) => {
    if (!currentUserIsAdmin) {
      alert('Você não tem permissão para excluir usuários');
      return;
    }

    if (user.id === currentUserId) {
      alert('Você não pode excluir sua própria conta');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name} ${user.lastName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const canEditUser = (user: Omit<User, 'password'>): boolean => {
    return currentUserIsAdmin || user.id === currentUserId;
  };

  const canDeleteUser = (user: Omit<User, 'password'>): boolean => {
    return currentUserIsAdmin && user.id !== currentUserId;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAdmin === 'all' || 
                         (filterAdmin === 'admin' && user.isAdmin) ||
                         (filterAdmin === 'user' && !user.isAdmin);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`${styles.loading} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.spinner}></div>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.usersContainer} ${darkMode ? styles.dark : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Gerenciar Usuários</h1>
          {currentUserIsAdmin && (
            <span className={styles.adminBadgeHeader}>
              <FiUser size={14} />
              Modo Administrador
            </span>
          )}
        </div>
        
        {currentUserIsAdmin && (
          <button 
            className={styles.addButton}
            onClick={handleCreateUser}
          >
            <FiUserPlus size={20} />
            Novo Usuário
          </button>
        )}
      </header>
      {!currentUserIsAdmin && (
        <div className={styles.permissionInfo}>
          <FiUser size={16} />
          <span>Você está visualizando os usuários do sistema. Apenas administradores podem gerenciar usuários.</span>
        </div>
      )}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value as 'all' | 'admin' | 'user')}
            className={styles.filterSelect}
          >
            <option value="all">Todos os usuários</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuários comuns</option>
          </select>
        </div>
      </div>
      <div className={styles.usersList}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <FiUserPlus size={48} />
            <h3>Nenhum usuário encontrado</h3>
            <p>
              {searchTerm || filterAdmin !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : currentUserIsAdmin 
                  ? 'Comece adicionando o primeiro usuário'
                  : 'Nenhum usuário cadastrado no sistema'
              }
            </p>
          </div>
        ) : (
          <div className={styles.usersGrid}>
            {filteredUsers.map(user => (
              <div key={user.id} className={`${styles.userCard} ${darkMode ? styles.dark : ''}`}>
                <div className={styles.userHeader}>
                  <div className={styles.userAvatar}>
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={`${user.name} ${user.lastName}`} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {user.name.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                    )}
                    {user.id === currentUserId && (
                      <div className={styles.currentUserIndicator} title="Você">
                        <FiUser size={12} />
                      </div>
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <h3>
                      {user.name} {user.lastName}
                      {user.id === currentUserId && (
                        <span className={styles.youBadge}>(Você)</span>
                      )}
                    </h3>
                    <p className={styles.userEmail}>{user.email}</p>
                    <div className={styles.userBadges}>
                      {user.isAdmin && (
                        <span className={styles.adminBadge}>Administrador</span>
                      )}
                      <span className={styles.statusBadge}>
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.userActions}>
                  <button
                    onClick={() => handleViewUser(user)}
                    className={styles.viewButton}
                  >
                    Ver Detalhes
                  </button>
                  <div className={styles.actionButtons}>
                    {canEditUser(user) && (
                      <button
                        onClick={() => handleEditUser(user)}
                        className={styles.editButton}
                        title={user.id === currentUserId ? "Editar meu perfil" : "Editar usuário"}
                      >
                        <FiEdit size={16} />
                      </button>
                    )}
                    
                    {canDeleteUser(user) && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={styles.deleteButton}
                        title="Excluir usuário"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onSave={handleUserSaved}
          onClose={handleCloseForm}
          darkMode={darkMode}
          isAdmin={currentUserIsAdmin}
        />
      )}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={handleCloseDetails}
          onEdit={() => {
            if (canEditUser(selectedUser)) {
              setEditingUser(selectedUser);
              setSelectedUser(null);
              setShowForm(true);
            } else {
              alert('Você não tem permissão para editar este usuário');
            }
          }}
          darkMode={darkMode}
          currentUserIsAdmin={currentUserIsAdmin}
          canEdit={canEditUser(selectedUser)}
        />
      )}
    </div>
  );
};

export default Users;