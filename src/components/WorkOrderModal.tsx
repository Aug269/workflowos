import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  User,
  Building2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Stamp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { WorkOrder, WorkflowStepDefinition, Collaborator } from '../types/workflow';
import { WORKFLOW_STEPS } from '../data/workflowConstants';

interface WorkOrderModalProps {
  order: WorkOrder | null;
  onClose: () => void;
  onAdvance: (orderId: string, nextStepId: string, note?: string) => void;
  onReject: (orderId: string, returnStepId: string, reason: string) => void;
  onApplyReadyStamp: (orderId: string) => void;
  activeCollaborator: Collaborator;
}

export function WorkOrderModal({
  order,
  onClose,
  onAdvance,
  onReject,
  onApplyReadyStamp,
  activeCollaborator,
}: WorkOrderModalProps) {
  if (!order) return null;

  const currentStep = WORKFLOW_STEPS.find((s) => s.id === order.currentStepId) || WORKFLOW_STEPS[0];
  const [activeTab, setActiveTab] = useState<'details' | 'document' | 'history'>('details');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md">
              {order.osNumber}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                {order.clientName}
              </h3>
              <p className="text-2xs text-slate-500">
                {order.equipmentModel} · Série: {order.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ficha de Acompanhamento
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'document'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Folha Física Digitalizada
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Histórico & Rastreabilidade ({order.history.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Current Step Callout with Gateway question */}
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-indigo-700 mb-1">
                  <span>Etapa Atual no Diagrama BPMN</span>
                  <span className="font-mono">Setor: {order.currentSector.toUpperCase()}</span>
                </div>
                <h4 className="text-base font-bold text-indigo-950 font-['Plus_Jakarta_Sans',sans-serif]">
                  {currentStep.title}
                </h4>
                <p className="text-xs text-indigo-900/80 mt-1">
                  {currentStep.description}
                </p>

                {currentStep.gatewayQuestion && (
                  <div className="mt-3 pt-3 border-t border-indigo-200/80 text-xs">
                    <span className="font-bold text-indigo-950">Gateway de Validação: </span>
                    <span className="italic text-indigo-900">{currentStep.gatewayQuestion}</span>
                  </div>
                )}
              </div>

              {/* Special Carimbo de Pronto action banner */}
              {order.currentStepId === 'com_verificar_carimbo' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Stamp className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">
                        Gateway de Decisão: A O.S. possui o carimbo de "Pronto"?
                      </h5>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {order.hasReadyStamp
                          ? 'O carimbo de Pronto foi validado pela Produção. É permitido apagar as informações do PCP.'
                          : 'A O.S. NÃO possui o carimbo de Pronto. Segundo o fluxo, deve ser enviada para a Produção para aposição do carimbo.'}
                      </p>
                      {!order.hasReadyStamp && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => onApplyReadyStamp(order.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Inserir Carimbo de "Pronto" (Produção)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* General Technical Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Cliente:</span>
                  <span className="font-semibold text-slate-800">{order.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Contato:</span>
                  <span className="font-mono text-slate-800">{order.clientPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Data Entrada:</span>
                  <span className="font-mono text-slate-800">{order.entryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Prioridade:</span>
                  <span className="font-semibold text-slate-800">{order.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Atendimento:</span>
                  <span className="font-semibold text-slate-800">{order.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-2xs uppercase font-semibold">Origem:</span>
                  <span className="font-semibold text-indigo-700">
                    {order.origin === 'papel_ocr' ? 'Papel Físico (OCR)' : 'Direto Digital'}
                  </span>
                </div>
              </div>

              {/* Reported Defect Box */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Defeito Relatado na Entrada:
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  {order.reportedDefect}
                </div>
              </div>

              {/* Technical Report if exists */}
              {order.technicalReport && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-900 mb-2">Laudo Técnico da Bancada</h5>
                  <p className="text-xs text-slate-700">{order.technicalReport.diagnosis}</p>
                  <div className="mt-2 text-2xs text-slate-500 font-mono">
                    Horas de bancada: {order.technicalReport.laborHours}h · Técnico: {order.technicalReport.technician}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'document' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-xl min-h-[350px]">
              {order.paperScannedImage ? (
                <img
                  src={order.paperScannedImage}
                  alt="Folha física digitalizada"
                  referrerPolicy="no-referrer"
                  className="max-h-[500px] w-auto object-contain rounded border border-slate-300 shadow-sm"
                />
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <span>Nenhuma folha física anexada para esta O.S.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {order.history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum evento registrado ainda.</p>
              ) : (
                order.history.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-2xs shrink-0 mt-0.5">
                      {order.history.length - idx}
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-2xs text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700">{item.collaboratorName} ({item.collaboratorRole})</span>
                        <span className="font-mono">{new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="font-medium text-slate-900">{item.toStepTitle}</div>
                      {item.note && <div className="text-slate-600 text-2xs mt-1">{item.note}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Ação executada como: <span className="font-semibold text-slate-800">{activeCollaborator.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep.noNextStepId && (
              <button
                onClick={() => {
                  const reason = prompt('Informe o motivo da devolução / retrabalho:');
                  if (reason) {
                    onReject(order.id, currentStep.noNextStepId!, reason);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                {currentStep.noLabel || 'Devolver / Rejeitar'}
              </button>
            )}

            {currentStep.yesNextStepId && (
              <button
                onClick={() => {
                  onAdvance(order.id, currentStep.yesNextStepId!);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>{currentStep.yesLabel || 'Avançar Etapa'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
