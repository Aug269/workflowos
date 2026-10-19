import React from 'react';
import {
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Stamp,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { WorkOrder, WorkflowStepDefinition } from '../types/workflow';
import { WORKFLOW_STEPS } from '../data/workflowConstants';

interface WorkOrderCardProps {
  order: WorkOrder;
  onAdvance: (order: WorkOrder) => void;
  onReject: (order: WorkOrder) => void;
  onOpenDetails: (order: WorkOrder) => void;
}

export function WorkOrderCard({
  order,
  onAdvance,
  onReject,
  onOpenDetails,
}: WorkOrderCardProps) {
  const currentStep = WORKFLOW_STEPS.find((s) => s.id === order.currentStepId) || WORKFLOW_STEPS[0];

  // Calculate elapsed time in minutes
  const startTime = new Date(order.stepStartedAt).getTime();
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / (1000 * 60)));
  const isOverdue = elapsedMinutes > currentStep.expectedDurationMinutes;
  const isNearLimit = elapsedMinutes > currentStep.expectedDurationMinutes * 0.75;

  const priorityColors = {
    Baixa: 'text-slate-600 bg-slate-100',
    Média: 'text-blue-700 bg-blue-50',
    Alta: 'text-amber-700 bg-amber-50',
    Urgente: 'text-rose-700 bg-rose-50',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div>
        {/* Top bar with OS Number, Origin and Priority */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
              {order.osNumber}
            </span>
            {order.origin === 'papel_ocr' && (
              <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded" title="Iniciada em papel físico via OCR">
                <FileText className="w-3 h-3" />
                <span>OCR</span>
              </span>
            )}
          </div>

          <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${priorityColors[order.priority]}`}>
            {order.priority}
          </span>
        </div>

        {/* Client & Equipment info */}
        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">
          {order.clientName}
        </h4>
        <p className="text-2xs text-slate-500 line-clamp-1 mb-3">
          {order.equipmentModel}
        </p>

        {/* Current Step Description Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3">
          <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
            Etapa Atual (BPMN)
          </div>
          <div className="text-xs font-semibold text-slate-800 line-clamp-1">
            {currentStep.title}
          </div>

          {/* Special Carimbo de Pronto check for Encerramento */}
          {order.macroPhase === 'encerramento' && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-2xs">
              <span className="text-slate-500">Carimbo "Pronto":</span>
              {order.hasReadyStamp ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Validado</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                  <Stamp className="w-3 h-3 text-amber-600" />
                  <span>Pendente</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Elapsed Time & SLA status */}
        <div className="flex items-center justify-between text-2xs mb-3 text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Na etapa: {elapsedMinutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <span>SLA: {currentStep.expectedDurationMinutes}m</span>
            {isOverdue ? (
              <span className="text-rose-600 font-bold" title="SLA Estourado (Gargalo)">●</span>
            ) : isNearLimit ? (
              <span className="text-amber-500 font-bold" title="Próximo do limite">●</span>
            ) : (
              <span className="text-emerald-500 font-bold" title="Dentro do prazo">●</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          onClick={() => onOpenDetails(order)}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-xs"
          title="Ver Detalhes e Folha Digitalizada"
        >
          <Eye className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {currentStep.noNextStepId && (
            <button
              onClick={() => onReject(order)}
              className="px-2 py-1 text-2xs font-semibold text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Devolver / Retrabalho (Gateway Não)"
            >
              Devolver
            </button>
          )}

          <button
            onClick={() => onAdvance(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
            title="Avançar para a próxima etapa"
          >
            <span>Avançar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
