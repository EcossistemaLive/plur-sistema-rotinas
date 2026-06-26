import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './index.css';
import ReceptionDashboard from './components/ReceptionDashboard';
import OwnerDashboard from './components/OwnerDashboard';

// --- Credenciais de acesso ---
const CREDENTIALS = {
  gestor: { login: 'Gestor', password: 'Theo@0123', role: 'owner' },
  recepcao: { login: 'Recepcao', password: '123456', role: 'receptionist' },
};

const Login = ({ onLogin }) => {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const found = Object.values(CREDENTIALS).find(
      (c) =>
        c.login.toLowerCase() === loginInput.trim().toLowerCase() &&
        c.password === passwordInput
    );

    setTimeout(() => {
      if (found) {
        onLogin(found.role);
      } else {
        setError('Login ou senha incorretos. Tente novamente.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <span className="text-3xl font-black text-white tracking-tighter">P</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">PLUR</h1>
          <p className="text-indigo-300 text-sm mt-1">Sistema de Rotinas</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-1.5">Login</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Gestor ou Recepcao"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-1.5">Senha</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-2 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition mt-2 shadow-lg shadow-indigo-500/30"
            >
              {isLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          {/* Dica de acesso */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-indigo-300/70 text-center">Plur Academia · Sistema Interno</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [role, setRole] = useState(null); // 'receptionist' | 'owner' | null

  const handleLogin = (newRole) => {
    setRole(newRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 p-6 flex flex-col flex-shrink-0">
          <div className="text-2xl font-black text-gray-800 tracking-tight mb-8">
            PLUR
          </div>
          <nav className="flex-1 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              {role === 'owner' ? 'Visão Gestão' : 'Visão Operacional'}
            </div>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm">
              Painel de Controle Principal
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto text-sm text-red-500 hover:text-red-700 font-medium text-left px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Sair da Conta
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={
                role === 'owner'
                  ? <Navigate to="/owner" replace />
                  : <Navigate to="/reception" replace />
              }
            />
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route path="/owner" element={<OwnerDashboard />} />
            {/* Fallback */}
            <Route
              path="*"
              element={
                role === 'owner'
                  ? <Navigate to="/owner" replace />
                  : <Navigate to="/reception" replace />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
