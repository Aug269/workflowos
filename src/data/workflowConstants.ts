import { Collaborator, DetectedDocumentType, WorkflowStepDefinition, WorkOrder } from '../types/workflow';

export const WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  // --- ABERTURA DE O.S. ---
  {
    id: 'prod_preencher',
    title: 'Preencher a O.S.',
    sector: 'producao',
    macroPhase: 'abertura',
    order: 1,
    expectedDurationMinutes: 30,
    description: 'Preenchimento cadastral e técnico da O.S. física em papel na bancada de entrada.',
    gatewayQuestion: 'A O.S. foi preenchida corretamente?',
    yesLabel: 'Sim, preenchida corretamente',
    noLabel: 'Não, devolver para correção',
    yesNextStepId: 'prod_enviar_comercial',
    noNextStepId: 'prod_preencher',
  },
  {
    id: 'prod_enviar_comercial',
    title: 'Enviar a O.S. ao comercial',
    sector: 'producao',
    macroPhase: 'abertura',
    order: 2,
    expectedDurationMinutes: 15,
    description: 'Envio físico ou digital da O.S. para a recepção comercial.',
    yesNextStepId: 'com_inserir_planilha',
  },
  {
    id: 'com_inserir_planilha',
    title: 'Inserir a O.S. na planilha de controle',
    sector: 'comercial',
    macroPhase: 'abertura',
    order: 3,
    expectedDurationMinutes: 20,
    description: 'Registro oficial do número da O.S. no controle central de atendimento.',
    yesNextStepId: 'com_imprimir_fichas',
  },
  {
    id: 'com_imprimir_fichas',
    title: 'Imprimir a O.S. e a ficha de teste',
    sector: 'comercial',
    macroPhase: 'abertura',
    order: 4,
    expectedDurationMinutes: 15,
    description: 'Geração do protocolo físico e da ficha técnica de testes para acompanhamento na oficina.',
    yesNextStepId: 'com_enviar_producao',
  },
  {
    id: 'com_enviar_producao',
    title: 'Enviar a O.S. e a ficha para a produção',
    sector: 'comercial',
    macroPhase: 'abertura',
    order: 5,
    expectedDurationMinutes: 20,
    description: 'Despacho da pasta da O.S. para a bancada técnica.',
    gatewayQuestion: 'O.S. e ficha de teste foram enviadas para a produção?',
    yesLabel: 'Sim, entregue na bancada',
    noLabel: 'Não, aguardando portador',
    yesNextStepId: 'prod_elaborar_laudo',
    noNextStepId: 'com_enviar_producao',
  },
  {
    id: 'prod_elaborar_laudo',
    title: 'Elaborar o laudo do equipamento',
    sector: 'producao',
    macroPhase: 'abertura',
    order: 6,
    expectedDurationMinutes: 120,
    description: 'Diagnóstico técnico, testes de isolamento, desmontagem e levantamento de peças.',
    yesNextStepId: 'prod_enviar_laudo_comercial',
  },
  {
    id: 'prod_enviar_laudo_comercial',
    title: 'Enviar o laudo ao comercial',
    sector: 'producao',
    macroPhase: 'abertura',
    order: 7,
    expectedDurationMinutes: 15,
    description: 'Transmissão do laudo técnico com parecer para formação de preço.',
    gatewayQuestion: 'O laudo foi enviado ao comercial?',
    yesLabel: 'Sim, laudo validado e enviado',
    noLabel: 'Não, revisar parecer técnico',
    yesNextStepId: 'com_elaborar_orcamento',
    noNextStepId: 'prod_elaborar_laudo',
  },
  {
    id: 'com_elaborar_orcamento',
    title: 'Elaborar o orçamento',
    sector: 'comercial',
    macroPhase: 'abertura',
    order: 8,
    expectedDurationMinutes: 60,
    description: 'Cálculo de custo de peças de reposição, mão de obra e prazos de garantia.',
    yesNextStepId: 'com_enviar_orcamento_resp',
  },
  {
    id: 'com_enviar_orcamento_resp',
    title: 'Enviar orçamento ao responsável pelo cliente',
    sector: 'comercial',
    macroPhase: 'abertura',
    order: 9,
    expectedDurationMinutes: 20,
    description: 'Encaminhamento da proposta para o gestor da conta/vendedor dedicado.',
    yesNextStepId: 'resp_enviar_cliente',
  },
  {
    id: 'resp_enviar_cliente',
    title: 'Enviar orçamento ao cliente',
    sector: 'responsavel_cliente',
    macroPhase: 'abertura',
    order: 10,
    expectedDurationMinutes: 180,
    description: 'Negociação com o cliente e obtenção do protocolo formal de aprovação.',
    gatewayQuestion: 'Cliente aprovou o orçamento?',
    yesLabel: 'Aprovado (Iniciar Execução)',
    noLabel: 'Aguardando cliente / Negociação',
    yesNextStepId: 'prod_finalizar_servico',
    noNextStepId: 'resp_enviar_cliente',
  },

  // --- ENCERRAMENTO DE O.S. ---
  {
    id: 'prod_finalizar_servico',
    title: 'Finalizar o serviço',
    sector: 'producao',
    macroPhase: 'encerramento',
    order: 11,
    expectedDurationMinutes: 240,
    description: 'Execução das trocas de peças, montagem, testes de carga e testes finais de bancada.',
    gatewayQuestion: 'O serviço foi finalizado?',
    yesLabel: 'Sim, reparo concluído com sucesso',
    noLabel: 'Não, ainda em bancada de teste',
    yesNextStepId: 'prod_enviar_os_comercial',
    noNextStepId: 'prod_finalizar_servico',
  },
  {
    id: 'prod_enviar_os_comercial',
    title: 'Enviar a O.S. ao comercial',
    sector: 'producao',
    macroPhase: 'encerramento',
    order: 12,
    expectedDurationMinutes: 20,
    description: 'Envio da O.S. física com a ficha de teste preenchida ao setor Comercial.',
    yesNextStepId: 'com_verificar_carimbo',
  },
  {
    id: 'com_verificar_carimbo',
    title: 'Verificar carimbo de "Pronto"',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 13,
    expectedDurationMinutes: 15,
    description: 'Inspeção documental da presença do carimbo oficial de liberação da bancada.',
    gatewayQuestion: 'A O.S. possui o carimbo de "Pronto"?',
    yesLabel: 'Sim, carimbo validado',
    noLabel: 'Não, sem carimbo de Pronto',
    yesNextStepId: 'com_apagar_pcp',
    noNextStepId: 'prod_inserir_carimbo',
  },
  {
    id: 'prod_inserir_carimbo',
    title: 'Inserir o carimbo de "Pronto"',
    sector: 'producao',
    macroPhase: 'encerramento',
    order: 14,
    expectedDurationMinutes: 30,
    description: 'Retorno para bancada para inspeção final de qualidade e aplicação do carimbo de Pronto.',
    yesNextStepId: 'com_apagar_pcp',
  },
  {
    id: 'com_apagar_pcp',
    title: 'Apagar as informações do PCP',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 15,
    expectedDurationMinutes: 20,
    description: 'Baixa formal do cronograma no quadro de Planejamento e Controle da Produção.',
    yesNextStepId: 'com_informar_cliente',
  },
  {
    id: 'com_informar_cliente',
    title: 'Informar ao cliente que o serviço foi finalizado',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 16,
    expectedDurationMinutes: 30,
    description: 'Disparo de aviso formal de prontidão e agendamento de retirada/entrega.',
    yesNextStepId: 'com_verificar_envio',
  },
  {
    id: 'com_verificar_envio',
    title: 'Verificar o meio de envio',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 17,
    expectedDurationMinutes: 30,
    description: 'Definição logística: cliente retira na expedição ou transporte próprio/transportadora.',
    yesNextStepId: 'com_enviar_faturamento',
  },
  {
    id: 'com_enviar_faturamento',
    title: 'Enviar a O.S. ao faturamento',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 18,
    expectedDurationMinutes: 20,
    description: 'Encaminhamento da O.S. com protocolo e pedido de venda ao departamento fiscal.',
    gatewayQuestion: 'A O.S. com pedido de venda foi entregue ao financeiro?',
    yesLabel: 'Sim, entregue ao financeiro',
    noLabel: 'Não, pendência documental',
    yesNextStepId: 'fat_dar_seguimento',
    noNextStepId: 'com_enviar_faturamento',
  },
  {
    id: 'fat_dar_seguimento',
    title: 'Dar seguimento ao faturamento',
    sector: 'faturamento',
    macroPhase: 'encerramento',
    order: 19,
    expectedDurationMinutes: 60,
    description: 'Emissão da Nota Fiscal Eletrônica (NF-e), boleto e conciliação de faturamento.',
    yesNextStepId: 'fat_devolver_comercial',
  },
  {
    id: 'fat_devolver_comercial',
    title: 'Devolver a O.S. ao comercial',
    sector: 'faturamento',
    macroPhase: 'encerramento',
    order: 20,
    expectedDurationMinutes: 20,
    description: 'Devolução da documentação com cópia de NF-e e canhoto ao Comercial.',
    yesNextStepId: 'com_digitalizar_os',
  },
  {
    id: 'com_digitalizar_os',
    title: 'Digitalizar a O.S. e a ficha de teste',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 21,
    expectedDurationMinutes: 30,
    description: 'Escaneamento de alta resolução das folhas assinadas e carimbadas.',
    yesNextStepId: 'com_arquivar_os',
  },
  {
    id: 'com_arquivar_os',
    title: 'Arquivar a O.S. e a ficha de teste',
    sector: 'comercial',
    macroPhase: 'encerramento',
    order: 22,
    expectedDurationMinutes: 15,
    description: 'Guarda física e digital no acervo histórico de garantias. Conclusão do processo!',
    yesNextStepId: 'concluida',
  },
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'colab_1',
    name: 'Roberto Silva',
    role: 'Técnico Líder de Produção',
    sector: 'producao',
    email: 'roberto.silva@oficina.ind.br',
    avatar: 'RS',
  },
  {
    id: 'colab_2',
    name: 'Carlos Mendes',
    role: 'Eletromecânico de Bancada',
    sector: 'producao',
    email: 'carlos.mendes@oficina.ind.br',
    avatar: 'CM',
  },
  {
    id: 'colab_3',
    name: 'Camila Santos',
    role: 'Analista de Atendimento Comercial',
    sector: 'comercial',
    email: 'camila.santos@oficina.ind.br',
    avatar: 'CS',
  },
  {
    id: 'colab_4',
    name: 'Lucas Ferreira',
    role: 'Assistente Comercial & PCP',
    sector: 'comercial',
    email: 'lucas.ferreira@oficina.ind.br',
    avatar: 'LF',
  },
  {
    id: 'colab_5',
    name: 'Beatriz Lima',
    role: 'Gerente de Contas & Clientes',
    sector: 'responsavel_cliente',
    email: 'beatriz.lima@oficina.ind.br',
    avatar: 'BL',
  },
  {
    id: 'colab_6',
    name: 'Juliana Costa',
    role: 'Supervisora de Faturamento & Fiscal',
    sector: 'faturamento',
    email: 'juliana.costa@oficina.ind.br',
    avatar: 'JC',
  },
  {
    id: 'colab_gestor',
    name: 'André Castro (Gestor)',
    role: 'Diretor de Operações Industriais',
    sector: 'gestao',
    email: 'andrerscastro@gmail.com',
    avatar: 'AC',
  },
];

// Sample paper O.S. sheets formatted with SVG data URLs with realistic paper texture,
// printed header, barcodes, checkboxes, stamp marks and simulated handwriting
export const SAMPLE_PAPER_SHEETS = [
  {
    id: 'sample_weg_motor',
    title: 'O.S. #1042 - Motor Trifásico WEG W22',
    client: 'Indústria Metalúrgica Aliança Ltda',
    equipment: 'Motor Elétrico Trifásico WEG 15CV 4P',
    defect: 'Superaquecimento anormal no mancal e vibração acima de 4.5 mm/s',
    previewNote: 'Ficha padrão preenchida à mão na bancada com carimbo de entrada',
    isWorkOrder: true,
    detectedDocumentType: 'ordem_de_servico' as DetectedDocumentType,
    documentTypeLabel: 'Ordem de Serviço (O.S.)',
    data: {
      osNumber: 'OS-1042',
      clientName: 'Indústria Metalúrgica Aliança Ltda',
      clientPhone: '(11) 98765-4321',
      equipmentModel: 'Motor Elétrico WEG W22 15CV 4 Polos 380V',
      serialNumber: 'WEG-2024-88419',
      reportedDefect: 'Superaquecimento anormal no mancal dianteiro e vibração excessiva em carga',
      entryDate: '2026-10-15',
      technicianName: 'Roberto Silva (Produção)',
      priority: 'Alta' as const,
      serviceType: 'Corretiva' as const,
      preliminaryNotes: 'Inspeção visual preliminar: rolamento 6308 com folga axial elevada. Enrolamento sem indício de queima.',
    },
    svgImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23f1f5f9" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="600" height="850" fill="%23fdfbf7" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="800" fill="none" stroke="%230f172a" stroke-width="1.5"/>
      
      <!-- Cabeçalho da Empresa -->
      <rect x="35" y="35" width="530" height="65" fill="%23f8fafc" stroke="%23334155" stroke-width="1"/>
      <text x="50" y="65" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="%230f172a">OFICINA TÉCNICA INDUSTRIAL S/A</text>
      <text x="50" y="85" font-family="Arial, sans-serif" font-size="11" fill="%23475569">Setor de Produção e Manutenção Eletromecânica · Unidade 01</text>
      
      <!-- Caixa de Número de OS -->
      <rect x="420" y="42" width="135" height="50" fill="%23fef2f2" stroke="%23dc2626" stroke-width="1.5"/>
      <text x="430" y="58" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23991b1b">ORDEM DE SERVIÇO Nº</text>
      <text x="430" y="82" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%23dc2626">OS-1042</text>
      
      <!-- Seção 1: Dados do Cliente -->
      <rect x="35" y="115" width="530" height="120" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="115" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="130" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">1. DADOS CADASTRAIS DO CLIENTE</text>
      
      <text x="45" y="160" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">RAZÃO SOCIAL / CLIENTE:</text>
      <text x="45" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Indústria Metalúrgica Aliança Ltda</text>
      
      <text x="350" y="160" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">TELEFONE / CONTATO:</text>
      <text x="350" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">(11) 98765-4321 / Eng. Paulo</text>
      
      <text x="45" y="210" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">DATA DE ENTRADA:</text>
      <text x="45" y="228" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">15/10/2026 - 08:30h</text>
      
      <text x="250" y="210" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">TIPO DE ATENDIMENTO:</text>
      <text x="250" y="228" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">[X] Corretiva  [ ] Preventiva  [ ] Garantia</text>

      <!-- Seção 2: Dados do Equipamento -->
      <rect x="35" y="250" width="530" height="130" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="250" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="265" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">2. DADOS DO EQUIPAMENTO RECEBIDO NA BANCADA</text>
      
      <text x="45" y="295" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">EQUIPAMENTO / FABRICANTE / MODELO:</text>
      <text x="45" y="315" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Motor Elétrico WEG W22 15CV 4P 380V Trifásico</text>
      
      <text x="350" y="295" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">Nº DE SÉRIE / PLAQUETA:</text>
      <text x="350" y="315" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="%230f172a">WEG-2024-88419</text>
      
      <text x="45" y="345" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">PRIORIDADE DECLARADA:</text>
      <text x="45" y="365" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%23b91c1c">[X] ALTA  (Parada de Linha de Produção)</text>

      <!-- Seção 3: Defeito e Sintomas -->
      <rect x="35" y="395" width="530" height="150" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="395" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="410" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">3. DEFEITO RECLAMADO E CONSTATAÇÕES INICIAIS</text>
      
      <text x="45" y="440" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Equipamento chegou com superaquecimento anormal no mancal dianteiro.</text>
      <text x="45" y="465" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Vibração em vazio acima de 4.5 mm/s. Ruído de rolamento estalando.</text>
      <text x="45" y="490" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Necessário desmontagem completa, medição de eixos e teste megômetro.</text>
      <text x="45" y="520" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">TÉCNICO RESPONSÁVEL: Roberto Silva  |  VISTO: [R.S.]</text>

      <!-- Carimbo Oficial de Entrada -->
      <g transform="rotate(-6 450 620)">
        <rect x="380" y="570" width="160" height="85" rx="6" fill="none" stroke="%231d4ed8" stroke-width="2.5" stroke-dasharray="8 3"/>
        <text x="400" y="595" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231d4ed8">OFICINA TÉCNICA</text>
        <text x="405" y="615" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="%231d4ed8">PRODUÇÃO</text>
        <text x="395" y="635" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="%231d4ed8">RECEBIDO EM: 15/10</text>
      </g>
      
      <!-- Código de Barras -->
      <g transform="translate(45, 750)">
        <rect x="0" y="0" width="3" height="40" fill="%23000"/>
        <rect x="5" y="0" width="2" height="40" fill="%23000"/>
        <rect x="10" y="0" width="6" height="40" fill="%23000"/>
        <rect x="18" y="0" width="2" height="40" fill="%23000"/>
        <rect x="23" y="0" width="4" height="40" fill="%23000"/>
        <rect x="30" y="0" width="8" height="40" fill="%23000"/>
        <rect x="42" y="0" width="2" height="40" fill="%23000"/>
        <rect x="48" y="0" width="5" height="40" fill="%23000"/>
        <rect x="56" y="0" width="3" height="40" fill="%23000"/>
        <rect x="62" y="0" width="7" height="40" fill="%23000"/>
        <rect x="73" y="0" width="2" height="40" fill="%23000"/>
        <rect x="78" y="0" width="5" height="40" fill="%23000"/>
        <rect x="86" y="0" width="8" height="40" fill="%23000"/>
        <rect x="97" y="0" width="3" height="40" fill="%23000"/>
        <text x="20" y="55" font-family="'Courier New', monospace" font-size="11" fill="%23334155">*OS-1042-PROD*</text>
      </g>
      <text x="320" y="795" font-family="Arial, sans-serif" font-size="9" fill="%2394a3b8">Sistema Físico de Formulários Impressos - Doc Rev. 04</text>
    </svg>`,
  },
  {
    id: 'sample_inversor_schneider',
    title: 'O.S. #1043 - Inversor Altivar 71 Schneider',
    client: 'Cerâmica São Bento S/A',
    equipment: 'Inversor de Frequência Schneider ATV71HD30N4 30kW',
    defect: 'Disparo de alarme "OCF" (Overcurrent) ao atingir 45Hz de rampa',
    previewNote: 'Ficha com anotações de bancada e código de erro registrado',
    isWorkOrder: true,
    detectedDocumentType: 'ordem_de_servico' as DetectedDocumentType,
    documentTypeLabel: 'Ordem de Serviço (O.S.)',
    data: {
      osNumber: 'OS-1043',
      clientName: 'Cerâmica São Bento S/A',
      clientPhone: '(19) 3456-7890',
      equipmentModel: 'Inversor de Frequência Schneider ATV71HD30N4 30kW 380V',
      serialNumber: 'SCH-88231-ATV',
      reportedDefect: 'Disparo frequente de alarme OCF (Sobrecorrente) em aceleração na extrusora 02',
      entryDate: '2026-10-16',
      technicianName: 'Carlos Mendes (Produção)',
      priority: 'Urgente' as const,
      serviceType: 'Corretiva' as const,
      preliminaryNotes: 'Módulo IGBT sob suspeita. Pasta térmica ressecada. Medição estática dos diodos de entrada OK.',
    },
    svgImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <rect width="600" height="850" fill="%23fbfcf8" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="800" fill="none" stroke="%230f172a" stroke-width="1.5"/>
      <rect x="35" y="35" width="530" height="65" fill="%23f8fafc" stroke="%23334155" stroke-width="1"/>
      <text x="50" y="65" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="%230f172a">OFICINA TÉCNICA INDUSTRIAL S/A</text>
      <text x="50" y="85" font-family="Arial, sans-serif" font-size="11" fill="%23475569">Laboratório de Eletrônica de Potência · Unidade 01</text>
      
      <rect x="420" y="42" width="135" height="50" fill="%23fef2f2" stroke="%23dc2626" stroke-width="1.5"/>
      <text x="430" y="58" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23991b1b">ORDEM DE SERVIÇO Nº</text>
      <text x="430" y="82" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%23dc2626">OS-1043</text>
      
      <rect x="35" y="115" width="530" height="120" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="115" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="130" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">1. DADOS CADASTRAIS DO CLIENTE</text>
      <text x="45" y="160" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">RAZÃO SOCIAL / CLIENTE:</text>
      <text x="45" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Cerâmica São Bento S/A</text>
      <text x="350" y="160" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">TELEFONE / CONTATO:</text>
      <text x="350" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">(19) 3456-7890 / Manutenção</text>
      
      <rect x="35" y="250" width="530" height="130" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="250" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="265" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">2. DADOS DO EQUIPAMENTO</text>
      <text x="45" y="295" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">EQUIPAMENTO:</text>
      <text x="45" y="315" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Inversor Altivar 71 Schneider ATV71HD30N4</text>
      <text x="350" y="295" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">Nº SÉRIE:</text>
      <text x="350" y="315" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="%230f172a">SCH-88231-ATV</text>
      
      <rect x="35" y="395" width="530" height="150" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="395" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="410" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">3. DEFEITO RECLAMADO</text>
      <text x="45" y="440" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Disparo intermitente com alarme OCF (Overcurrent) na aceleração.</text>
      <text x="45" y="465" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Cliente tentou resetar parâmetros mas falha persiste.</text>
      <text x="45" y="490" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">Análise preventiva dos capacitores do barramento DC recomendada.</text>
      <text x="45" y="520" font-family="Arial, sans-serif" font-size="10" fill="%2364748b">TÉCNICO RESPONSÁVEL: Carlos Mendes  |  VISTO: [C.M.]</text>
    </svg>`,
  },
  {
    id: 'sample_bomba_ksb',
    title: 'O.S. #1044 - Bomba Centrífuga KSB Megaflow',
    client: 'Cooperativa Agroindustrial do Vale',
    equipment: 'Bomba Centrífuga Multiestágio KSB 40-8',
    defect: 'Vazamento volumoso pelo selo mecânico e perda de vazão manométrica',
    previewNote: 'Ficha com detalhes de peças de desgaste e requisição de usinagem',
    data: {
      osNumber: 'OS-1044',
      clientName: 'Cooperativa Agroindustrial do Vale',
      clientPhone: '(41) 99881-2233',
      equipmentModel: 'Bomba Centrífuga Multiestágio KSB Megaflow 40-8',
      serialNumber: 'KSB-BR-2023-4120',
      reportedDefect: 'Vazamento grave pelo selo mecânico e queda acentuada na pressão de recalque',
      entryDate: '2026-10-16',
      technicianName: 'Roberto Silva (Produção)',
      priority: 'Média' as const,
      serviceType: 'Corretiva' as const,
      preliminaryNotes: 'Selo mecânico danificado por cavitação ou operação a seco. Eixo requer conferência no torno.',
    },
    svgImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <rect width="600" height="850" fill="%23fdfbf7" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="800" fill="none" stroke="%230f172a" stroke-width="1.5"/>
      <rect x="35" y="35" width="530" height="65" fill="%23f8fafc" stroke="%23334155" stroke-width="1"/>
      <text x="50" y="65" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="%230f172a">OFICINA TÉCNICA INDUSTRIAL S/A</text>
      <text x="50" y="85" font-family="Arial, sans-serif" font-size="11" fill="%23475569">Setor de Bombas e Sistemas Hidráulicos · Unidade 01</text>
      
      <rect x="420" y="42" width="135" height="50" fill="%23fef2f2" stroke="%23dc2626" stroke-width="1.5"/>
      <text x="430" y="58" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23991b1b">ORDEM DE SERVIÇO Nº</text>
      <text x="430" y="82" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%23dc2626">OS-1044</text>
      
      <rect x="35" y="115" width="530" height="120" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="115" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="130" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">1. DADOS CADASTRAIS DO CLIENTE</text>
      <text x="45" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Cooperativa Agroindustrial do Vale</text>
      <text x="350" y="180" font-family="Comic Sans MS, cursive, sans-serif" font-size="13" fill="%231e3a8a">(41) 99881-2233</text>
      
      <rect x="35" y="250" width="530" height="130" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="250" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="265" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">2. DADOS DO EQUIPAMENTO</text>
      <text x="45" y="315" font-family="Comic Sans MS, cursive, sans-serif" font-size="14" fill="%231e3a8a">Bomba Centrífuga Multiestágio KSB Megaflow 40-8</text>
      <text x="350" y="315" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="%230f172a">KSB-BR-2023-4120</text>
      
      <rect x="35" y="395" width="530" height="150" fill="none" stroke="%2394a3b8" stroke-width="1"/>
      <rect x="35" y="395" width="530" height="22" fill="%23e2e8f0"/>
      <text x="45" y="410" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%231e293b">3. DEFEITO RECLAMADO</text>
      <rect x="45" y="750" width="510" height="50" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="1"/>
      <text x="60" y="780" font-family="'Courier New', monospace" font-size="12" fill="%23334155">OS-1044-BOMBA-KSB * ENTRADA BANCADA PRODUCAO * 17/10/2026</text>
    </svg>`,
    isWorkOrder: true,
    detectedDocumentType: 'ordem_de_servico' as DetectedDocumentType,
    documentTypeLabel: 'Ordem de Serviço (O.S.)',
  },
  {
    id: 'sample_nota_fiscal',
    title: 'Documento Inválido (Não é O.S.)',
    client: 'Empresa Externa / Diversos',
    equipment: 'Não aplicável',
    defect: 'O documento capturado não é uma Ordem de Serviço.',
    previewNote: 'Folha física digitalizada que não é uma Ordem de Serviço',
    isWorkOrder: false,
    detectedDocumentType: 'outro_invalido' as DetectedDocumentType,
    documentTypeLabel: 'Documento Inválido',
    nonWorkOrderReason: 'O documento digitalizado não é uma Ordem de Serviço.',
    data: {
      osNumber: '',
      clientName: 'Empresa Externa',
      clientPhone: '',
      equipmentModel: 'Não aplicável',
      serialNumber: '',
      reportedDefect: 'Documento não reconhecido como Ordem de Serviço.',
      entryDate: '2026-10-18',
      technicianName: '',
      priority: 'Baixa' as const,
      serviceType: 'Corretiva' as const,
      preliminaryNotes: 'Documento físico que não é uma Ordem de Serviço. Bloquear entrada no fluxo.',
    },
    svgImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <rect width="600" height="850" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="800" fill="none" stroke="%230f172a" stroke-width="1.5"/>
      
      <!-- Cabeçalho de Documento Não-OS -->
      <rect x="35" y="35" width="530" height="85" fill="%23f8fafc" stroke="%230f172a" stroke-width="1"/>
      <text x="45" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="%230f172a">DOCUMENTAÇÃO FÍSICA DIVERSA</text>
      <text x="45" y="92" font-family="Arial, sans-serif" font-size="11" fill="%23475569">Folha avulsa recebida na bancada sem estrutura de Ordem de Serviço</text>
      
      <rect x="35" y="140" width="530" height="380" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1"/>
      <text x="55" y="180" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%23334155">INFORMAÇÕES DO DOCUMENTO:</text>
      <text x="55" y="210" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Este documento não contém número de Ordem de Serviço.</text>
      <text x="55" y="235" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Não possui campos de defeito reclamado ou equipamento para reparo.</text>
      <text x="55" y="260" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Não contém carimbo de abertura da Produção.</text>
      
      <!-- Carimbo de Alerta Visual -->
      <g transform="rotate(-10 300 420)">
        <rect x="110" y="360" width="380" height="80" rx="8" fill="%23fef2f2" stroke="%23dc2626" stroke-width="3" stroke-dasharray="8 4"/>
        <text x="130" y="395" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%23dc2626">DOCUMENTO INVÁLIDO</text>
        <text x="130" y="420" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23b91c1c">NÃO É UMA ORDEM DE SERVIÇO</text>
      </g>
      
      <text x="45" y="810" font-family="Arial, sans-serif" font-size="9" fill="%2394a3b8">Documento arquivado separadamente. Não dar entrada no sistema de O.S.</text>
    </svg>`,
  },
  {
    id: 'sample_comprovante_bancario',
    title: 'Outro Documento Não-O.S.',
    client: 'Diversos',
    equipment: 'Não aplicável',
    defect: 'O documento capturado não é uma Ordem de Serviço.',
    previewNote: 'Outro documento físico que não é uma Ordem de Serviço',
    isWorkOrder: false,
    detectedDocumentType: 'outro_invalido' as DetectedDocumentType,
    documentTypeLabel: 'Documento Inválido',
    nonWorkOrderReason: 'O documento capturado não é uma Ordem de Serviço.',
    data: {
      osNumber: '',
      clientName: 'Diversos',
      clientPhone: '',
      equipmentModel: 'Não aplicável',
      serialNumber: '',
      reportedDefect: 'Documento não reconhecido como Ordem de Serviço.',
      entryDate: '2026-10-19',
      technicianName: '',
      priority: 'Baixa' as const,
      serviceType: 'Corretiva' as const,
      preliminaryNotes: 'Documento anexado por engano na triagem.',
    },
    svgImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <rect width="600" height="850" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/>
      <rect x="25" y="25" width="550" height="800" fill="none" stroke="%230f172a" stroke-width="1.5"/>
      
      <rect x="35" y="35" width="530" height="75" fill="%23334155" stroke="%231e293b" stroke-width="1"/>
      <text x="50" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="%23ffffff">DOCUMENTO DIVERSO</text>
      <text x="50" y="92" font-family="Arial, sans-serif" font-size="11" fill="%23cbd5e1">Folha avulsa sem estrutura de Ordem de Serviço</text>
      
      <rect x="35" y="140" width="530" height="350" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1"/>
      <text x="50" y="180" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23334155">CONTEÚDO IDENTIFICADO:</text>
      <text x="50" y="210" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Documento recebido fisicamente na bancada de trabalho.</text>
      <text x="50" y="235" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Não corresponde ao formulário de Ordem de Serviço da empresa.</text>
      <text x="50" y="260" font-family="Arial, sans-serif" font-size="11" fill="%23475569">- Desprovido de campos para laudo técnico, defeito ou peças.</text>
      
      <!-- Carimbo de Alerta Visual -->
      <g transform="rotate(-8 300 480)">
        <rect x="130" y="420" width="340" height="70" rx="8" fill="%23fef2f2" stroke="%23dc2626" stroke-width="3" stroke-dasharray="8 4"/>
        <text x="150" y="450" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%23dc2626">DOCUMENTO INVÁLIDO</text>
        <text x="150" y="475" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23b91c1c">NÃO É UMA ORDEM DE SERVIÇO</text>
      </g>
    </svg>`,
  },
];

// Seed Work Orders actively traversing the BPMN diagram
export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo_1',
    osNumber: 'OS-1038',
    clientName: 'Termoplásticos Progresso Ltda',
    clientPhone: '(11) 4589-1122',
    equipmentModel: 'Extrusora Dupla Rosca Barmag 60mm',
    serialNumber: 'EXT-2021-9901',
    reportedDefect: 'Resistências da zona 3 e 4 inoperantes e travamento mecânico do redutor',
    entryDate: '2026-10-12',
    technicianName: 'Roberto Silva',
    priority: 'Urgente',
    serviceType: 'Corretiva',
    origin: 'papel_ocr',
    macroPhase: 'abertura',
    currentSector: 'producao',
    currentStepId: 'prod_elaborar_laudo',
    stepStartedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(), // 95 minutes in step (approaching SLA 120min)
    hasReadyStamp: false,
    controlSpreadsheetInserted: true,
    testSheetPrinted: true,
    testSheetSentToProduction: true,
    technicalReportApproved: false,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    history: [
      {
        id: 'h1',
        fromStepId: 'prod_preencher',
        toStepId: 'prod_enviar_comercial',
        fromStepTitle: 'Preencher a O.S.',
        toStepTitle: 'Enviar a O.S. ao comercial',
        sector: 'producao',
        collaboratorName: 'Roberto Silva',
        collaboratorRole: 'Técnico Líder',
        actionType: 'ocr_digitalizacao',
        timestamp: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        durationMinutes: 18,
        note: 'O.S. digitalizada a partir do formulário de bancada em papel.',
      },
      {
        id: 'h2',
        fromStepId: 'prod_enviar_comercial',
        toStepId: 'com_inserir_planilha',
        fromStepTitle: 'Enviar a O.S. ao comercial',
        toStepTitle: 'Inserir a O.S. na planilha de controle',
        sector: 'comercial',
        collaboratorName: 'Camila Santos',
        collaboratorRole: 'Analista Comercial',
        actionType: 'avanco',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        durationMinutes: 12,
      },
      {
        id: 'h3',
        fromStepId: 'com_enviar_producao',
        toStepId: 'prod_elaborar_laudo',
        fromStepTitle: 'Enviar a O.S. e a ficha para a produção',
        toStepTitle: 'Elaborar o laudo do equipamento',
        sector: 'producao',
        collaboratorName: 'Carlos Mendes',
        collaboratorRole: 'Eletromecânico',
        actionType: 'avanco',
        timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
        durationMinutes: 14,
      },
    ],
  },
  {
    id: 'wo_2',
    osNumber: 'OS-1039',
    clientName: 'Metalmecânica Rápida S/A',
    clientPhone: '(11) 97123-9988',
    equipmentModel: 'Torno CNC Romi Centur 30D',
    serialNumber: 'ROMI-2019-3382',
    reportedDefect: 'Folga no fuso de esferas do eixo X e vazamento no cilindro hidráulico',
    entryDate: '2026-10-10',
    technicianName: 'Carlos Mendes',
    priority: 'Alta',
    serviceType: 'Corretiva',
    origin: 'papel_ocr',
    macroPhase: 'encerramento',
    currentSector: 'comercial',
    currentStepId: 'com_verificar_carimbo',
    stepStartedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    hasReadyStamp: false, // Attention: NO READY STAMP! Triggers the BPMN loop
    controlSpreadsheetInserted: true,
    testSheetPrinted: true,
    testSheetSentToProduction: true,
    technicalReportApproved: true,
    technicalReport: {
      diagnosis: 'Fuso com desgaste na pista de esferas e retentor hidráulico ressecado.',
      testsConducted: 'Ensaio com relógio apalpador milimétrico e teste de estanqueidade 70 bar.',
      partsRequired: ['Fuso de esferas passo 5', 'Kit reparo vedação hidráulica'],
      laborHours: 14,
      completedAt: '2026-10-13T14:00:00Z',
      technician: 'Carlos Mendes',
    },
    quote: {
      partsCost: 3200,
      laborCost: 1800,
      totalCost: 5000,
      paymentTerms: '28 DDL',
      clientStatus: 'aprovado',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    history: [
      {
        id: 'h21',
        fromStepId: 'prod_finalizar_servico',
        toStepId: 'prod_enviar_os_comercial',
        fromStepTitle: 'Finalizar o serviço',
        toStepTitle: 'Enviar a O.S. ao comercial',
        sector: 'producao',
        collaboratorName: 'Carlos Mendes',
        collaboratorRole: 'Eletromecânico',
        actionType: 'avanco',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        durationMinutes: 210,
        note: 'Montagem concluída. O.S. enviada ao comercial para conferência de carimbo.',
      },
    ],
  },
  {
    id: 'wo_3',
    osNumber: 'OS-1040',
    clientName: 'Alimentos Boa Safra Ltda',
    clientPhone: '(19) 3871-4455',
    equipmentModel: 'Compressor Parafuso Atlas Copco GA37',
    serialNumber: 'AC-GA37-2022',
    reportedDefect: 'Parada por alta temperatura do óleo (108°C) em regime de 8 bar',
    entryDate: '2026-10-08',
    technicianName: 'Roberto Silva',
    priority: 'Alta',
    serviceType: 'Preventiva',
    origin: 'papel_ocr',
    macroPhase: 'encerramento',
    currentSector: 'faturamento',
    currentStepId: 'fat_dar_seguimento',
    stepStartedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    hasReadyStamp: true,
    controlSpreadsheetInserted: true,
    testSheetPrinted: true,
    testSheetSentToProduction: true,
    technicalReportApproved: true,
    quote: {
      partsCost: 4500,
      laborCost: 2100,
      totalCost: 6600,
      paymentTerms: 'Boleto 30/60 dias',
      clientStatus: 'aprovado',
    },
    closingInfo: {
      pcpCleared: true,
      clientNotified: true,
      deliveryMethod: 'nos_entregamos',
      deliveryNotes: 'Entrega com caminhão plataforma na filial de Campinas.',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    history: [],
  },
  {
    id: 'wo_4',
    osNumber: 'OS-1041',
    clientName: 'Cerâmica Santa Rita S/A',
    clientPhone: '(19) 99122-3344',
    equipmentModel: 'Transformador a Seco Trafo 500kVA',
    serialNumber: 'TRAFO-500-2020',
    reportedDefect: 'Alarme térmico no termômetro pt100 da fase B em pico de carga',
    entryDate: '2026-10-14',
    technicianName: 'Carlos Mendes',
    priority: 'Média',
    serviceType: 'Garantia',
    origin: 'digital',
    macroPhase: 'abertura',
    currentSector: 'responsavel_cliente',
    currentStepId: 'resp_enviar_cliente',
    stepStartedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    hasReadyStamp: false,
    controlSpreadsheetInserted: true,
    testSheetPrinted: true,
    testSheetSentToProduction: true,
    technicalReportApproved: true,
    quote: {
      partsCost: 0,
      laborCost: 850,
      totalCost: 850,
      paymentTerms: 'Cobrança em garantia do fabricante',
      clientStatus: 'aguardando',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    history: [],
  },
];
