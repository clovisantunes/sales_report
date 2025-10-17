import React, { useState, useEffect } from 'react';
import Login from './Pages/Auth';
import type { User } from './types/User';
import Navbar from './Components/NavBar';
import Sidebar from './Components/Siderbar';
import Dashboard from './Components/Dashboard';
import Sales from './Components/Sales';
import Customers from './Components/Customers';
import Products from './Components/Products';
import Prospections from './Components/Prospections';
import { authService } from './services/AuthService/authService';
import type { LoginData } from './types/Auth';
import Users from './Components/Users';
import { userService } from './services/userService/userService';
import type { NotificationFormData, Notification } from './types/NotificationForm';
import SendNotification from './Components/SendNotification';
import { notificationService } from './services/NotificationService/notificationService';
import NotificationDetail from './Components/NotificationDetail'; // Alterado aqui
import NotificationsView from './Components/NotificationsView';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null); 
const [isNotificationsViewOpen, setIsNotificationsViewOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      
      const isTokenValid = authService.isTokenValid();
      
      if (isTokenValid) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          
          await authService.ensureUserProfile();
          const userProfile = await userService.getCurrentUser(currentUser.uid);
          
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);          
          const userData: User = {
            id: currentUser.uid,
            name: userProfile?.name || currentUser.email?.split('@')[0] || 'Usuário',
            lastName: userProfile?.lastName || '',
            email: currentUser.email || '',
            initials: getInitials(userProfile?.name, userProfile?.lastName),
            isAdmin: userProfile?.isAdmin || false,
            profilePhoto: userProfile?.profilePhoto || '',
            createdAt: userProfile?.createdAt ? new Date(userProfile.createdAt) : new Date(), 
            updatedAt: userProfile?.updatedAt ? new Date(userProfile.updatedAt) : new Date()  
          };
          setUser(userData);

          const userNotifications = await notificationService.getUserNotifications(currentUser.uid);
          setNotifications(userNotifications);
        }
      }
      
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Removido handleOpenNotificationsView e handleCloseNotificationsView

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = notificationService.subscribeToNotifications(
        user.id, 
        (newNotifications) => {
          setNotifications(newNotifications);
        }
      );

      return () => unsubscribe();
    }
  }, [user?.id]);

  const getInitials = (name?: string, lastName?: string): string => {
    if (!name) return 'US';
    
    const firstInitial = name.charAt(0).toUpperCase();
    
    if (lastName) {
      const lastInitial = lastName.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
    
    return firstInitial + 'U';
  };

  const handleLogin = async (loginData: LoginData): Promise<boolean> => {
    try {
      const result = await authService.login(loginData.email, loginData.password);
      
      if (result.success && result.user) {
        const userProfile = await userService.getCurrentUser(result.user.uid);
        
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
        
        console.log('👤 [APP LOGIN] Perfil do usuário:', userProfile);
        console.log('👥 [APP LOGIN] Total de usuários carregados:', allUsers.length);
        
        const userData: User = {
          id: result.user.uid,
          name: userProfile?.name || result.user.email?.split('@')[0] || 'Usuário',
          lastName: userProfile?.lastName || '',
          email: result.user.email || '',
          initials: getInitials(userProfile?.name, userProfile?.lastName),
          isAdmin: userProfile?.isAdmin || false,
          profilePhoto: userProfile?.profilePhoto || '',
          createdAt: userProfile?.createdAt ? new Date(userProfile.createdAt) : new Date(),
          updatedAt: userProfile?.updatedAt ? new Date(userProfile.updatedAt) : new Date()
        };
        
        setUser(userData);
        setIsAuthenticated(true);

        const userNotifications = await notificationService.getUserNotifications(result.user.uid);
        setNotifications(userNotifications);

        return true;
      } else {
        console.error('Erro no login:', result.error);
        return false;
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const handleSendNotification = async (data: NotificationFormData) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      await notificationService.sendNotification(data, {
        id: user.id,
        name: `${user.name} ${user.lastName}`,
        isAdmin: user.isAdmin
      });
      
      alert('Notificação enviada com sucesso!');
      setIsNotificationModalOpen(false);
    } catch (error: any) {
      alert(`Erro ao enviar notificação: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!user) return;

    await notificationService.markAsRead(notification.id, user.id);
    
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    setSelectedNotification(notification);
  };

  const handleOpenNotificationsView = () => {
setIsNotificationsViewOpen(true);
  }

  const handleCloseNotificationsView = () => {
  setIsNotificationsViewOpen(false);
};
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    await notificationService.markAllAsRead(user.id);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleCloseNotificationDetail = () => {
    setSelectedNotification(null);
  };

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUsers([]); 
      setNotifications([]);
      setSelectedNotification(null); 
      setIsAuthenticated(false);
      setActiveSection('dashboard');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard darkMode={darkMode} users={users} />;
      case 'sales':
        return <Sales darkMode={darkMode} currentUser={user} users={users} />;
      case 'customers':
        return <Customers darkMode={darkMode} />;
      case 'products':
        return <Products darkMode={darkMode} isAdmin={user?.isAdmin} />;
      case 'prospections': 
        return <Prospections darkMode={darkMode} currentUser={user} users={users} />;
      case 'users':
        return <Users darkMode={darkMode} />;
      default:
        return <Dashboard darkMode={darkMode} users={users} />;
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: darkMode ? '#0d1117' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000'
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin}
        darkMode={darkMode}
        appName="Relatorio de Visitas"
      />
    );
  }

  return (
    <div className={darkMode ? 'dark-theme' : ''}>
      <Navbar 
        user={
          user ?? {
            id: '',
            name: 'Usuário',
            lastName: '',
            email: '',
            initials: 'US',
            isAdmin: false,
            profilePhoto: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        onLogout={handleLogout}
        appName="Relatorio de Visitas"
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        notifications={notifications.map(n => ({ ...n, image: n.image ?? undefined }))}
        onNotificationClick={handleNotificationClick} 
        onMarkAllAsRead={handleMarkAllAsRead}
                onNotificationsClick={handleOpenNotificationsView} 
      />
      
      <NotificationDetail
        isOpen={!!selectedNotification}
        onClose={handleCloseNotificationDetail}
        notification={selectedNotification}
        onMarkAsRead={handleNotificationClick}
      />
      <NotificationsView
  isOpen={isNotificationsViewOpen}
  onClose={handleCloseNotificationsView}
  notifications={notifications}
  onNotificationClick={handleNotificationClick}
  onMarkAllAsRead={handleMarkAllAsRead}
/>

      <Sidebar 
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        darkMode={darkMode}
        activeSection={activeSection}
        user={user ?? undefined}
        onSectionChange={handleSectionChange}
        onSendNotification={handleOpenNotificationModal}
      />

      <div style={{ 
        marginLeft: sidebarExpanded ? '200px' : '70px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: darkMode ? '#0d1117' : '#f5f5f5'
      }}>
        {renderContent()}
      </div>

      <SendNotification
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSend={handleSendNotification}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;