export const initialTasks = [
  {
    id: 't1',
    title: 'Contagem de Estoque - Abertura',
    category: 'Operacional',
    status: 'todo',
    description: 'Contar Açaí, Marmitas e Energéticos na geladeira.',
    isRecurring: true,
  },
  {
    id: 't2',
    title: 'Cobrança de Inadimplentes (Inativos)',
    category: 'Financeiro',
    status: 'todo',
    description: 'Entrar em contato com os alunos inativos. Lembre-se: Ofereça Cartão de Crédito primeiro.',
    isRecurring: true,
    students: [
      { id: 's1', name: 'João Silva', tenure: 'Novato (1 mês)', plan: 'Cross 3x Mensal', tags: ['neutro'] },
      { id: 's2', name: 'Maria Souza', tenure: 'Veterana (4 anos)', plan: 'Cross 5x Anual', tags: ['descontraido'] },
    ]
  },
  {
    id: 't3',
    title: 'Boas vindas aos novos seguidores',
    category: 'Atendimento',
    status: 'in_progress',
    description: 'Usar o tom de "flerte comercial", instigando o agendamento de experimental.',
    isRecurring: true,
  },
  {
    id: 't4',
    title: 'Contagem de Estoque - Fechamento',
    category: 'Operacional',
    status: 'todo',
    description: 'Contar Açaí, Marmitas e Energéticos na geladeira e conciliar com PIX/Vendas.',
    isRecurring: true,
  }
];

export const initialSales = [];
