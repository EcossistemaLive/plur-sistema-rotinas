import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpzXl0CXHNigHrRSEOUxTXlTmhkN7YqGI",
  authDomain: "rotinas-plur.firebaseapp.com",
  projectId: "rotinas-plur",
  storageBucket: "rotinas-plur.firebasestorage.app",
  messagingSenderId: "838855542344",
  appId: "1:838855542344:web:5752e9220c1a01f4e63a7d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testUpdate() {
  const initialTasks = [
    {
      id: 't2',
      title: 'Cobrança de Inadimplentes (Inativos)',
      category: 'Financeiro',
      status: 'todo',
      description: 'Abordar alunos inativos.',
      isRecurring: true,
      repeatDays: [1, 2, 3, 4, 5],
      source: 'routine',
      students: [
        { id: 's1', name: 'João Silva', tenure: 'Novato (1 mês)', plan: 'Cross 3x Mensal', tags: ['neutro'] }
      ]
    }
  ];

  const todayString = new Date().toISOString().split('T')[0];
  const t = initialTasks[0];
  const specificId = `${t.id}_${todayString}`;

  const taskData = { ...t, id: specificId };
  console.log('Trying to setDoc with id', specificId, 'and status done');

  try {
    const cleanData = JSON.parse(JSON.stringify(taskData));
    await setDoc(doc(db, 'tasks', specificId), { ...cleanData, status: 'done' }, { merge: true });
    console.log('setDoc succeeded!');

    const snap = await getDocs(query(collection(db, 'tasks')));
    snap.forEach(d => console.log(d.id, d.data()));
  } catch (error) {
    console.error('setDoc failed:', error);
  }
  process.exit(0);
}

testUpdate();
