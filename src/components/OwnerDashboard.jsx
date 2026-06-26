import React, { useState, useEffect } from 'react';
import { CalendarDays, TrendingUp, Users, Target, CheckCircle2, Clock, PlusCircle, Send, Loader2, CheckCheck, AlertCircle, X, Search } from 'lucide-react';
import { addTask, db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import CalendarWidget from './CalendarWidget';

const metrics = {
  activeStudents: 312,
  newLeadsWeek: 45,
  conversionRate: 62,
};

const recentSalesMock = [
  { id: 'v1', product: 'Açaí', value: '15,00', method: 'PIX', time: '10:45', date: '2026-06-26' },
  { id: 'v2', product: 'Energético', value: '10,00', method: 'Cartão de Débito', time: '12:30', date: '2026-06-26' },
  { id: 'v3', product: 'Marmita Saudável', value: '25,00', method: 'PIX', time: '13:15', date: '2026-06-26' },
];

const allSalesMock = [
  ...recentSalesMock,
  { id: 'v4', product: 'Camiseta Plur', value: '85,00', method: 'PIX', time: '16:00', date: '2026-06-25' },
  { id: 'v5', product: 'Energético', value: '10,00', method: 'PIX', time: '18:20', date: '2026-06-25' },
  { id: 'v6', product: 'Marmita Saudável', value: '25,00', method: 'Cartão de Crédito', time: '09:10', date: '2026-06-24' },
  { id: 'v7', product: 'Açaí', value: '20,00', method: 'PIX', time: '11:30', date: '2026-06-24' },
];

const OwnerDashboard = () => {
  const [adHocTask, setAdHocTask] = useState('');
  const [adHocDate, setAdHocDate] = useState('');
  const [adHocTime, setAdHocTime] = useState('');
  
  const [taskStatus, setTaskStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [liveMetrics, setLiveMetrics] = useState({ routinesCompletedToday: 0 });
  const [showSalesModal, setShowSalesModal] = useState(false);

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
        dueDate: adHocDate || null,
        dueTime: adHocTime || null,
      });
      setAdHocTask('');
      setAdHocDate('');
      setAdHocTime('');
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
        return <><Send size={16} /> Delegar</>;
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
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={adHocTask}
                onChange={(e) => setAdHocTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdHocTask()}
                placeholder="Ex: Ligar para o contador Matheus sobre o faturamento..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input 
                  type="date"
                  value={adHocDate}
                  onChange={(e) => setAdHocDate(e.target.value)}
                  className="flex-1 w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <input 
                  type="time"
                  value={adHocTime}
                  onChange={(e) => setAdHocTime(e.target.value)}
                  className="flex-1 w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <button
                  onClick={handleAddAdHocTask}
                  disabled={taskStatus === 'saving' || !adHocTask.trim()}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-3 rounded-lg font-bold transition text-sm whitespace-nowrap ${getButtonClass()}`}
                >
                  {getButtonContent()}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <AlertCircle size={12}/> A tarefa com data e hora notifica o recepcionista automaticamente no horário estipulado.
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
          <p className="text-xs text-slate-500 mb-5">Registradas pelo recepcionista hoje.</p>

          <div className="flex-1 space-y-3">
            {recentSalesMock.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg hover:shadow-sm transition">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{sale.product}</h4>
                  <span className="text-xs text-slate-400">{sale.time} · {sale.method}</span>
                </div>
                <div className="font-black text-emerald-600 text-sm">R$ {sale.value}</div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowSalesModal(true)}
            className="w-full mt-5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-3 rounded-lg font-semibold transition text-sm"
          >
            Ver Relatório Completo
          </button>
        </div>
      </div>

      {/* Modal de Relatório de Vendas */}
      {showSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Relatório Completo de Vendas</h2>
                <p className="text-sm text-slate-500">Histórico de vendas de balcão (Store-in-Store)</p>
              </div>
              <button onClick={() => setShowSalesModal(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por produto, data ou método..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Exportar CSV
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Data e Hora</th>
                    <th className="pb-3 font-semibold">Produto</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {allSalesMock.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                      <td className="py-4 text-slate-600">{sale.date} às {sale.time}</td>
                      <td className="py-4 font-semibold text-slate-700">{sale.product}</td>
                      <td className="py-4 text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                          {sale.method}
                        </span>
                      </td>
                      <td className="py-4 font-black text-emerald-600 text-right">R$ {sale.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
              <span className="text-sm font-semibold text-slate-500">Total filtrado:</span>
              <span className="text-2xl font-black text-emerald-600">R$ 155,00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
