import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './index.css';
import ReceptionDashboard from './components/ReceptionDashboard';
import OwnerDashboard from './components/OwnerDashboard';

const Login = ({ onLogin }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Login Plur</h2>
      <button 
        onClick={() => onLogin('receptionist')}
        className="w-full bg-blue-500 text-white p-3 rounded-lg mb-3 hover:bg-blue-600 transition"
      >
        Entrar como Recepção
      </button>
      <button 
        onClick={() => onLogin('owner')}
        className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
      >
        Entrar como Gestor
      </button>
    </div>
  </div>
);

function App() {
  const [role, setRole] = useState(null); // 'receptionist' | 'owner' | null

  if (!role) {
    return <Login onLogin={setRole} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Simple Sidebar mock */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="text-2xl font-black text-gray-800 tracking-tight mb-8">
            PLUR
          </div>
          <nav className="flex-1 space-y-2">
            {/* Nav items would go here based on role */}
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {role === 'owner' ? 'Visão Gestão' : 'Visão Operacional'}
            </div>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">
              Dashboard Principal
            </button>
          </nav>
          <button 
            onClick={() => setRole(null)}
            className="mt-auto text-sm text-red-500 hover:text-red-700 font-medium text-left px-4 py-2"
          >
            Sair da Conta
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              role === 'owner' ? <Navigate to="/owner" /> : <Navigate to="/reception" />
            } />
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route path="/owner" element={<OwnerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
