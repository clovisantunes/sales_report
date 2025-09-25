import React, { useState, useEffect } from 'react';
import Login from './Pages/Auth';
import Navbar from './Components/NavBar';
import Sidebar from './Components/Siderbar';
import Dashboard from './Components/Dashboard';
import Sales from './Components/Sales';
import Customers from './Components/Customers';
import Products from './Components/Products';
import type { User,  LoginData } from './types/Auth';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedDarkMode = localStorage.getItem('darkMode');
      
      if (token) {
        setIsAuthenticated(true);
        const userData: User = {
          id: '1',
          name: 'Usuário',
          email: 'usuario@empresa.com',
          username: 'usuario',
          initials: 'US'
        };
        setUser(userData);
      }
      
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (loginData: LoginData): Promise<boolean> => {
    try {
      // Aqui você faria a chamada real para sua API de login
      // const response = await api.post('/login', loginData);
      
      // Simulação de login bem-sucedido
      const token = 'fake-jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      
      const userData: User = {
        id: '1',
        name: 'Usuário',
        email: 'usuario@empresa.com',
        username: loginData.username,
        initials: loginData.username.substring(0, 2).toUpperCase()
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
      
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setActiveSection('dashboard');
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
        return <Sales darkMode={darkMode} />;
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
        background: darkMode ? '#0d1117' : '#ffffff'
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
        appName="SalesReport Pro"
      />
    );
  }

  return (
    <div className={darkMode ? 'dark-theme' : ''}>
      <Navbar 
        user={user!}
        onLogout={handleLogout}
        appName="SalesReport Pro"
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
        transition: 'margin-left 0.3s ease'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;