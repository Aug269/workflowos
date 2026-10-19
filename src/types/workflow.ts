export type SectorType = 'producao' | 'comercial' | 'responsavel_cliente' | 'faturamento';

export type PriorityType = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type ServiceType = 'Garantia' | 'Orçamento' | 'Corretiva' | 'Preventiva';

export interface TransitionHistoryItem {
  id: string;
  fromStepId: string;
  toStepId: string;
  fromStepTitle: string;
  toStepTitle: string;
  sector: SectorType;
  collaboratorName: string;
  collaboratorRole: string;
  actionType: 'avanco' | 'devolucao' | 'aprovacao' | 'carimbo_pronto' | 'ocr_digitalizacao';
  timestamp: string;
  durationMinutes?: number;
  note?: string;
}

export interface WorkOrder {
  id: string;
  osNumber: string;
  clientName: string;
  clientPhone: string;
  equipmentModel: string;
  serialNumber: string;
  reportedDefect: string;
  entryDate: string;
  technicianName: string;
  priority: PriorityType;
  serviceType: ServiceType;
  preliminaryNotes?: string;
  
  // OCR & Document tracking
  origin: 'papel_ocr' | 'digital';
  paperScannedImage?: string;
  ocrConfidence?: number;
  
  // Workflow state
  macroPhase: 'abertura' | 'encerramento' | 'concluida';
  currentSector: SectorType;
  currentStepId: string;
  stepStartedAt: string; // ISO date for SLA and bottleneck tracking
  
  // Verification Gateways & Compliance
  hasReadyStamp: boolean; // Carimbo de "Pronto"
  controlSpreadsheetInserted: boolean; // Inserida na planilha de controle
  testSheetPrinted: boolean; // Impressa O.S. e ficha de teste
  testSheetSentToProduction: boolean; // Enviada para produção
  technicalReportApproved: boolean; // Laudo aprovado/enviado
  
  // Sub-forms
  technicalReport?: {
    diagnosis: string;
    testsConducted: string;
    partsRequired: string[];
    laborHours: number;
    completedAt: string;
    technician: string;
  };
  
  quote?: {
    partsCost: number;
    laborCost: number;
    totalCost: number;
    paymentTerms: string;
    sentToClientAt?: string;
    clientStatus: 'aguardando' | 'aprovado' | 'rejeitado';
  };
  
  closingInfo?: {
    pcpCleared: boolean;
    clientNotified: boolean;
    deliveryMethod: 'cliente_retira' | 'nos_entregamos';
    deliveryNotes?: string;
    invoiceNumber?: string;
    invoiceAmount?: number;
    invoiceIssuedAt?: string;
    digitizedAttachmentName?: string;
    archivedAt?: string;
  };
  
  createdAt: string;
  updatedAt: string;
  history: TransitionHistoryItem[];
}

export interface WorkflowStepDefinition {
  id: string;
  title: string;
  sector: SectorType;
  macroPhase: 'abertura' | 'encerramento';
  order: number;
  expectedDurationMinutes: number; // For SLA bottleneck calculations
  description: string;
  gatewayQuestion?: string;
  yesLabel?: string;
  noLabel?: string;
  yesNextStepId?: string;
  noNextStepId?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  sector: SectorType | 'gestao';
  email: string;
  avatar: string;
}

export interface ActivityNotification {
  id: string;
  osId: string;
  osNumber: string;
  title: string;
  message: string;
  sector: SectorType;
  type: 'success' | 'warning' | 'alert' | 'info';
  timestamp: string;
  read: boolean;
}

export type DetectedDocumentType = 
  | 'ordem_de_servico' 
  | 'nota_fiscal' 
  | 'comprovante_recibo' 
  | 'laudo_isolado' 
  | 'desenho_tecnico' 
  | 'outro_invalido';

export interface DocumentOcrResult {
  isWorkOrder: boolean;
  detectedDocumentType: DetectedDocumentType;
  documentTypeLabel: string;
  nonWorkOrderReason?: string;
  confidenceScore: number;
  osNumber?: string;
  clientName?: string;
  clientPhone?: string;
  equipmentModel?: string;
  serialNumber?: string;
  reportedDefect?: string;
  entryDate?: string;
  technicianName?: string;
  priority?: PriorityType;
  serviceType?: ServiceType;
  preliminaryNotes?: string;
}

