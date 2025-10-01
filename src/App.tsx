import React, { useState, useEffect } from 'react';
import Login from './Pages/Auth';
import type { User } from './types/User';
import Navbar from './Components/NavBar';
import Sidebar from './Components/Siderbar';
import Dashboard from './Components/Dashboard';
import Sales from './Components/Sales';
import Customers from './Components/Customers';
import Products from './Components/Products';
import { authService } from './services/AuthService/authService';
import type {  LoginData } from './types/Auth';
import Users from './Components/Users';
import { userService } from './services/userService/userService';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          
          console.log('👤 [APP] Perfil do usuário atual:', userProfile);
          console.log('👥 [APP] Total de usuários carregados:', allUsers.length);
          
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
        }
      }
      
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUsers([]); 
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
        appName="Relatorio de Vendas"
      />
    );
  }

  console.log('👤 [APP RENDER] Dados do usuário para Navbar:', {
    name: user?.name,
    lastName: user?.lastName,
    email: user?.email,
    profilePhoto: user?.profilePhoto,
    initials: user?.initials
  });

  return (
    <div className={darkMode ? 'dark-theme' : ''}>
      <Navbar 
        user={{
          name: user?.name || 'Usuário',
          lastName: user?.lastName || '',
          email: user?.email || '',
          avatar: user?.profilePhoto || '',
          initials: user?.initials || 'US' 
        }}
        onLogout={handleLogout}
        appName="Relatorio de Vendas"
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />
      
      <Sidebar 
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        darkMode={darkMode}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <div style={{ 
        marginLeft: sidebarExpanded ? '250px' : '70px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: darkMode ? '#0d1117' : '#f5f5f5'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;