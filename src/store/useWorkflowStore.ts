import { useState, useEffect } from 'react';
import {
  ActivityNotification,
  Collaborator,
  SectorType,
  WorkOrder,
  TransitionHistoryItem,
} from '../types/workflow';
import {
  INITIAL_COLLABORATORS,
  INITIAL_WORK_ORDERS,
  WORKFLOW_STEPS,
} from '../data/workflowConstants';

const STORAGE_KEY_WORK_ORDERS = 'workflow_os_items_v1';
const STORAGE_KEY_NOTIFICATIONS = 'workflow_os_notifications_v1';
const STORAGE_KEY_ACTIVE_COLAB = 'workflow_os_active_colab_v1';

export function useWorkflowStore() {
  // 1. Work Orders State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORK_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar O.S. do localStorage:', e);
    }
    return INITIAL_WORK_ORDERS;
  });

  // 2. Active Collaborator State
  const [activeCollaborator, setActiveCollaborator] = useState<Collaborator>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_COLAB);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = INITIAL_COLLABORATORS.find((c) => c.id === parsed.id);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Erro ao carregar colaborador:', e);
    }
    return INITIAL_COLLABORATORS[0]; // Roberto Silva (Produção) by default
  });

  // 3. Notifications State
  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar notificações:', e);
    }
    return [
      {
        id: 'notif_init_1',
        osId: 'wo_1',
        osNumber: 'OS-1038',
        title: 'Laudo Técnico em Andamento',
        message: 'O.S. em fase de desmontagem e medição na bancada de Produção.',
        sector: 'producao',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: 'notif_init_2',
        osId: 'wo_2',
        osNumber: 'OS-1039',
        title: 'Alerta de Gateway: Carimbo de Pronto',
        message: 'O.S. aguarda verificação obrigatória do carimbo "Pronto" pelo Comercial.',
        sector: 'comercial',
        type: 'warning',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: false,
      },
    ];
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<'ocr_scanner' | 'kanban' | 'bpmn_flow' | 'analytics'>('ocr_scanner');
  const [filterSector, setFilterSector] = useState<'all' | SectorType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFeedDrawerOpen, setIsFeedDrawerOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<ActivityNotification | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORK_ORDERS, JSON.stringify(workOrders));
    } catch (e) {
      console.warn('Falha ao persistir O.S.:', e);
    }
  }, [workOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Falha ao persistir notificações:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_COLAB, JSON.stringify(activeCollaborator));
    } catch (e) {
      console.warn('Falha ao persistir colaborador:', e);
    }
  }, [activeCollaborator]);

  // Helper to trigger activity notification and visual toast
  const triggerNotification = (notifData: Omit<ActivityNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: ActivityNotification = {
      ...notifData,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 5000);
  };

  // Add new Work Order (e.g. from OCR Scanner)
  const addWorkOrder = (newOrderData: Partial<WorkOrder>) => {
    const osNum = newOrderData.osNumber || `OS-${Math.floor(1000 + Math.random() * 9000)}`;
    const stepDef = WORKFLOW_STEPS.find((s) => s.id === 'prod_enviar_comercial') || WORKFLOW_STEPS[1];

    const newOrder: WorkOrder = {
      id: 'wo_' + Date.now(),
      osNumber: osNum,
      clientName: newOrderData.clientName || 'Cliente Não Informado',
      clientPhone: newOrderData.clientPhone || '',
      equipmentModel: newOrderData.equipmentModel || 'Equipamento Geral',
      serialNumber: newOrderData.serialNumber || 'S/N',
      reportedDefect: newOrderData.reportedDefect || 'Não especificado',
      entryDate: newOrderData.entryDate || new Date().toISOString().split('T')[0],
      technicianName: newOrderData.technicianName || activeCollaborator.name,
      priority: newOrderData.priority || 'Média',
      serviceType: newOrderData.serviceType || 'Corretiva',
      preliminaryNotes: newOrderData.preliminaryNotes || '',
      origin: newOrderData.origin || 'papel_ocr',
      paperScannedImage: newOrderData.paperScannedImage,
      ocrConfidence: newOrderData.ocrConfidence || 98,
      macroPhase: 'abertura',
      currentSector: 'comercial', // Sent to commercial desk
      currentStepId: 'com_inserir_planilha',
      stepStartedAt: new Date().toISOString(),
      hasReadyStamp: false,
      controlSpreadsheetInserted: false,
      testSheetPrinted: false,
      testSheetSentToProduction: false,
      technicalReportApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: 'hist_' + Date.now(),
          fromStepId: 'prod_preencher',
          toStepId: 'com_inserir_planilha',
          fromStepTitle: 'Preencher a O.S. (Papel Físico)',
          toStepTitle: 'Inserir a O.S. na planilha de controle',
          sector: 'producao',
          collaboratorName: activeCollaborator.name,
          collaboratorRole: activeCollaborator.role,
          actionType: 'ocr_digitalizacao',
          timestamp: new Date().toISOString(),
          durationMinutes: 15,
          note: `O.S. digitalizada e aprovada na bancada física por ${activeCollaborator.name}.`,
        },
      ],
    };

    setWorkOrders((prev) => [newOrder, ...prev]);

    triggerNotification({
      osId: newOrder.id,
      osNumber: newOrder.osNumber,
      title: 'Nova O.S. Aberta via OCR',
      message: `O.S. ${newOrder.osNumber} (${newOrder.equipmentModel}) digitalizada e despachada ao Comercial.`,
      sector: 'comercial',
      type: 'success',
    });

    return newOrder;
  };

  // Add multiple Work Orders at once (Batch OCR Import)
  const addWorkOrdersBatch = (ordersData: Partial<WorkOrder>[]): WorkOrder[] => {
    if (ordersData.length === 0) return [];

    const now = Date.now();
    const createdOrders: WorkOrder[] = ordersData.map((data, index) => {
      const osNum = data.osNumber || `OS-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        id: 'wo_' + (now + index),
        osNumber: osNum,
        clientName: data.clientName || 'Cliente Não Informado',
        clientPhone: data.clientPhone || '',
        equipmentModel: data.equipmentModel || 'Equipamento Geral',
        serialNumber: data.serialNumber || 'S/N',
        reportedDefect: data.reportedDefect || 'Não especificado',
        entryDate: data.entryDate || new Date().toISOString().split('T')[0],
        technicianName: data.technicianName || activeCollaborator.name,
        priority: data.priority || 'Média',
        serviceType: data.serviceType || 'Corretiva',
        preliminaryNotes: data.preliminaryNotes || '',
        origin: 'papel_ocr',
        paperScannedImage: data.paperScannedImage,
        ocrConfidence: data.ocrConfidence || 98,
        macroPhase: 'abertura',
        currentSector: 'comercial',
        currentStepId: 'com_inserir_planilha',
        stepStartedAt: new Date().toISOString(),
        hasReadyStamp: false,
        controlSpreadsheetInserted: false,
        testSheetPrinted: false,
        testSheetSentToProduction: false,
        technicalReportApproved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: 'hist_' + (now + index),
            fromStepId: 'prod_preencher',
            toStepId: 'com_inserir_planilha',
            fromStepTitle: 'Preencher a O.S. (Papel Físico em Lote)',
            toStepTitle: 'Inserir a O.S. na planilha de controle',
            sector: 'producao',
            collaboratorName: activeCollaborator.name,
            collaboratorRole: activeCollaborator.role,
            actionType: 'ocr_digitalizacao',
            timestamp: new Date().toISOString(),
            durationMinutes: 15,
            note: `O.S. digitalizada e validada em lote por ${activeCollaborator.name}.`,
          },
        ],
      };
    });

    setWorkOrders((prev) => [...createdOrders, ...prev]);

    triggerNotification({
      osId: createdOrders[0].id,
      osNumber: `${createdOrders.length} O.S.`,
      title: `Lote de ${createdOrders.length} O.S. Importado via OCR`,
      message: `As O.S. (${createdOrders.map((o) => o.osNumber).join(', ')}) foram digitalizadas e enviadas ao Comercial.`,
      sector: 'comercial',
      type: 'success',
    });

    return createdOrders;
  };

  // Advance Work Order to next step in BPMN flow
  const advanceWorkOrder = (osId: string, targetStepId: string, note?: string) => {
    const targetStep = WORKFLOW_STEPS.find((s) => s.id === targetStepId);
    if (!targetStep) return;

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== osId) return wo;

        const currentStepDef = WORKFLOW_STEPS.find((s) => s.id === wo.currentStepId);
        const startTime = new Date(wo.stepStartedAt).getTime();
        const durationMin = Math.max(1, Math.round((Date.now() - startTime) / (1000 * 60)));

        const newHistoryItem: TransitionHistoryItem = {
          id: 'hist_' + Date.now(),
          fromStepId: wo.currentStepId,
          toStepId: targetStep.id,
          fromStepTitle: currentStepDef?.title || wo.currentStepId,
          toStepTitle: targetStep.title,
          sector: targetStep.sector,
          collaboratorName: activeCollaborator.name,
          collaboratorRole: activeCollaborator.role,
          actionType: 'avanco',
          timestamp: new Date().toISOString(),
          durationMinutes: durationMin,
          note: note || `Avanço de etapa realizado por ${activeCollaborator.name}`,
        };

        const isFinishing = targetStep.id === 'concluida';
        const newPhase = isFinishing
          ? 'concluida'
          : targetStep.macroPhase || (targetStep.order >= 11 ? 'encerramento' : 'abertura');

        return {
          ...wo,
          currentStepId: targetStep.id,
          currentSector: targetStep.sector,
          macroPhase: newPhase,
          stepStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [newHistoryItem, ...wo.history],
        };
      })
    );

    const updatedWo = workOrders.find((w) => w.id === osId);
    if (updatedWo) {
      triggerNotification({
        osId: updatedWo.id,
        osNumber: updatedWo.osNumber,
        title: `Etapa Concluída: ${targetStep.title}`,
        message: `O.S. ${updatedWo.osNumber} agora está no setor de ${targetStep.sector.toUpperCase()} com ${activeCollaborator.name}.`,
        sector: targetStep.sector,
        type: 'info',
      });
    }
  };

  // Reject / Send Back Work Order (e.g. Gateway "Não")
  const rejectWorkOrder = (osId: string, returnStepId: string, reason: string) => {
    const returnStep = WORKFLOW_STEPS.find((s) => s.id === returnStepId);
    if (!returnStep) return;

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== osId) return wo;
        const currentStepDef = WORKFLOW_STEPS.find((s) => s.id === wo.currentStepId);
        const startTime = new Date(wo.stepStartedAt).getTime();
        const durationMin = Math.max(1, Math.round((Date.now() - startTime) / (1000 * 60)));

        const newHistoryItem: TransitionHistoryItem = {
          id: 'hist_' + Date.now(),
          fromStepId: wo.currentStepId,
          toStepId: returnStep.id,
          fromStepTitle: currentStepDef?.title || wo.currentStepId,
          toStepTitle: returnStep.title,
          sector: returnStep.sector,
          collaboratorName: activeCollaborator.name,
          collaboratorRole: activeCollaborator.role,
          actionType: 'devolucao',
          timestamp: new Date().toISOString(),
          durationMinutes: durationMin,
          note: `DEVOLUÇÃO / RETRABALHO: ${reason}`,
        };

        return {
          ...wo,
          currentStepId: returnStep.id,
          currentSector: returnStep.sector,
          stepStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [newHistoryItem, ...wo.history],
        };
      })
    );

    const updatedWo = workOrders.find((w) => w.id === osId);
    if (updatedWo) {
      triggerNotification({
        osId: updatedWo.id,
        osNumber: updatedWo.osNumber,
        title: 'Retrabalho / O.S. Devolvida',
        message: `O.S. ${updatedWo.osNumber} retornou para "${returnStep.title}". Motivo: ${reason}`,
        sector: returnStep.sector,
        type: 'alert',
      });
    }
  };

  // Inserir carimbo de "Pronto" (Produção)
  const applyReadyStamp = (osId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== osId) return wo;

        const newHistoryItem: TransitionHistoryItem = {
          id: 'hist_' + Date.now(),
          fromStepId: wo.currentStepId,
          toStepId: 'com_apagar_pcp',
          fromStepTitle: 'Inserir o carimbo de "Pronto"',
          toStepTitle: 'Apagar as informações do PCP',
          sector: 'comercial',
          collaboratorName: activeCollaborator.name,
          collaboratorRole: activeCollaborator.role,
          actionType: 'carimbo_pronto',
          timestamp: new Date().toISOString(),
          durationMinutes: 10,
          note: `Carimbo de "Pronto" autenticado pela bancada técnica por ${activeCollaborator.name}.`,
        };

        return {
          ...wo,
          hasReadyStamp: true,
          currentStepId: 'com_apagar_pcp',
          currentSector: 'comercial',
          stepStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [newHistoryItem, ...wo.history],
        };
      })
    );

    const updatedWo = workOrders.find((w) => w.id === osId);
    if (updatedWo) {
      triggerNotification({
        osId: updatedWo.id,
        osNumber: updatedWo.osNumber,
        title: 'Carimbo de "Pronto" Aplicado',
        message: `O.S. ${updatedWo.osNumber} teve carimbo técnico validado e segue para baixa no PCP.`,
        sector: 'comercial',
        type: 'success',
      });
    }
  };

  const updateWorkOrder = (osId: string, partial: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== osId) return wo;
        return {
          ...wo,
          ...partial,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetToInitialData = () => {
    setWorkOrders(INITIAL_WORK_ORDERS);
    localStorage.removeItem(STORAGE_KEY_WORK_ORDERS);
    triggerNotification({
      osId: 'system',
      osNumber: 'SYS',
      title: 'Sistema Reiniciado',
      message: 'Dados originais do fluxo de trabalho restaurados para demonstração.',
      sector: 'producao',
      type: 'info',
    });
  };

  return {
    workOrders,
    activeCollaborator,
    setActiveCollaborator,
    notifications,
    activeTab,
    setActiveTab,
    filterSector,
    setFilterSector,
    searchQuery,
    setSearchQuery,
    isFeedDrawerOpen,
    setIsFeedDrawerOpen,
    activeToast,
    setActiveToast,
    addWorkOrder,
    addWorkOrdersBatch,
    advanceWorkOrder,
    rejectWorkOrder,
    applyReadyStamp,
    updateWorkOrder,
    markNotificationRead,
    clearAllNotifications,
    resetToInitialData,
  };
}
