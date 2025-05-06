// src/App.jsx
import { useState, useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';
import { motion } from 'framer-motion';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('quiz');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Senha simples para acesso ao dashboard (em um aplicativo real, isso seria implementado com autenticação adequada no backend)
  const ADMIN_PASSWORD = 'jesuserei';

  useEffect(() => {

    if (PIXEL_ID) { // Só inicializa se o PIXEL_ID estiver definido
      ReactPixel.init(820695673290716, null, options); // O segundo argumento é para 'advancedMatching', pode ser null ou {} se não usado
      ReactPixel.pageView(); // Rastreia a visualização da página inicial
      console.log('Facebook Pixel inicializado e PageView disparado!');
    }
    // Verificar se o usuário já está logado como admin
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }

    // Verificar a rota atual baseado na URL
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else {
      // Qualquer outra rota, inclusive a raiz, mostra o quiz
      setCurrentView('quiz');
    }
  }, []);

  // Altera a URL quando a visualização muda
  useEffect(() => {
    if (currentView === 'quiz') {
      window.history.pushState({}, '', '/');
    } else if (currentView === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [currentView]);

  // Função para lidar com o login do admin
  const handleAdminLogin = () => {
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError('');
      setCurrentView('dashboard');
      localStorage.setItem('isAdmin', 'true');
    } else {
      setLoginError('Senha incorreta. Tente novamente.');
    }
  };

  // Função para sair da conta admin
  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('quiz');
    localStorage.removeItem('isAdmin');
  };

  // Renderiza o modal de login
  const renderLoginModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Acesso ao Dashboard</h2>
            <button
              onClick={() => setShowLoginModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">Senha de Administrador</label>
            <input
              type="password"
              id="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a senha"
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            {loginError && (
              <p className="text-red-400 mt-2 text-sm">{loginError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowLoginModal(false)}
              className="mr-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdminLogin}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
            >
              Entrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Renderizar a barra de navegação
  const renderNavbar = () => {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-lg z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500 mx-0.5"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mx-0.5"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 mx-0.5"></div>
            </div>
            <h1 className="text-xl font-bold text-white">Quiz de Qualificação</h1>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin ? (
              <>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentView === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  onClick={() => setCurrentView('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentView === 'quiz'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  onClick={() => setCurrentView('quiz')}
                >
                  Quiz
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-700 text-white hover:bg-red-600"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700"
                onClick={() => setShowLoginModal(true)}
              >
                Área Admin
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar a visualização atual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'quiz':
        return <Quiz />;
      case 'dashboard':
        return isAdmin ? <Dashboard /> : <Quiz />;
      default:
        return <Quiz />;
    }
  };

  return (
    <div className="pt-12">
      {renderNavbar()}
      {renderCurrentView()}
      {renderLoginModal()}
    </div>
  );
}

export default App;