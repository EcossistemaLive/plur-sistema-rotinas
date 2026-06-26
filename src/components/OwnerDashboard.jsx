import React, { useState, useEffect } from 'react';
import { initialSales } from '../data/mockData';
import { BarChart3, CalendarDays, TrendingUp, Users, Target, CheckCircle2, Clock, PlusCircle } from 'lucide-react';
import { addTask, db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import CalendarWidget from './CalendarWidget';

// Mock data for Owner metrics
const metrics = {
  routinesCompletedToday: 75, // percentage
  routinesCompletedWeek: 88,
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
  const [liveMetrics, setLiveMetrics] = useState({
    routinesCompletedToday: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let total = 0;
      let done = 0;
      querySnapshot.forEach((doc) => {
        total++;
        if (doc.data().status === 'done') {
          done++;
        }
      });
      setLiveMetrics({
        routinesCompletedToday: total > 0 ? Math.round((done / total) * 100) : 0
      });
    });
    return () => unsubscribe();
  }, []);
  
  const handleAddAdHocTask = async () => {
    if (!adHocTask.trim()) return;
    
    await addTask({
      title: 'Demanda do Gestor (Ad-Hoc)',
      category: 'Operacional',
      status: 'todo',
      description: adHocTask,
      isRecurring: false,
    });
    
    setAdHocTask(''); // Limpa o input
  };

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestão Plur</h1>
          <p className="text-slate-500">Visão estratégica e acompanhamento de equipe.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <CalendarDays size={20} className="text-indigo-500" />
          <span className="font-semibold text-slate-700">Hoje, 24 de Outubro</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold">Rotinas Concluídas (Hoje)</h3>
            <p className="text-3xl font-black text-slate-800">{liveMetrics.routinesCompletedToday}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${liveMetrics.routinesCompletedToday}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold">Alunos Ativos</h3>
            <p className="text-3xl font-black text-slate-800">{metrics.activeStudents}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Target size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold">Leads da Semana (AQÚI)</h3>
            <p className="text-3xl font-black text-slate-800">{metrics.newLeadsWeek}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Alta</span>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-semibold">Taxa de Conversão</h3>
            <p className="text-3xl font-black text-slate-800">{metrics.conversionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Delegação e Ad-Hoc */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlusCircle className="text-indigo-500" /> Delegação de Demandas (Ad-Hoc)
            </h2>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={adHocTask}
                onChange={(e) => setAdHocTask(e.target.value)}
                placeholder="Ex: Entrar em contato com o Contador Matheus para pedir faturamento..." 
                className="flex-1 border border-slate-300 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleAddAdHocTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                Delegar p/ Recepção
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">A tarefa aparecerá imediatamente na coluna "Para Hoje" no painel do recepcionista.</p>
          </div>

          <CalendarWidget />
        </div>

        {/* Right Column: Vendas Avulsas (Store-in-Store) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-emerald-500" /> Últimas Vendas de Balcão
          </h2>
          <p className="text-sm text-slate-500 mb-6">Conciliação automática via painel do recepcionista.</p>
          
          <div className="flex-1 space-y-4">
            {recentSalesMock.map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{sale.product}</h4>
                  <span className="text-xs text-slate-500">{sale.time} • {sale.method}</span>
                </div>
                <div className="font-black text-emerald-600">
                  R$ {sale.value}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-3 rounded-lg font-semibold transition text-sm">
            Ver Relatório Completo
          </button>
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
