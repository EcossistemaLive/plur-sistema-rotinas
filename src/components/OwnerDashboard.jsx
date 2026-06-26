import React, { useState, useEffect } from 'react';
import { CalendarDays, TrendingUp, Users, Target, CheckCircle2, Clock, PlusCircle, Send, Loader2, CheckCheck, AlertCircle } from 'lucide-react';
import { addTask, db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import CalendarWidget from './CalendarWidget';

const metrics = {
  activeStudents: 312,
  newLeadsWeek: 45,
  conversionRate: 62,
};

const recentSalesMock = [
  { id: 'v1', product: 'Açaí', value: '15,00', method: 'PIX', time: '10:45' },
  { id: 'v2', product: 'Energético', value: '10,00', method: 'Cartão de Débito', time: '12:30' },
  { id: 'v3', product: 'Marmita Saudável', value: '25,00', method: 'PIX', time: '13:15' },
];

const OwnerDashboard = () => {
  const [adHocTask, setAdHocTask] = useState('');
  const [taskStatus, setTaskStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [liveMetrics, setLiveMetrics] = useState({ routinesCompletedToday: 0 });
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  // Listener em tempo real das tarefas para calcular % de produtividade
  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let total = 0;
        let done = 0;
        snapshot.forEach((doc) => {
          total++;
          if (doc.data().status === 'done') done++;
        });
        setLiveMetrics({
          routinesCompletedToday: total > 0 ? Math.round((done / total) * 100) : 0,
        });
      },
      (err) => console.error('Firestore tasks listener error:', err)
    );
    return () => unsubscribe();
  }, []);

  const handleAddAdHocTask = async () => {
    if (!adHocTask.trim() || taskStatus === 'saving') return;

    setTaskStatus('saving');
    try {
      await addTask({
        title: adHocTask.trim(),
        category: 'Operacional',
        status: 'todo',
        description: adHocTask.trim(),
        isRecurring: false,
        source: 'gestor',
      });
      setAdHocTask('');
      setTaskStatus('success');
      setTimeout(() => setTaskStatus('idle'), 3000);
    } catch (err) {
      console.error('Erro ao salvar demanda:', err);
      setTaskStatus('error');
      setTimeout(() => setTaskStatus('idle'), 4000);
    }
  };

  const getButtonContent = () => {
    switch (taskStatus) {
      case 'saving':
        return <><Loader2 size={16} className="animate-spin" /> Salvando...</>;
      case 'success':
        return <><CheckCheck size={16} /> Delegado!</>;
      case 'error':
        return <><AlertCircle size={16} /> Erro! Tente novamente</>;
      default:
        return <><Send size={16} /> Delegar p/ Recepção</>;
    }
  };

  const getButtonClass = () => {
    switch (taskStatus) {
      case 'saving': return 'bg-indigo-400 cursor-wait';
      case 'success': return 'bg-emerald-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão Plur</h1>
          <p className="text-slate-500 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <CalendarDays size={20} className="text-indigo-500" />
          <span className="font-semibold text-slate-700 text-sm">Painel do Gestor</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle2 size={22} /></div>
          </div>
          <h3 className="text-slate-500 text-xs font-semibold">Rotinas Concluídas</h3>
          <p className="text-3xl font-black text-slate-800">{liveMetrics.routinesCompletedToday}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${liveMetrics.routinesCompletedToday}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 inline-block mb-3"><Users size={22} /></div>
          <h3 className="text-slate-500 text-xs font-semibold">Alunos Ativos</h3>
          <p className="text-3xl font-black text-slate-800">{metrics.activeStudents}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600 inline-block mb-3"><Target size={22} /></div>
          <h3 className="text-slate-500 text-xs font-semibold">Leads (AQÚI)</h3>
          <p className="text-3xl font-black text-slate-800">{metrics.newLeadsWeek}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600 inline-block mb-3"><TrendingUp size={22} /></div>
          <h3 className="text-slate-500 text-xs font-semibold">Taxa de Conversão</h3>
          <p className="text-3xl font-black text-slate-800">{metrics.conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delegação de Demandas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-indigo-500" /> Delegação de Demandas (Ad-Hoc)
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={adHocTask}
                onChange={(e) => setAdHocTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdHocTask()}
                placeholder="Ex: Ligar para o contador Matheus sobre o faturamento..."
                className="flex-1 border border-slate-300 rounded-lg p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <button
                onClick={handleAddAdHocTask}
                disabled={taskStatus === 'saving' || !adHocTask.trim()}
                className={`flex items-center gap-2 text-white px-5 py-3 rounded-lg font-bold transition text-sm whitespace-nowrap ${getButtonClass()}`}
              >
                {getButtonContent()}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              A tarefa aparece instantaneamente no Kanban da Recepção via Firebase.
            </p>
          </div>

          {/* Calendário */}
          <CalendarWidget />
        </div>

        {/* Coluna Lateral: Vendas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Clock size={18} className="text-emerald-500" /> Últimas Vendas de Balcão
          </h2>
          <p className="text-xs text-slate-500 mb-5">Registradas pelo recepcionista.</p>

          <div className="flex-1 space-y-3">
            {recentSalesMock.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{sale.product}</h4>
                  <span className="text-xs text-slate-400">{sale.time} · {sale.method}</span>
                </div>
                <div className="font-black text-emerald-600 text-sm">R$ {sale.value}</div>
              </div>
            ))}
          </div>

          <button className="w-full mt-5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-3 rounded-lg font-semibold transition text-sm">
            Ver Relatório Completo
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
