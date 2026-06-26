export const initialTasks = [
  {
    id: 't1',
    title: 'Controle de Catraca / Next Fit',
    category: 'Operacional',
    status: 'todo',
    description: 'Verificar se visitantes e alunos de capoeira estão com Plano Custo R$ 0,00 no sistema para não travar a catraca indevidamente.',
    isRecurring: true,
  },
  {
    id: 't2',
    title: 'Cobrança de Inadimplentes (Inativos)',
    category: 'Financeiro',
    status: 'todo',
    description: 'Abordar alunos inativos. Lembre-se: A primeira opção SEMPRE deve ser Cartão de Crédito. Recorrência manual é a última opção.',
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
    status: 'todo',
    description: 'Enviar mensagens para os novos seguidores no Instagram. Usar tom convidativo ("flerte comercial").',
    isRecurring: true,
  },
  {
    id: 't4',
    title: 'Fechamento Diário: Contagem de Estoque',
    category: 'Operacional',
    status: 'todo',
    description: 'Fazer a contagem de estoque da geladeira de bebidas (Açaí, Marmitas, Energéticos) ao fechar a academia e conciliar o PIX.',
    isRecurring: true,
  }
];

export const initialSales = [];
