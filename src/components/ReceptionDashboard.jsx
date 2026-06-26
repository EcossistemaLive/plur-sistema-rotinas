import React, { useState, useEffect } from 'react';
import { initialTasks } from '../data/mockData';
import { Sparkles, MessageCircle, DollarSign, CheckCircle2, Circle, AlertCircle, ShoppingBag } from 'lucide-react';
import { db, updateTaskStatus as updateDbTaskStatus } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import CalendarWidget from './CalendarWidget';

const ReceptionDashboard = () => {
  const [tasks, setTasks] = useState([]); // Inicia vazio, será populado pelo Firebase
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dbTasks = [];
      querySnapshot.forEach((doc) => {
        dbTasks.push({ id: doc.id, ...doc.data() });
      });
      
      const currentDay = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ...
      
      // Filtra as rotinas do mockData baseadas no dia atual da semana
      const todaysRoutines = initialTasks.filter(t => t.repeatDays && t.repeatDays.includes(currentDay));

      // Combina as rotinas de hoje com as demandas delegadas (que vêm do DB)
      setTasks([...todaysRoutines, ...dbTasks]);
    });

    return () => unsubscribe();
  }, []);

  const updateTaskStatus = async (id, newStatus) => {
    // Se for uma tarefa mock (sem id do firebase), não atualiza no DB
    if (id.startsWith('t')) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } else {
      await updateDbTaskStatus(id, newStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'border-l-gray-300';
      case 'in_progress': return 'border-l-blue-500';
      case 'done': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Financeiro': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">Financeiro</span>;
      case 'Operacional': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">Operacional</span>;
      case 'Atendimento': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">Atendimento</span>;
      default: return null;
    }
  };

  const isTaskLateOrImminent = (date, time) => {
    if (!date || !time) return false;
    const now = new Date();
    const taskDate = new Date(`${date}T${time}:00`);
    // Se a data/hora for no passado ou nos próximos 15 minutos, e não estiver pronta
    const diffMin = (taskDate - now) / 60000;
    return diffMin <= 15;
  };

  const renderTaskCard = (task) => {
    const isDelegated = task.source === 'gestor';
    const isLate = isDelegated && task.status !== 'done' && isTaskLateOrImminent(task.dueDate, task.dueTime);

    return (
      <div key={task.id} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-l-4 ${getStatusColor(task.status)} mb-3 flex flex-col gap-3 relative overflow-hidden`}>
        {isLate && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 animate-pulse">
            <AlertCircle size={10} /> Urgente
          </div>
        )}

        <div className="flex justify-between items-start mt-1">
          <h4 className={`font-bold ${isLate ? 'text-red-700' : 'text-gray-800'}`}>{task.title}</h4>
          {getCategoryBadge(task.category)}
        </div>
        
        {isDelegated && (task.dueDate || task.dueTime) && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded">
            <Sparkles size={12} />
            Agendado para: {task.dueDate ? new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR').substring(0,5) : 'Hoje'} {task.dueTime ? `às ${task.dueTime}` : ''}
          </div>
        )}

        <p className="text-sm text-gray-600">{task.description}</p>
        
        {/* Detalhamento de Inadimplentes (Se for a tarefa de cobrança) */}
        {task.students && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2 space-y-3">
            {task.students.map(student => (
              <div key={student.id} className="flex flex-col gap-2 p-2 bg-white rounded border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{student.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${student.tags.includes('descontraido') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {student.tenure}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{student.plan}</p>
                <button className="flex items-center justify-center gap-1 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-md text-xs font-medium transition">
                  <Sparkles size={14} />
                  Pedir Ajuda à Laila (Script {student.tags.includes('descontraido') ? 'Descontraído' : 'Neutro'})
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded text-xs font-semibold mt-2">
              <AlertCircle size={16} />
              Regra de Ouro: Ofereça Cartão de Crédito primeiro!
            </div>
          </div>
        )}

        {/* Ações de Status */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
          {task.status !== 'todo' && (
            <button onClick={() => updateTaskStatus(task.id, 'todo')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              <Circle size={14} /> Fazer
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
              <MessageCircle size={14} /> Em Andamento
            </button>
          )}
          {task.status !== 'done' && (
            <button onClick={() => updateTaskStatus(task.id, 'done')} className="flex items-center gap-1 text-xs text-green-500 hover:text-green-700 ml-auto font-medium">
              <CheckCircle2 size={16} /> Concluir
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Recepção Plur</h1>
          <p className="text-gray-500">Acolhimento, organização e consistência.</p>
        </div>
        <button 
          onClick={() => setIsStoreModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-md font-bold transition transform hover:scale-105"
        >
          <DollarSign size={20} />
          Novo Lançamento Avulso (PIX)
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Coluna: Para Hoje */}
        <div className="flex flex-col bg-gray-100 rounded-xl p-4 h-full">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Circle size={18} className="text-gray-400" />
            Para Hoje ({tasks.filter(t => t.status === 'todo').length})
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {tasks.filter(t => t.status === 'todo').map(renderTaskCard)}
          </div>
        </div>

        {/* Coluna: Em Andamento */}
        <div className="flex flex-col bg-blue-50 rounded-xl p-4 h-full border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-500" />
            Em Andamento ({tasks.filter(t => t.status === 'in_progress').length})
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {tasks.filter(t => t.status === 'in_progress').map(renderTaskCard)}
          </div>
        </div>

        {/* Coluna: Concluído */}
        <div className="flex flex-col bg-green-50 rounded-xl p-4 h-full border border-green-100">
          <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            Concluído ({tasks.filter(t => t.status === 'done').length})
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {tasks.filter(t => t.status === 'done').map(renderTaskCard)}
          </div>
        </div>
      </div>

      {/* Modal Store-in-Store (Simples) */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Venda de Balcão</h2>
                <p className="text-sm text-gray-500">Registre saídas de Açaí/Energéticos.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Produto Vendido</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <option>Açaí</option>
                  <option>Marmita Saudável</option>
                  <option>Energético / Bebida</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor (R$)</label>
                <input type="number" placeholder="Ex: 15,00" className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Forma de Pagamento</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <option>PIX</option>
                  <option>Cartão de Crédito</option>
                  <option>Cartão de Débito</option>
                  <option>Dinheiro</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsStoreModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition">
                Cancelar
              </button>
              <button onClick={() => setIsStoreModalOpen(false)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition">
                Registrar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendário da Recepção */}
      <div className="mt-8">
        <CalendarWidget />
      </div>

    </div>
  );
};

export default ReceptionDashboard;
