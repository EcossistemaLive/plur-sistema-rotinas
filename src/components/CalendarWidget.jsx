import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, addEvent } from '../firebase';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { initialTasks } from '../data/mockData';

const CalendarWidget = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Pessoal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Escuta a coleção events
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const eventsData = [];
        querySnapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        eventsData.sort((a, b) => (a.date > b.date ? 1 : -1));
        setEvents(eventsData);
      },
      (err) => console.error('Firestore events error:', err)
    );
    return () => unsubscribe();
  }, []);

  // Escuta a coleção tasks para exibir demandas delegadas no calendário
  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tasksData = [];
        querySnapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksData);
      },
      (err) => console.error('Firestore tasks error:', err)
    );
    return () => unsubscribe();
  }, []);

  const toLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;
    setIsSaving(true);
    setSaveMsg('');

    try {
      await addEvent({
        title: newEventTitle.trim(),
        type: newEventType,
        date: toLocalDateString(date),
      });
      setNewEventTitle('');
      setSaveMsg('✅ Compromisso salvo!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      setSaveMsg('❌ Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedDateString = toLocalDateString(date);
  const selectedDayEvents = events.filter((e) => e.date === selectedDateString);
  const selectedDayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ...

  // Demandas delegadas (do firebase) agendadas para o dia selecionado
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDateString);
  
  // Rotinas do mockData agendadas para o dia da semana selecionado
  const selectedDayRoutines = initialTasks.filter((t) => t.repeatDays && t.repeatDays.includes(selectedDayOfWeek));

  const combinedItems = [
    ...selectedDayEvents.map(e => ({ ...e, isTask: false })),
    ...selectedDayTasks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      type: 'Demanda', 
      time: t.dueTime, 
      isTask: true 
    })),
    ...selectedDayRoutines.map(t => ({
      id: t.id,
      title: t.title,
      type: 'Rotina',
      isTask: true
    }))
  ];

  // Bolinhas coloridas nos dias com eventos/tarefas
  const tileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dString = toLocalDateString(tileDate);
      const dayOfWeek = tileDate.getDay();
      
      const dayEvents = events.filter((e) => e.date === dString);
      const dayTasks = tasks.filter((t) => t.dueDate === dString);
      const dayRoutines = initialTasks.filter((t) => t.repeatDays && t.repeatDays.includes(dayOfWeek));
      
      const dots = [
        ...dayEvents,
        ...dayTasks.map(t => ({ type: 'Demanda' })),
        ...dayRoutines.map(t => ({ type: 'Rotina' }))
      ];

      if (dots.length > 0) {
        // Mostra no max 3 bolinhas para não poluir
        return (
          <div className="flex justify-center mt-0.5 gap-0.5 flex-wrap">
            {dots.slice(0, 3).map((e, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  e.type === 'Aula' ? 'bg-orange-500' : 
                  e.type === 'Fisioterapia' ? 'bg-blue-500' : 
                  e.type === 'Evento' ? 'bg-purple-500' : 
                  e.type === 'Demanda' ? 'bg-indigo-500' :
                  e.type === 'Rotina' ? 'bg-slate-400' : 'bg-slate-400'
                }`}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Aula': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'Fisioterapia': return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'Evento': return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'Demanda': return 'border-indigo-500 text-indigo-700 bg-indigo-50';
      case 'Rotina': return 'border-slate-400 text-slate-700 bg-slate-50';
      default: return 'border-slate-400 text-slate-700 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CalendarIcon size={20} className="text-indigo-500" /> Agenda Plur &amp; Gestão
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendário */}
        <div>
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            locale="pt-BR"
            className="w-full rounded-xl border border-slate-200 shadow-sm"
          />
        </div>

        {/* Painel lateral */}
        <div className="flex flex-col gap-4">
          {/* Eventos do dia selecionado */}
          <div>
            <h3 className="font-bold text-slate-700 mb-3 border-b pb-2 text-sm">
              📅 {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </h3>
            <div className="space-y-2 min-h-[80px]">
              {combinedItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  Nenhum compromisso neste dia.
                </p>
              ) : (
                combinedItems.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-lg border-l-4 ${getTypeColor(evt.type)}`}
                  >
                    <div className="font-semibold text-sm">{evt.title}</div>
                    <div className="text-xs mt-0.5 font-bold uppercase tracking-wider opacity-60">
                      {evt.type} {evt.time ? `• ${evt.time}` : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Formulário para adicionar evento */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
            <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-1">
              <Plus size={15} /> Novo Compromisso
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ex: Reunião com fornecedor"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
              />
              <div className="flex gap-2">
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="border border-slate-300 rounded-lg p-2.5 text-sm flex-1 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="Pessoal">👤 Pessoal (Gestor)</option>
                  <option value="Aula">🏋️ Aula Especial/Cross</option>
                  <option value="Fisioterapia">💆 Viva Fisio</option>
                  <option value="Evento">🎉 Evento Plur</option>
                </select>
                <button
                  onClick={handleAddEvent}
                  disabled={isSaving || !newEventTitle.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap"
                >
                  {isSaving ? '...' : 'Salvar'}
                </button>
              </div>
              {saveMsg && (
                <p className="text-xs font-semibold text-center">{saveMsg}</p>
              )}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/> Aula</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Fisio</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/> Evento</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block"/> Pessoal / Rotina</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/> Demanda Delegada</span>
          </div>
        </div>
      </div>

      {/* Estilos globais do react-calendar */}
      <style>{`
        .react-calendar {
          border: none !important;
          font-family: inherit;
          width: 100% !important;
        }
        .react-calendar__tile--active {
          background: #4f46e5 !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-calendar__tile--now {
          background: #e0e7ff !important;
          border-radius: 8px;
        }
        .react-calendar__tile:hover {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .react-calendar__tile {
          padding: 0.6em 0.4em;
          border-radius: 6px;
        }
        .react-calendar__navigation button:hover {
          background: #f1f5f9;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
