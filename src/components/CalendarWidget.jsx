import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar as CalendarIcon, Plus, MapPin } from 'lucide-react';

const CalendarWidget = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Pessoal'); // Pessoal, Aula, Fisioterapia, Evento

  // Listen to events on Firebase
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;

    try {
      await addDoc(collection(db, 'events'), {
        title: newEventTitle,
        type: newEventType,
        // Save the date as YYYY-MM-DD string for easy comparison
        date: date.toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setNewEventTitle('');
    } catch (error) {
      console.error("Erro ao adicionar evento: ", error);
    }
  };

  // Pega os eventos da data selecionada
  const selectedDateString = date.toISOString().split('T')[0];
  const selectedDayEvents = events.filter(e => e.date === selectedDateString);

  // Função para adicionar bolinhas no calendário nos dias que têm eventos
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dString = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date === dString);
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center mt-1 gap-1">
            {dayEvents.map((e, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                e.type === 'Aula' ? 'bg-orange-500' :
                e.type === 'Fisioterapia' ? 'bg-blue-500' :
                e.type === 'Evento' ? 'bg-purple-500' : 'bg-slate-500'
              }`} />
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
      default: return 'border-slate-500 text-slate-700 bg-slate-50'; // Pessoal
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CalendarIcon className="text-indigo-500" /> Agenda Plur & Gestão
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendário */}
        <div className="calendar-container">
          <Calendar 
            onChange={setDate} 
            value={date} 
            tileContent={tileContent}
            className="w-full border-none shadow-sm rounded-lg p-2 font-sans"
          />
        </div>

        {/* Eventos do Dia */}
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">
            Compromissos para {date.toLocaleDateString('pt-BR')}
          </h3>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum evento programado para este dia.</p>
            ) : (
              selectedDayEvents.map(evt => (
                <div key={evt.id} className={`p-3 rounded-lg border-l-4 ${getTypeColor(evt.type)}`}>
                  <div className="font-bold text-sm">{evt.title}</div>
                  <div className="text-xs mt-1 font-semibold uppercase tracking-wider opacity-80">{evt.type}</div>
                </div>
              ))
            )}
          </div>

          {/* Adicionar Novo Evento */}
          <div className="mt-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-1"><Plus size={16}/> Novo Compromisso</h4>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Título (ex: Reunião Equipe)" 
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex gap-2">
                <select 
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value)}
                  className="border border-slate-300 rounded p-2 text-sm flex-1 bg-white"
                >
                  <option value="Pessoal">Pessoal (Gestor)</option>
                  <option value="Aula">Aula Especial/Cross</option>
                  <option value="Fisioterapia">Viva Fisio</option>
                  <option value="Evento">Evento Plur</option>
                </select>
                <button 
                  onClick={handleAddEvent}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-bold transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Estilos customizados para deixar o react-calendar bonito */}
      <style>{`
        .react-calendar {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }
        .react-calendar__tile--active {
          background: #4f46e5 !important; /* indigo-600 */
          color: white;
          border-radius: 0.25rem;
        }
        .react-calendar__tile--now {
          background: #f1f5f9;
          border-radius: 0.25rem;
        }
        .react-calendar__tile {
          padding: 0.75em 0.5em;
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
