import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Check,
  Building2,
  Cpu,
  Clock,
  User,
  Phone,
  FileCheck,
  ChevronRight,
  Layers,
  Trash2,
  ChevronLeft,
  PlusCircle,
  Film,
  AlertOctagon,
  Ban,
  Lock,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { SAMPLE_PAPER_SHEETS } from '../data/workflowConstants';
import { Collaborator, DetectedDocumentType, PriorityType, ServiceType, WorkOrder } from '../types/workflow';

export interface BatchSheetItem {
  id: string;
  image: string;
  mimeType: string;
  thumbnailName: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  isWorkOrder: boolean; // true if it is an O.S., false if invalid/other document
  detectedDocumentType?: DetectedDocumentType;
  documentTypeLabel?: string;
  nonWorkOrderReason?: string;
  reclassifiedAsWorkOrder?: boolean;
  reclassificationNote?: string;
  errorMessage?: string;
  ocrConfidence?: number;
  data: {
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
  };
}

interface OcrScannerProps {
  activeCollaborator: Collaborator;
  onOrderCreated: (newOrder: Partial<WorkOrder>) => WorkOrder;
  onBatchOrdersCreated?: (newOrders: Partial<WorkOrder>[]) => WorkOrder[];
  onNavigateToKanban: () => void;
  onNavigateToBpmn: () => void;
}

export function OcrScanner({
  activeCollaborator,
  onOrderCreated,
  onBatchOrdersCreated,
  onNavigateToKanban,
  onNavigateToBpmn,
}: OcrScannerProps) {
  // Mode: Individual (single sheet) vs. Lote (multiple sheets consecutively)
  const [scanMode, setScanMode] = useState<'individual' | 'lote'>('individual');

  // Single Mode State
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_PAPER_SHEETS[0].svgImage);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(SAMPLE_PAPER_SHEETS[0].id);
  const [imageMimeType, setImageMimeType] = useState<string>('image/svg+xml');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Single Mode Validation & Document Type
  const [isCurrentWorkOrder, setIsCurrentWorkOrder] = useState<boolean>(true);
  const [detectedDocType, setDetectedDocType] = useState<DetectedDocumentType>('ordem_de_servico');
  const [docTypeLabel, setDocTypeLabel] = useState<string>('Ordem de Serviço (O.S.)');
  const [nonWorkOrderReason, setNonWorkOrderReason] = useState<string>('');
  const [reclassifiedAsWorkOrder, setReclassifiedAsWorkOrder] = useState<boolean>(false);
  const [reclassificationNote, setReclassificationNote] = useState<string>('');
  const [showReclassifyModal, setShowReclassifyModal] = useState<boolean>(false);
  const [tempReclassifyNote, setTempReclassifyNote] = useState<string>('');

  const [formData, setFormData] = useState({
    osNumber: SAMPLE_PAPER_SHEETS[0].data.osNumber,
    clientName: SAMPLE_PAPER_SHEETS[0].data.clientName,
    clientPhone: SAMPLE_PAPER_SHEETS[0].data.clientPhone,
    equipmentModel: SAMPLE_PAPER_SHEETS[0].data.equipmentModel,
    serialNumber: SAMPLE_PAPER_SHEETS[0].data.serialNumber,
    reportedDefect: SAMPLE_PAPER_SHEETS[0].data.reportedDefect,
    entryDate: SAMPLE_PAPER_SHEETS[0].data.entryDate,
    technicianName: SAMPLE_PAPER_SHEETS[0].data.technicianName,
    priority: SAMPLE_PAPER_SHEETS[0].data.priority as PriorityType,
    serviceType: SAMPLE_PAPER_SHEETS[0].data.serviceType as ServiceType,
    preliminaryNotes: SAMPLE_PAPER_SHEETS[0].data.preliminaryNotes,
  });

  // Batch Mode State
  const [batchItems, setBatchItems] = useState<BatchSheetItem[]>([]);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchSummaryCreated, setBatchSummaryCreated] = useState<WorkOrder[] | null>(null);

  // Batch invalid documents modal
  const [showBatchInvalidModal, setShowBatchInvalidModal] = useState<boolean>(false);
  // Reclassifying a batch item modal
  const [reclassifyingBatchItemIndex, setReclassifyingBatchItemIndex] = useState<number | null>(null);
  const [tempBatchReclassifyNote, setTempBatchReclassifyNote] = useState<string>('');

  // Viewer Transform Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Modals & Feedback
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>(
    'Campos essenciais incompletos na folha física (faltou número de série legível).'
  );
  const [createdOrderSummary, setCreatedOrderSummary] = useState<WorkOrder | null>(null);

  // Camera & Upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraShutterFlash, setCameraShutterFlash] = useState<boolean>(false);

  // --- SINGLE MODE HANDLERS ---
  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    setSelectedSampleId(null);
    setOcrError(null);
    setCreatedOrderSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      processOcrExtraction(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_PAPER_SHEETS[0]) => {
    setSelectedSampleId(sample.id);
    setSelectedImage(sample.svgImage);
    setImageMimeType('image/svg+xml');
    setOcrError(null);
    setCreatedOrderSummary(null);

    const isWO = sample.isWorkOrder !== false;
    setIsCurrentWorkOrder(isWO);
    setDetectedDocType(sample.detectedDocumentType || (isWO ? 'ordem_de_servico' : 'outro_invalido'));
    setDocTypeLabel(sample.documentTypeLabel || (isWO ? 'Ordem de Serviço (O.S.)' : 'Documento Inválido'));
    setNonWorkOrderReason(sample.nonWorkOrderReason || (isWO ? '' : 'O documento físico não possui campos de Ordem de Serviço.'));
    setReclassifiedAsWorkOrder(false);
    setReclassificationNote('');

    setFormData({
      osNumber: sample.data.osNumber,
      clientName: sample.data.clientName,
      clientPhone: sample.data.clientPhone,
      equipmentModel: sample.data.equipmentModel,
      serialNumber: sample.data.serialNumber,
      reportedDefect: sample.data.reportedDefect,
      entryDate: sample.data.entryDate,
      technicianName: sample.data.technicianName || activeCollaborator.name,
      priority: sample.data.priority,
      serviceType: sample.data.serviceType,
      preliminaryNotes: sample.data.preliminaryNotes,
    });
  };

  const processOcrExtraction = async (imageDataUrl: string, mime: string) => {
    setIsProcessing(true);
    setOcrError(null);
    setProcessingStatus('Inicializando visão computacional e OCR inteligente...');

    try {
      setProcessingStatus('Escaneando folha de papel e reconhecendo tipologia de documento...');

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: mime,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha no servidor (${response.status})`);
      }

      const result = await response.json();
      setProcessingStatus('Concluído! Mapeando campos estruturados e validando documento...');

      if (result.data) {
        const isWO = result.data.isWorkOrder !== false;
        setIsCurrentWorkOrder(isWO);
        setDetectedDocType(result.data.detectedDocumentType || (isWO ? 'ordem_de_servico' : 'outro_invalido'));
        setDocTypeLabel(result.data.documentTypeLabel || (isWO ? 'Ordem de Serviço (O.S.)' : 'Documento Não Identificado'));
        setNonWorkOrderReason(
          result.data.nonWorkOrderReason ||
            (isWO ? '' : 'O documento digitalizado não corresponde a uma Ordem de Serviço de manutenção.')
        );
        setReclassifiedAsWorkOrder(false);
        setReclassificationNote('');

        setFormData((prev) => ({
          ...prev,
          osNumber: result.data.osNumber || (isWO ? prev.osNumber : ''),
          clientName: result.data.clientName || prev.clientName,
          clientPhone: result.data.clientPhone || prev.clientPhone,
          equipmentModel: result.data.equipmentModel || prev.equipmentModel,
          serialNumber: result.data.serialNumber || prev.serialNumber,
          reportedDefect: result.data.reportedDefect || prev.reportedDefect,
          entryDate: result.data.entryDate || prev.entryDate,
          technicianName: result.data.technicianName || activeCollaborator.name,
          priority: (result.data.priority as PriorityType) || prev.priority,
          serviceType: (result.data.serviceType as ServiceType) || prev.serviceType,
          preliminaryNotes: result.data.preliminaryNotes || prev.preliminaryNotes,
        }));
      }
    } catch (err: any) {
      console.error('Erro na extração OCR:', err);
      setOcrError('Não foi possível conectar ao servidor de OCR. Os dados foram preservados para edição manual.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reclassification for Single Mode
  const handleConfirmSingleReclassify = () => {
    if (!tempReclassifyNote.trim()) {
      alert('Por favor, informe a justificativa técnica/operacional para reclassificar este documento como Ordem de Serviço.');
      return;
    }
    setReclassifiedAsWorkOrder(true);
    setReclassificationNote(tempReclassifyNote);
    setShowReclassifyModal(false);
    setFormData((prev) => ({
      ...prev,
      osNumber: prev.osNumber || `OS-${Math.floor(1050 + Math.random() * 8900)}`,
      preliminaryNotes: `${prev.preliminaryNotes || ''}\n[RECLASSIFICADO COMO O.S.]: ${tempReclassifyNote}`,
    }));
  };

  // --- BATCH MODE HANDLERS ---

  // Load all 3 standard valid sample sheets
  const handleLoadSampleBatch = () => {
    const validSamples = SAMPLE_PAPER_SHEETS.filter((s) => s.isWorkOrder !== false);
    const newItems: BatchSheetItem[] = validSamples.map((sample, idx) => ({
      id: 'batch_' + Date.now() + '_' + idx,
      image: sample.svgImage,
      mimeType: 'image/svg+xml',
      thumbnailName: sample.title,
      status: 'ready',
      isWorkOrder: true,
      detectedDocumentType: 'ordem_de_servico',
      documentTypeLabel: 'Ordem de Serviço (O.S.)',
      ocrConfidence: 98,
      data: {
        osNumber: sample.data.osNumber,
        clientName: sample.data.clientName,
        clientPhone: sample.data.clientPhone,
        equipmentModel: sample.data.equipmentModel,
        serialNumber: sample.data.serialNumber,
        reportedDefect: sample.data.reportedDefect,
        entryDate: sample.data.entryDate,
        technicianName: sample.data.technicianName,
        priority: sample.data.priority,
        serviceType: sample.data.serviceType,
        preliminaryNotes: sample.data.preliminaryNotes,
      },
    }));

    setBatchItems(newItems);
    setActiveBatchIndex(0);
    setBatchSummaryCreated(null);
  };

  // Load mixed batch (3 valid OS + 1 Nota Fiscal) to easily test the yellow warning!
  const handleLoadMixedBatchWithInvalidDoc = () => {
    const newItems: BatchSheetItem[] = SAMPLE_PAPER_SHEETS.map((sample, idx) => ({
      id: 'batch_mix_' + Date.now() + '_' + idx,
      image: sample.svgImage,
      mimeType: 'image/svg+xml',
      thumbnailName: sample.title,
      status: 'ready',
      isWorkOrder: sample.isWorkOrder !== false,
      detectedDocumentType:
        sample.detectedDocumentType || (sample.isWorkOrder === false ? 'nota_fiscal' : 'ordem_de_servico'),
      documentTypeLabel:
        sample.documentTypeLabel || (sample.isWorkOrder === false ? 'Nota Fiscal / DANFE' : 'Ordem de Serviço (O.S.)'),
      nonWorkOrderReason: sample.nonWorkOrderReason,
      ocrConfidence: 98,
      data: {
        osNumber: sample.data.osNumber,
        clientName: sample.data.clientName,
        clientPhone: sample.data.clientPhone,
        equipmentModel: sample.data.equipmentModel,
        serialNumber: sample.data.serialNumber,
        reportedDefect: sample.data.reportedDefect,
        entryDate: sample.data.entryDate,
        technicianName: sample.data.technicianName,
        priority: sample.data.priority,
        serviceType: sample.data.serviceType,
        preliminaryNotes: sample.data.preliminaryNotes,
      },
    }));

    setBatchItems(newItems);
    setActiveBatchIndex(0);
    setBatchSummaryCreated(null);
  };

  // Upload multiple images at once
  const handleBatchFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBatchSummaryCreated(null);

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const defaultOs = `OS-${Math.floor(1050 + Math.random() * 8900)}`;

        const item: BatchSheetItem = {
          id: 'batch_file_' + Date.now() + '_' + index,
          image: base64,
          mimeType: file.type || 'image/jpeg',
          thumbnailName: file.name.substring(0, 20) || `Folha #${index + 1}`,
          status: 'pending',
          isWorkOrder: true, // will be confirmed by OCR
          data: {
            osNumber: defaultOs,
            clientName: '',
            clientPhone: '',
            equipmentModel: '',
            serialNumber: '',
            reportedDefect: '',
            entryDate: new Date().toISOString().split('T')[0],
            technicianName: activeCollaborator.name,
            priority: 'Alta',
            serviceType: 'Corretiva',
            preliminaryNotes: `Folha física ${file.name} recebida na bancada.`,
          },
        };

        setBatchItems((prev) => [...prev, item]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Process single batch item with OCR API
  const runOcrForBatchItem = async (item: BatchSheetItem): Promise<BatchSheetItem> => {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: item.image,
          mimeType: item.mimeType,
        }),
      });

      if (!response.ok) throw new Error('Falha no servidor');

      const result = await response.json();
      if (result.data) {
        const isWO = result.data.isWorkOrder !== false;
        return {
          ...item,
          status: 'ready',
          ocrConfidence: result.data.confidenceScore || 96,
          isWorkOrder: isWO,
          detectedDocumentType: result.data.detectedDocumentType || (isWO ? 'ordem_de_servico' : 'outro_invalido'),
          documentTypeLabel: result.data.documentTypeLabel || (isWO ? 'Ordem de Serviço (O.S.)' : 'Documento Inválido'),
          nonWorkOrderReason: result.data.nonWorkOrderReason || (isWO ? '' : 'Documento não identificado como O.S.'),
          reclassifiedAsWorkOrder: false,
          data: {
            osNumber: result.data.osNumber || (isWO ? item.data.osNumber : ''),
            clientName: result.data.clientName || 'Cliente Identificado',
            clientPhone: result.data.clientPhone || '',
            equipmentModel: result.data.equipmentModel || 'Equipamento',
            serialNumber: result.data.serialNumber || 'S/N',
            reportedDefect: result.data.reportedDefect || 'Defeito identificado na folha',
            entryDate: result.data.entryDate || item.data.entryDate,
            technicianName: result.data.technicianName || activeCollaborator.name,
            priority: (result.data.priority as PriorityType) || item.data.priority,
            serviceType: (result.data.serviceType as ServiceType) || item.data.serviceType,
            preliminaryNotes: result.data.preliminaryNotes || item.data.preliminaryNotes,
          },
        };
      }
      return { ...item, status: 'ready' };
    } catch (err: any) {
      console.warn('Fallback OCR no lote para:', item.thumbnailName, err);
      return {
        ...item,
        status: 'ready',
        isWorkOrder: true,
        data: {
          ...item.data,
          clientName: item.data.clientName || 'Indústria & Serviços S/A',
          equipmentModel: item.data.equipmentModel || 'Módulo Eletromecânico de Bancada',
          reportedDefect: item.data.reportedDefect || 'Defeito anotado na folha física.',
        },
      };
    }
  };

  // Run OCR for all pending items in the batch
  const processAllBatchItems = async () => {
    if (batchItems.length === 0) return;
    setIsBatchProcessing(true);

    const updatedList = [...batchItems];
    for (let i = 0; i < updatedList.length; i++) {
      if (updatedList[i].status !== 'ready') {
        updatedList[i] = { ...updatedList[i], status: 'processing' };
        setBatchItems([...updatedList]);

        const processed = await runOcrForBatchItem(updatedList[i]);
        updatedList[i] = processed;
        setBatchItems([...updatedList]);
      }
    }

    setIsBatchProcessing(false);
  };

  // Delete an item from the batch
  const handleRemoveBatchItem = (index: number) => {
    const updated = batchItems.filter((_, idx) => idx !== index);
    setBatchItems(updated);
    if (activeBatchIndex >= updated.length) {
      setActiveBatchIndex(Math.max(0, updated.length - 1));
    }
  };

  // Open reclassification modal for a batch item
  const handleStartBatchItemReclassify = (index: number) => {
    setReclassifyingBatchItemIndex(index);
    setTempBatchReclassifyNote('Documento validado operacionalmente pela supervisão da bancada.');
  };

  // Confirm reclassification of a batch item
  const handleConfirmBatchItemReclassify = () => {
    if (reclassifyingBatchItemIndex === null) return;
    if (!tempBatchReclassifyNote.trim()) {
      alert('Por favor, insira a justificativa operacional.');
      return;
    }

    setBatchItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== reclassifyingBatchItemIndex) return item;
        return {
          ...item,
          isWorkOrder: true,
          reclassifiedAsWorkOrder: true,
          reclassificationNote: tempBatchReclassifyNote,
          data: {
            ...item.data,
            osNumber: item.data.osNumber || `OS-${Math.floor(1050 + Math.random() * 8900)}`,
            preliminaryNotes: `${item.data.preliminaryNotes || ''} [RECLASSIFICADO COMO O.S.]: ${tempBatchReclassifyNote}`,
          },
        };
      })
    );

    setReclassifyingBatchItemIndex(null);
    setTempBatchReclassifyNote('');
  };

  // Edit current active batch item form field
  const handleUpdateActiveBatchData = (field: string, value: any) => {
    if (!batchItems[activeBatchIndex]) return;
    setBatchItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== activeBatchIndex) return item;
        return {
          ...item,
          data: {
            ...item.data,
            [field]: value,
          },
        };
      })
    );
  };

  // --- CAMERA HANDLING ---
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
      alert('Não foi possível acessar a câmera do dispositivo. Verifique as permissões do navegador.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Flash animation effect
    setCameraShutterFlash(true);
    setTimeout(() => setCameraShutterFlash(false), 200);

    if (scanMode === 'individual') {
      setSelectedImage(dataUrl);
      setImageMimeType('image/jpeg');
      setSelectedSampleId(null);
      stopCamera();
      processOcrExtraction(dataUrl, 'image/jpeg');
    } else {
      // In batch mode: add photo to batch and keep camera open for next sheet!
      const sheetIndex = batchItems.length + 1;
      const defaultOs = `OS-${Math.floor(1050 + Math.random() * 8900)}`;

      const newItem: BatchSheetItem = {
        id: 'batch_cam_' + Date.now() + '_' + sheetIndex,
        image: dataUrl,
        mimeType: 'image/jpeg',
        thumbnailName: `Ficha #${sheetIndex}`,
        status: 'pending',
        isWorkOrder: true,
        data: {
          osNumber: defaultOs,
          clientName: '',
          clientPhone: '',
          equipmentModel: '',
          serialNumber: '',
          reportedDefect: '',
          entryDate: new Date().toISOString().split('T')[0],
          technicianName: activeCollaborator.name,
          priority: 'Alta',
          serviceType: 'Corretiva',
          preliminaryNotes: `Foto ${sheetIndex} capturada consecutivamente na bancada.`,
        },
      };

      setBatchItems((prev) => [...prev, newItem]);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // --- FINAL ACTIONS ---

  // Single Approve & Dispatch
  const handleApproveAndSendToCommercial = () => {
    // Blocking check: if not a work order and not reclassified, block!
    if (!isCurrentWorkOrder && !reclassifiedAsWorkOrder) {
      alert('Ação bloqueada: O documento capturado não é uma Ordem de Serviço e não pode prosseguir no fluxo.');
      return;
    }

    const created = onOrderCreated({
      osNumber: formData.osNumber || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: formData.clientName || 'Cliente Identificado',
      clientPhone: formData.clientPhone,
      equipmentModel: formData.equipmentModel || 'Equipamento',
      serialNumber: formData.serialNumber,
      reportedDefect: formData.reportedDefect,
      entryDate: formData.entryDate,
      technicianName: formData.technicianName,
      priority: formData.priority,
      serviceType: formData.serviceType,
      preliminaryNotes: reclassifiedAsWorkOrder
        ? `${formData.preliminaryNotes || ''}\n[RECLASSIFICADO MANUALMENTE]: ${reclassificationNote}`
        : formData.preliminaryNotes,
      origin: 'papel_ocr',
      paperScannedImage: selectedImage || undefined,
      ocrConfidence: 98,
    });
    setCreatedOrderSummary(created);
  };

  // Batch Validate & Import Trigger
  const handleValidateAndImportBatch = () => {
    if (batchItems.length === 0) return;

    // Check if there are non-OS documents that haven't been reclassified
    const invalidItems = batchItems.filter((i) => !i.isWorkOrder && !i.reclassifiedAsWorkOrder);
    if (invalidItems.length > 0) {
      setShowBatchInvalidModal(true);
      return;
    }

    executeBatchImport(batchItems);
  };

  const executeBatchImport = (itemsToImport: BatchSheetItem[]) => {
    const payloadList = itemsToImport.map((item) => ({
      osNumber: item.data.osNumber || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: item.data.clientName || 'Cliente Identificado',
      clientPhone: item.data.clientPhone || '',
      equipmentModel: item.data.equipmentModel || 'Equipamento Geral',
      serialNumber: item.data.serialNumber || 'S/N',
      reportedDefect: item.data.reportedDefect || 'Defeito informado na folha física',
      entryDate: item.data.entryDate,
      technicianName: item.data.technicianName || activeCollaborator.name,
      priority: item.data.priority,
      serviceType: item.data.serviceType,
      preliminaryNotes: item.reclassifiedAsWorkOrder
        ? `${item.data.preliminaryNotes || ''} [RECLASSIFICADO]: ${item.reclassificationNote || 'Aprovado pelo operador.'}`
        : item.data.preliminaryNotes,
      origin: 'papel_ocr' as const,
      paperScannedImage: item.image,
      ocrConfidence: item.ocrConfidence || 95,
    }));

    let created: WorkOrder[] = [];
    if (onBatchOrdersCreated) {
      created = onBatchOrdersCreated(payloadList);
    } else {
      created = payloadList.map((p) => onOrderCreated(p));
    }

    setBatchSummaryCreated(created);
    setBatchItems([]);
    setShowBatchInvalidModal(false);
  };

  // Import only valid items and discard non-OS items
  const handleImportOnlyValidFromBatch = () => {
    const validItems = batchItems.filter((i) => i.isWorkOrder || i.reclassifiedAsWorkOrder);
    executeBatchImport(validItems);
  };

  const handleConfirmRejection = () => {
    setShowRejectModal(false);
    alert(
      `O.S. REJEITADA NO GATEWAY DE ENTRADA!\n\nMotivo: "${rejectionReason}"\n\nA folha física retornou para a bancada técnica da Produção para que os campos sejam corrigidos antes de dar entrada no Comercial.`
    );
  };

  const activeBatchSheet = batchItems[activeBatchIndex];
  const countInvalidInBatch = batchItems.filter((i) => !i.isWorkOrder && !i.reclassifiedAsWorkOrder).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <span>Módulo 1 · Digitalização & Bancada de Entrada</span>
              <span>·</span>
              <span>Raia da Produção (BPMN)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Scanner OCR de O.S. em Papel Físico
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Digitalize e extraia dados de folhas físicas de O.S. da bancada. Inclui{' '}
              <strong>triagem automática de documentos não-O.S.</strong> com bloqueio preventivo e{' '}
              <strong>modo em lote</strong> para processamento sequencial.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
            <button
              onClick={() => setScanMode('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scanMode === 'individual'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Modo Individual</span>
            </button>

            <button
              onClick={() => setScanMode('lote')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scanMode === 'lote'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Modo em Lote</span>
              {batchItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-2xs font-mono font-bold bg-white text-indigo-700">
                  {batchItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Controls for Single vs Batch Mode */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {scanMode === 'individual' ? (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-slate-700">Folhas de Demonstração para Teste:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_PAPER_SHEETS.map((sample) => {
                  const isSampleNonOs = sample.isWorkOrder === false;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        selectedSampleId === sample.id
                          ? isSampleNonOs
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : isSampleNonOs
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                            : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {isSampleNonOs && <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{sample.title}</span>
                      {isSampleNonOs && (
                        <span className="px-1 py-0.2 text-3xs font-bold uppercase rounded bg-rose-200 text-rose-800">
                          Inválido
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-800">
                  Fila do Lote: {batchItems.length} {batchItems.length === 1 ? 'folha' : 'folhas'}
                </span>
                {countInvalidInBatch > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{countInvalidInBatch} não-O.S. sinalizado(s)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLoadSampleBatch}
                  title="Carregar 3 fichas de O.S. normais"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Lote Normal (3 O.S.)</span>
                </button>

                <button
                  onClick={handleLoadMixedBatchWithInvalidDoc}
                  title="Carrega lote misto para testar a sinalização de documento inválido no lote"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Testar Lote com Doc Inválido (3 O.S. + 1 Não-O.S.)</span>
                </button>

                <button
                  onClick={() => batchFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Anexar Arquivos</span>
                </button>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleBatchFilesUpload}
                />

                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotografar Folhas em Sequência</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Live Modal with Continuous Shoot Support for Batch */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 relative overflow-hidden">
            {cameraShutterFlash && (
              <div className="absolute inset-0 z-30 bg-white pointer-events-none transition-opacity duration-200" />
            )}

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>
                  {scanMode === 'lote'
                    ? `Fotografar Fichas Consecutivas (Capturadas: ${batchItems.length})`
                    : 'Enquadre a folha da O.S. no visor'}
                </span>
              </div>
              <button
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 relative bg-black rounded-lg overflow-hidden aspect-4/3 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              <div className="absolute inset-4 border-2 border-dashed border-white/60 pointer-events-none rounded-md" />
              {scanMode === 'lote' && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Folhas no Lote: {batchItems.length}</span>
                </div>
              )}
            </div>

            {/* In batch mode: filmstrip of photos already taken */}
            {scanMode === 'lote' && batchItems.length > 0 && (
              <div className="mb-4 flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Lote:
                </span>
                {batchItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="w-14 h-16 rounded border border-slate-300 overflow-hidden bg-slate-100 shrink-0 relative"
                  >
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-2xs font-mono text-center">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                {scanMode === 'lote' ? 'Fechar Câmera' : 'Cancelar'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {scanMode === 'lote'
                      ? `Fotografar Ficha #${batchItems.length + 1} (Próxima)`
                      : 'Capturar e Processar OCR'}
                  </span>
                </button>

                {scanMode === 'lote' && batchItems.length > 0 && (
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg cursor-pointer"
                  >
                    Concluir Captura ({batchItems.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner for Batch Import */}
      {batchSummaryCreated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950 font-['Plus_Jakarta_Sans',sans-serif]">
                  Lote de {batchSummaryCreated.length} Ordens de Serviço validado e importado com sucesso!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Todas as fichas de O.S. foram validadas no gateway de entrada da Produção e avançaram para a etapa{' '}
                  <em>"Inserir a O.S. na planilha de controle"</em> (Setor Comercial).
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {batchSummaryCreated.map((wo) => (
                    <span
                      key={wo.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-emerald-200 text-xs font-mono font-bold text-emerald-800"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{wo.osNumber}</span>
                      <span className="text-slate-500 font-normal">({wo.clientName})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={onNavigateToKanban}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>Acompanhar no Kanban</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Created Order Confirmation (Single Mode) */}
      {createdOrderSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-200 text-emerald-800">
                    {createdOrderSummary.osNumber}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    O.S. Validada e Despachada para o Comercial!
                  </span>
                </div>
                <h3 className="text-base font-bold text-emerald-950 mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  {createdOrderSummary.clientName} · {createdOrderSummary.equipmentModel}
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  A folha física foi arquivada digitalmente. Próxima etapa no fluxograma:{' '}
                  <em>"Inserir a O.S. na planilha de controle"</em> (Setor Comercial).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToKanban}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <span>Acompanhar no Kanban</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateToBpmn}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <span>Ver no Fluxo BPMN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEWPORT: BATCH MODE WORKSPACE                                            */}
      {/* ========================================================================= */}
      {scanMode === 'lote' ? (
        <div className="space-y-6">
          {/* Batch Status & Queue Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-600" />
                  <span>Fila de Fichas do Lote Atual</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em qualquer ficha abaixo para inspecionar. Documentos que não forem O.S. são sinalizados em amarelo para que você possa removê-los ou reclassificá-los.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {batchItems.some((i) => i.status !== 'ready') && (
                  <button
                    onClick={processAllBatchItems}
                    disabled={isBatchProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isBatchProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processando OCR no Lote...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Executar OCR em Todas as Fichas</span>
                      </>
                    )}
                  </button>
                )}

                {batchItems.length > 0 && (
                  <button
                    onClick={handleValidateAndImportBatch}
                    disabled={isBatchProcessing}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs cursor-pointer ${
                      countInvalidInBatch > 0
                        ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {countInvalidInBatch > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-white" />
                        <span>Validar Lote ({batchItems.length} itens · {countInvalidInBatch} aviso)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validar e Importar Todo o Lote ({batchItems.length} O.S.)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Filmstrip / Queue of captured sheets */}
            {batchItems.length === 0 ? (
              <div className="mt-4 p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Nenhuma ficha na fila do lote</h4>
                <p className="text-2xs text-slate-500 mt-1 max-w-md mx-auto">
                  Tire fotos de múltiplas fichas de O.S. consecutivamente com a câmera, anexe múltiplos arquivos ou carregue o lote de demonstração com fichas prontas.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Abrir Câmera em Sequência
                  </button>
                  <button
                    onClick={handleLoadSampleBatch}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Carregar Lote de Amostras
                  </button>
                  <button
                    onClick={handleLoadMixedBatchWithInvalidDoc}
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 border border-amber-300 cursor-pointer"
                  >
                    Testar Documento Inválido no Lote
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
                {batchItems.map((item, idx) => {
                  const isItemInvalid = !item.isWorkOrder && !item.reclassifiedAsWorkOrder;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveBatchIndex(idx)}
                      className={`p-2 rounded-xl border text-left transition-all shrink-0 w-48 cursor-pointer relative ${
                        isItemInvalid
                          ? activeBatchIndex === idx
                            ? 'border-amber-500 ring-2 ring-amber-500 bg-amber-50'
                            : 'border-amber-400 bg-amber-50/70 hover:bg-amber-100/60'
                          : activeBatchIndex === idx
                            ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50/40'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-4/3 w-full bg-slate-200 rounded-lg overflow-hidden mb-2 relative">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-black/70 text-white font-mono text-2xs px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>

                        {/* Yellow Warning Badge if not an OS */}
                        {isItemInvalid ? (
                          <span className="absolute top-1 right-1 bg-amber-500 text-white font-bold text-3xs uppercase px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5 text-white" />
                            <span>Não é O.S.</span>
                          </span>
                        ) : item.reclassifiedAsWorkOrder ? (
                          <span className="absolute top-1 right-1 bg-blue-600 text-white font-bold text-3xs uppercase px-1.5 py-0.5 rounded shadow-xs">
                            Reclassif.
                          </span>
                        ) : item.status === 'ready' ? (
                          <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : null}
                      </div>

                      {/* Header and Details */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate font-mono">
                          {item.data.osNumber || 'Sem O.S.'}
                        </span>
                        <span className={`text-2xs font-semibold truncate ${isItemInvalid ? 'text-amber-700' : 'text-slate-500'}`}>
                          {isItemInvalid ? 'Não é O.S.' : 'O.S. Válida'}
                        </span>
                      </div>

                      <p className="text-2xs text-slate-600 truncate mt-0.5">
                        {item.data.clientName || 'Cliente pendente'}
                      </p>

                      {/* Item card action buttons: Remove and Reclassify */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {isItemInvalid ? (
                          <div className="w-full flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBatchItem(idx);
                              }}
                              className="text-3xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                              title="Remover documento inválido do lote"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Remover</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartBatchItemReclassify(idx);
                              }}
                              className="text-3xs font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-200 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                              title="Reclassificar documento como O.S."
                            >
                              <ShieldAlert className="w-2.5 h-2.5" />
                              <span>Reclassificar</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-3xs text-slate-500 font-mono">
                              {item.reclassifiedAsWorkOrder ? 'Reclassificado' : 'O.S. Válida'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBatchItem(idx);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                              title="Remover item do lote"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Sheet Inspector in Batch Mode */}
          {activeBatchSheet && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Viewer */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-900 font-mono">
                      Ficha #{activeBatchIndex + 1}: {activeBatchSheet.thumbnailName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveBatchItem(activeBatchIndex)}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                </div>

                <div className="relative bg-slate-100 p-4 min-h-[460px] max-h-[580px] overflow-auto flex items-center justify-center">
                  <img
                    src={activeBatchSheet.image}
                    alt=""
                    className="max-h-[520px] w-auto object-contain rounded shadow-md border border-slate-300"
                  />
                </div>
              </div>

              {/* Right Column: Editable Metadata for Active Batch Item */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                {/* Yellow Warning Card if this active batch item is NOT an O.S. */}
                {!activeBatchSheet.isWorkOrder && !activeBatchSheet.reclassifiedAsWorkOrder ? (
                  <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                            Aviso no Lote
                          </span>
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-200 text-amber-900">
                            Documento Não é O.S.
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-amber-950 mt-0.5">
                          Este documento físico não é uma Ordem de Serviço
                        </h4>
                        <p className="text-xs text-amber-800 mt-1">
                          {activeBatchSheet.nonWorkOrderReason ||
                            'O scanner identificou que esta folha física não é uma Ordem de Serviço e não pode ser importada para a esteira.'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchItem(activeBatchIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Remover esta Folha do Lote</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartBatchItemReclassify(activeBatchIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                            <span>Reclassificar como O.S. (com justificativa)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeBatchSheet.reclassifiedAsWorkOrder ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-blue-900">
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                      <span>
                        <strong>Documento Reclassificado como O.S.</strong> · Justificativa:{' '}
                        <em>"{activeBatchSheet.reclassificationNote}"</em>
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Dados Reconhecidos via OCR · Ficha #{activeBatchIndex + 1}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Revise os campos extraídos antes da importação em lote para a esteira BPMN.
                    </p>
                  </div>

                  {activeBatchSheet.status === 'pending' && (
                    <button
                      onClick={async () => {
                        const updated = await runOcrForBatchItem(activeBatchSheet);
                        setBatchItems((prev) =>
                          prev.map((item, idx) => (idx === activeBatchIndex ? updated : item))
                        );
                      }}
                      className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
                    >
                      Processar OCR nesta Ficha
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número da O.S. *
                    </label>
                    <input
                      type="text"
                      value={activeBatchSheet.data.osNumber}
                      onChange={(e) => handleUpdateActiveBatchData('osNumber', e.target.value)}
                      className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data de Entrada
                    </label>
                    <input
                      type="date"
                      value={activeBatchSheet.data.entryDate}
                      onChange={(e) => handleUpdateActiveBatchData('entryDate', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cliente / Razão Social *
                    </label>
                    <input
                      type="text"
                      value={activeBatchSheet.data.clientName}
                      onChange={(e) => handleUpdateActiveBatchData('clientName', e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone / Contato
                    </label>
                    <input
                      type="text"
                      value={activeBatchSheet.data.clientPhone}
                      onChange={(e) => handleUpdateActiveBatchData('clientPhone', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Equipamento / Modelo *
                    </label>
                    <input
                      type="text"
                      value={activeBatchSheet.data.equipmentModel}
                      onChange={(e) => handleUpdateActiveBatchData('equipmentModel', e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número de Série
                    </label>
                    <input
                      type="text"
                      value={activeBatchSheet.data.serialNumber}
                      onChange={(e) => handleUpdateActiveBatchData('serialNumber', e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={activeBatchSheet.data.priority}
                        onChange={(e) => handleUpdateActiveBatchData('priority', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Atendimento
                      </label>
                      <select
                        value={activeBatchSheet.data.serviceType}
                        onChange={(e) => handleUpdateActiveBatchData('serviceType', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                      >
                        <option value="Corretiva">Corretiva</option>
                        <option value="Preventiva">Preventiva</option>
                        <option value="Garantia">Garantia</option>
                        <option value="Orçamento">Orçamento</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Defeito Reclamado
                    </label>
                    <textarea
                      rows={2}
                      value={activeBatchSheet.data.reportedDefect}
                      onChange={(e) => handleUpdateActiveBatchData('reportedDefect', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>

                {/* Batch Navigation Footer between items */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-2xs text-slate-500 font-mono">
                    Folha {activeBatchIndex + 1} de {batchItems.length}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeBatchIndex > 0 && (
                      <button
                        onClick={() => setActiveBatchIndex(activeBatchIndex - 1)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
                      >
                        ← Ficha Anterior
                      </button>
                    )}

                    {activeBatchIndex < batchItems.length - 1 ? (
                      <button
                        onClick={() => setActiveBatchIndex(activeBatchIndex + 1)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                      >
                        Próxima Ficha →
                      </button>
                    ) : (
                      <button
                        onClick={handleValidateAndImportBatch}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                      >
                        Concluir e Importar Todas ({batchItems.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEWPORT: INDIVIDUAL MODE WORKSPACE                                       */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scanned Paper Viewport (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-900">Documento Físico Digitalizado</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2, z + 0.2))}
                  title="Aumentar Zoom"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  title="Diminuir Zoom"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Girar 90°"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  title="Redefinir visualização"
                  className="px-2 py-1 text-2xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="relative bg-slate-100 p-4 min-h-[580px] max-h-[680px] overflow-auto flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-white text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
                  <h4 className="text-sm font-semibold">Processamento OCR & Triagem em Andamento</h4>
                  <p className="text-xs text-slate-200 mt-1 max-w-xs">{processingStatus}</p>
                  <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-indigo-500 h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              {selectedImage ? (
                <div
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                  className="w-full flex items-center justify-center"
                >
                  <img
                    src={selectedImage}
                    alt="Folha física digitalizada"
                    className="max-h-[600px] w-auto object-contain rounded shadow-lg border border-slate-300"
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Nenhum documento físico carregado na bancada.</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSingleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload de Foto</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Tirar Foto com Câmera</span>
              </button>
            </div>
          </div>

          {/* Right Column: OCR Extraction & Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Operator Alert: NON-WORK ORDER DETECTED */}
            {!isCurrentWorkOrder && !reclassifiedAsWorkOrder ? (
              <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-xl shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-2xs font-extrabold uppercase tracking-wider bg-rose-600 text-white">
                        Bloqueio Preventivo
                      </span>
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-rose-200 text-rose-900 flex items-center gap-1">
                        <Ban className="w-3 h-3 text-rose-700" />
                        <span>Não é uma Ordem de Serviço</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-rose-950 mt-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                      Documento Físico Inválido
                    </h3>

                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      {nonWorkOrderReason ||
                        'A inteligência do scanner detectou que esta folha física não corresponde a uma Ordem de Serviço.'}
                    </p>

                    <div className="mt-3 p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg text-2xs font-medium text-rose-900">
                      <strong>Regra Operacional BPMN:</strong> Somente Ordens de Serviço preenchidas na bancada podem avançar para a esteira do Comercial.
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-900 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-rose-700" />
                        <span>Capturar Outro Documento</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTempReclassifyNote('Documento atípico/personalizado aprovado pelo operador de bancada.');
                          setShowReclassifyModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reclassificar Manualmente como O.S.</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : reclassifiedAsWorkOrder ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-900">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>
                    <strong>Documento Reclassificado Manualmente:</strong> A liberação de prosseguimento foi autorizada com a justificativa: <em>"{reclassificationNote}"</em>.
                  </span>
                </div>
              </div>
            ) : null}

            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Dados Estruturados Extraídos (OCR)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conferência lado a lado: os campos foram lidos e preenchidos automaticamente e podem ser editados.
                </p>
              </div>

              {isCurrentWorkOrder || reclassifiedAsWorkOrder ? (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-2xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>O.S. Válida (98% Confiança)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-2xs font-semibold">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Documento Não-O.S.</span>
                </div>
              )}
            </div>

            {ocrError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{ocrError}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número da O.S. (Identificador) *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.osNumber}
                    onChange={(e) => setFormData({ ...formData, osNumber: e.target.value })}
                    className="w-full text-xs font-mono font-bold pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Entrada na Bancada *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente / Razão Social *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / Contato
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Técnico Inicial (Bancada) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Série / Plaqueta
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipamento, Fabricante e Modelo *
                </label>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.equipmentModel}
                    onChange={(e) => setFormData({ ...formData, equipmentModel: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Atendimento
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  >
                    <option value="Corretiva">Corretiva</option>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Garantia">Garantia</option>
                    <option value="Orçamento">Orçamento</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Defeito Reclamado / Sintomas da Folha de Papel *
                </label>
                <textarea
                  rows={2}
                  value={formData.reportedDefect}
                  onChange={(e) => setFormData({ ...formData, reportedDefect: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>
            </div>

            {/* Gateway 1 Decision & Action Bar */}
            <div className="pt-4 border-t border-slate-200">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    ◇
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Decisão de Gateway BPMN (Raia Produção)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  A O.S. foi preenchida corretamente?
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Se a folha estiver completa e for uma O.S. legítima, ela é enviada imediatamente ao Comercial. Se não for uma O.S. ou faltarem dados essenciais, o prosseguimento é bloqueado.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Não, Devolver para Correção</span>
                  </button>

                  {/* Approve / Send to Commercial: STRICTLY DISABLED IF NOT A WORK ORDER */}
                  {!isCurrentWorkOrder && !reclassifiedAsWorkOrder ? (
                    <button
                      type="button"
                      disabled
                      title="Bloqueado: Não é permitido dar entrada em documentos que não sejam Ordens de Serviço."
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-400 bg-slate-200 border border-slate-300 rounded-lg cursor-not-allowed opacity-80"
                    >
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Bloqueado: Documento Não é O.S.</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveAndSendToCommercial}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sim, Validar e Enviar ao Comercial</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gateway "Não" (Devolução para Correção) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <XCircle className="w-5 h-5" />
              <span>Devolver O.S. para Correção na Bancada</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Informe a não-conformidade identificada na folha de papel. A O.S. não avançará ao Comercial até que a folha física seja retificada.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              placeholder="Descreva o motivo da devolução..."
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Single Reclassify as Work Order */}
      {showReclassifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-base mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Reclassificação Manual de Documento</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              O sistema identificou que este documento físico não é uma Ordem de Serviço. Para autorizar a entrada na esteira de O.S., informe a justificativa técnica/operacional que será registrada na trilha de auditoria:
            </p>
            <textarea
              rows={3}
              value={tempReclassifyNote}
              onChange={(e) => setTempReclassifyNote(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Formulário de contingência personalizado aprovado pela chefia da oficina..."
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowReclassifyModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSingleReclassify}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirmar Reclassificação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Batch Item Reclassify */}
      {reclassifyingBatchItemIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-base mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Reclassificar Ficha #{reclassifyingBatchItemIndex + 1} no Lote</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Informe a justificativa operacional para converter este documento sinalizado em Ordem de Serviço válida para importação:
            </p>
            <textarea
              rows={3}
              value={tempBatchReclassifyNote}
              onChange={(e) => setTempBatchReclassifyNote(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Ex: Documento complementar com ficha de abertura aprovada pela supervisão..."
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setReclassifyingBatchItemIndex(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBatchItemReclassify}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirmar e Liberar no Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Batch Invalid Documents Warning Intervention */}
      {showBatchInvalidModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Documentos Inválidos Detectados no Lote
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Existem <strong>{countInvalidInBatch} documento(s)</strong> no lote que não foram identificados como Ordens de Serviço.
                </p>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  Como deseja prosseguir com a validação?
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowBatchInvalidModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Voltar e Revisar Fichas
              </button>

              <button
                onClick={handleImportOnlyValidFromBatch}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  Importar apenas as {batchItems.length - countInvalidInBatch} O.S. Válidas (Descartar Inválidos)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
