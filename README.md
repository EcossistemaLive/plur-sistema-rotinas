# Sistema de Gestão de Rotinas - Plur Movimento

Este projeto consiste em um painel operacional e estratégico desenvolvido sob medida para a **Plur Movimento**, unificando as dinâmicas de recepção humana e inteligência artificial (Laila) em uma interface web focada na metodologia de "Corpos Plurais" e atendimento "AQÚI".

---

## 1. Contexto e Filosofia da Empresa
* **Foco:** Saúde mental, movimento sem dor e comunidade ("Corpos Plurais"). Não é focado em estética "No Pain No Gain".
* **Serviços:** CrossFit adaptado, Fisioterapia (Viva Fisio) e Capoeira.
* **Linguagem:** Empática, "flerte comercial" respeitoso, acolhedora.
* **Agente IA (Laila):** Trabalha via WhatsApp/Instagram fazendo contato AQÚI (Acolhimento, Qualificação, Única Coisa, Incentivo).

## 2. A Ferramenta Desenvolvida (V1 - Front-end)
Foi desenvolvido um sistema visual React + TailwindCSS com duas perspectivas primárias (separação de responsabilidade - *Role-Based*):

### Visão do Recepcionista (Operacional)
Um Kanban/Checklist projetado para guiar a rotina do recepcionista para evitar agendamentos cruzados e desatenção, focando em redução da carga cognitiva:
*   **Rotinas:** Lembretes de contagem de estoque (Store-in-store) na abertura e fechamento.
*   **Gestão Financeira:** Lembrete da *Regra de Ouro* (Primeira opção de pagamento é Cartão de Crédito).
*   **Integração IA:** Acesso à geração de scripts pela *Laila*, formatando o tom (Neutro vs. Descontraído) com base no tempo de casa do aluno.
*   **Store-in-Store:** Botão de acesso rápido para lançamento de PIX e vendas avulsas de balcão (Açaí, Marmitas, Energéticos).

### Visão do Gestor / Proprietário (Estratégico)
Um Dashboard analítico que serve como termômetro da empresa e central de delegações:
*   **Métricas:** Acompanhamento do % de conclusão de rotinas diárias/semanais.
*   **Comercial:** Visão do Funil de Leads e Taxa de Conversão.
*   **Delegação Ad-Hoc:** Campo para injetar demandas instantâneas no Kanban do recepcionista.
*   **Log Financeiro:** Tabela auditável listando todas as vendas de balcão (Store-in-store).

---

## 3. Arquitetura Tecnológica e Stack
*   **Front-end:** React.js, Vite, Tailwind CSS (via plugin `@tailwindcss/vite`), e Lucide React para ícones.
*   **Back-end & Banco de Dados (Configurado para Fase 2):** Google Firebase (Firestore para dados e Auth para autenticação de papéis).
*   **Hospedagem atual:** O sistema é renderizado client-side e está publicado via **GitHub Pages** (Branch: `gh-pages`), permitindo acesso imediato.
*   **Repositório:** [https://github.com/EcossistemaLive/plur-sistema-rotinas](https://github.com/EcossistemaLive/plur-sistema-rotinas)

## 4. Histórico de Implantação e Contorno de Erros (25 de Junho de 2026)
1. Tentativa de update inicial do CLI `Aiox` interceptada devido à ausência do `rsync` no Windows local. O PM resolveu convertendo o comando para um script de clonagem/sync em PowerShell.
2. Setup limpo do Vite React via `cmd.exe` + npm na pasta local devido às restrições de Execution Policy do PowerShell.
3. Tentativas de deploy via npm `gh-pages` falharam no Windows Dev env por causa da segurança do `.git` (*dubious ownership*).
4. Solução: Deploy manual da compilação de produção (`dist`) diretamente para a branch órfã `gh-pages`, garantindo a integridade do CI/CD com o Github Pages.

## 5. Próximos Passos (Fase 2 / Futuro Roadmap)
*   [ ] Inserir credenciais reais do Firebase no arquivo `.env` para desbloquear login e sincronização multi-dispositivos.
*   [ ] Integrar APIs do **Next Fit** para puxar lista real de inadimplentes e relatórios de alunos na catraca.
*   [ ] Habilitar envio de prompts dinâmicos e disparo de webhooks para o back-end da Laila (IA) ao apertar o botão "Pedir Ajuda à IA".
