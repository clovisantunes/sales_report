import React, { useState, useEffect } from 'react';
import Login from './Pages/Auth';
import Navbar from './Components/NavBar';
import Sidebar from './Components/Siderbar';
import Dashboard from './Components/Dashboard';
import Sales from './Components/Sales';
import Customers from './Components/Customers';
import Products from './Components/Products';
import { authService } from './services/AuthService/authService';
import type { User, LoginData } from './types/Auth';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      
      const isTokenValid = authService.isTokenValid();
      
      if (isTokenValid) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          const userData: User = {
            id: currentUser.uid,
            name: currentUser.email?.split('@')[0] || 'Usuário',
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || 'usuario',
            initials: getInitials(currentUser.email || 'US')
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

  const getInitials = (email: string): string => {
    if (!email || typeof email !== 'string') return 'US';
    
    const username = email.split('@')[0];
    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    }
    return username.toUpperCase() + 'U';
  };

  const handleLogin = async (loginData: LoginData): Promise<boolean> => {
    try {
      const result = await authService.login(loginData.email, loginData.password);
      
      if (result.success && result.user) {
        const userData: User = {
          id: result.user.uid,
          name: result.user.email?.split('@')[0] || 'Usuário',
          email: result.user.email || '',
          username: result.user.email?.split('@')[0] || 'usuario',
          initials: getInitials(result.user.email || 'US')
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
        return <Dashboard darkMode={darkMode} />;
      case 'sales':
        return <Sales darkMode={darkMode} currentUser={user} users={user ? [user] : []} />;
      case 'customers':
        return <Customers darkMode={darkMode} />;
      case 'products':
        return <Products darkMode={darkMode} />;
      case 'settings':
        return <div>Configurações - Em breve</div>;
      default:
        return <Dashboard darkMode={darkMode} />;
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

  return (
    <div className={darkMode ? 'dark-theme' : ''}>
      <Navbar 
        user={user!}
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