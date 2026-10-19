# Sistema de Gestão e Monitoramento de Fluxo de Ordens de Serviço (BPMN) + OCR Inteligente para O.S. em Papel

Sistema web completo para digitalização, extração inteligente de dados (OCR via visão computacional), orquestração de fluxo operacional e análise de desempenho em tempo real, cobrindo integralmente as raias de **Produção**, **Comercial**, **Responsável pelo Cliente** e **Faturamento** do processo industrial de O.S.

---

### Decisões e Requisitos Confirmados com o Usuário

> [!IMPORTANT]
> - **Extração de Dados OCR (O.S. em Papel)**: Como as Ordens de Serviço nascem preenchidas à mão em formulários físicos de papel, o sistema terá um módulo de **Captura e OCR Multimodal**, permitindo fotografar ou fazer upload da ficha física, com preenchimento automático inteligente de campos e conferência lado a lado.
> - **Entrega de Notificações**: Feed de atividades em tempo real com avisos visuais integrados (toasts de transição, alertas de gargalo e painel de eventos recentes).
> - **Visualização e Transição de O.S.**: Quadro Kanban inteligente segmentado por setor com alternador rápido de perfil/colaborador (Produção, Comercial, Responsável pelo Cliente, Faturamento e Gestor Geral).
> - **Foco dos Relatórios de Desempenho**: Tempo médio por etapa, diagnóstico de gargalos operacionais e produtividade individual dos colaboradores com tempos de ciclo e retrabalhos.

---

## 1. Visão Geral e Conceito Central

### O que o sistema faz
1. **Digitalização & OCR de Fichas Físicas (Início no Papel)**:
   - O operador na Produção fotografa ou anexa a folha física da O.S.
   - O motor de OCR multimodal extrai automaticamente: *Número da O.S., Cliente, Telefone/Contato, Equipamento, Marca/Modelo, Número de Série, Defeito Reclamado, Data de Entrada e Técnico Inicial*.
   - Interface de conferência lado a lado (*Split-View*): a foto original é exibida junto aos campos editáveis com marcadores de confiança, respondendo diretamente ao primeiro gateway do diagrama: *"A O.S. foi preenchida corretamente?"*.
2. **Ciclo Completo de Abertura de O.S.**:
   - Transmissão digital para o Comercial: inserção instantânea na planilha central de controle, geração e impressão de etiquetas/ficha de teste, retorno à Produção para elaboração do laudo técnico, orçamentação e envio da proposta comercial ao cliente.
3. **Ciclo Completo de Encerramento de O.S.**:
   - Finalização do reparo na bancada, validação obrigatória do carimbo "Pronto" (com gateway de rejeição e retorno se faltar conformidade), baixa no PCP, notificação de conclusão ao cliente, definição de frete (retirada vs. entrega), encaminhamento e validação fiscal no Faturamento, digitalização/anexo dos comprovantes finais e arquivamento histórico.

---

## 2. Experiência do Usuário e Design Visual

### Identidade Visual & Tema
- **Direção Estética**: Console industrial/corporativo de alta precisão, minimalista, organizado com densidade de informação profissional e sem poluição visual.
- **Paleta de Cores e Semântica de Setores**:
  - *Produção / Bancada*: Índigo industrial (`#4F46E5` / `#3B82F6`)
  - *Comercial & Atendimento*: Esmeralda corporativo (`#059669`)
  - *Responsável pelo Cliente*: Violeta (`#7C3AED`)
  - *Faturamento & Fiscal*: Âmbar dourado (`#D97706`)
  - *Alertas & Retrabalho*: Vermelho carmim (`#DC2626`)
- **Tipografia**:
  - Títulos e identificadores: `Plus Jakarta Sans`
  - Textos de formulários e descrições: `DM Sans`
  - Códigos de O.S., números de série, valores monetários e cronômetros de SLA: `font-mono tabular-nums`

### Telas e Modos de Visualização
1. **Quadro Kanban Operacional (Por Setor / Etapa)**:
   - Colunas organizadas de acordo com as raias do fluxo de trabalho.
   - Cartões com tempos de permanência em tempo real, selo de origem (Papel vs. Digital), status do carimbo "Pronto" e botões diretos de avanço ou devolução.
2. **Visualizador do Fluxograma BPMN Interativo**:
   - Representação gráfica fiel ao diagrama da imagem (Abertura e Encerramento com todas as raias de Produção, Comercial, Cliente e Faturamento).
   - Pontos de calor mostrando onde estão as O.S. paradas no exato nó do fluxo.
3. **Estação de OCR para O.S. em Papel**:
   - Upload de foto da O.S. de papel (ou captura via câmera).
   - Botão para processar com modelo multimodal (`gemini-3.8-flash`).
   - Amostras pré-configuradas de formulários de papel para testes instantâneos.
   - Tela de conferência com zoom na imagem da folha e realce dos campos detectados.
4. **Feed de Atividades & Avisos Visuais em Tempo Real**:
   - Painel lateral retrátil com histórico vivo de eventos: "O.S. #1042 enviada ao Faturamento por Camila", "O.S. #1039 devolvida: sem carimbo de Pronto".
   - Badges visuais de SLA expirado para ação preventiva.
5. **Relatórios de Desempenho & Diagnóstico de Gargalos**:
   - Gráfico de barras com tempo médio gasto em cada etapa do processo.
   - Identificação visual imediata das etapas que mais represam trabalho.
   - Tabela detalhada de produtividade individual por colaborador (volume, tempo médio de ciclo, índice de devolução/retrabalho).

---

## 3. Arquitetura Técnica e Integração

### Diagrama Arquitetural

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    Barra Superior (Top Bar Contract)                       │
│ [WorkFlow OS Pro] — [Kanban | Fluxo BPMN | Scanner OCR | Relatórios] — [Perfil] │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     Visão Kanban      │ │     Fluxo BPMN        │ │   Scanner OCR Papel   │
│ - Raias por setor     │ │ - Diagrama interativo │ │ - Upload de foto O.S. │
│ - Cartões com SLA     │ │ - Contagem de O.S.    │ │ - Extração automática │
│ - Ações de gateway    │ │ - Localização visual  │ │ - Conferência split   │
└───────────┬───────────┘ └───────────┬───────────┘ └───────────┬───────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Camada de Estado (Workflow Store)                      │
│ - State: ordensDeServico, logsDeTransicao, colaboradores, notificacoes     │
│ - Motor de Regras: Gateways condicionais, SLA timers, carimbo "Pronto"     │
│ - Motor de Métricas: Tempo médio por etapa, análise de gargalos por setor  │
│ - Endpoint /api/ocr: Processamento com Gemini 3.8 Flash Multimodal         │
│ - Persistência: LocalStorage com seed completo e realista                  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Estratégia de OCR Multimodal
- Rota de backend `/api/ocr` no servidor Node/Express (configurado no Vite) que recebe a imagem codificada em base64 e utiliza `@google/genai` com o modelo `gemini-3.8-flash`.
- Prompt estruturado com `responseMimeType: "application/json"` retornando esquema validado:
  - `osNumber`, `clientName`, `clientPhone`, `equipmentModel`, `serialNumber`, `reportedDefect`, `entryDate`, `technicianName`, `initialInspectionNotes`.
- Fallback inteligente: caso a chave de API não esteja configurada ou ocorra timeout, o sistema oferece templates de demonstração com imagens reais de formulários físicos e preenchimento assistido para que a experiência do usuário nunca seja interrompida.

---

## 4. Plano de Execução por Etapas

1. **Configuração de Rotas e Endpoint de OCR (`/api/ocr`)**:
   - Integrar middleware de API no Vite/Express com `@google/genai` para extração multimodal de fotos de O.S. em papel.
2. **Definição de Tipos e Armazenamento Reativo (`src/types/workflow.ts` e `src/store/workflowStore.ts`)**:
   - Mapear todas as 15 tarefas e 5 gateways dos fluxos de Abertura e Encerramento.
   - Definir colaboradores com cargos reais nos 4 setores (Produção, Comercial, Atendimento, Faturamento).
   - Gerar massa de dados pré-carregada com 6 O.S. ativas em diferentes nós.
3. **Componente de Extração OCR para O.S. Físicas (`src/components/OcrScanner.tsx`)**:
   - Interface de upload e captura de fotos de formulários de papel.
   - Painel comparativo de validação pós-extração.
4. **Quadro Kanban e Transições com Gateways (`src/components/KanbanBoard.tsx` e `src/components/WorkOrderCard.tsx`)**:
   - Modais específicos de cada etapa (Preenchimento, Laudo Técnico, Carimbo de "Pronto", Faturamento, Logística).
5. **Diagrama BPMN Interativo (`src/components/BpmnFlowView.tsx`)**:
   - Canvas estilizado espelhando com precisão as raias da imagem.
6. **Central de Notificações e Feed em Tempo Real (`src/components/ActivityFeedDrawer.tsx`)**:
   - Histórico cronológico de ações e alertas visuais de estouro de SLA.
7. **Relatórios e Análise de Desempenho dos Colaboradores (`src/components/AnalyticsDashboard.tsx`)**:
   - Diagnóstico visual de gargalos por etapa e métricas individuais de colaboradores.
8. **Validação e Compilação Final**:
   - Execução de `compile_applet` e testes de fluxo ponta a ponta.
