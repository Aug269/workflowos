import React, { useState } from 'react';
import {
  GitMerge,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { WorkOrder, WorkflowStepDefinition } from '../types/workflow';
import { WORKFLOW_STEPS } from '../data/workflowConstants';

interface BpmnFlowViewProps {
  workOrders: WorkOrder[];
  onOpenOrderModal: (order: WorkOrder) => void;
}

export function BpmnFlowView({ workOrders, onOpenOrderModal }: BpmnFlowViewProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Get count of orders waiting at each step
  const getOrdersAtStep = (stepId: string) => {
    return workOrders.filter((wo) => wo.currentStepId === stepId);
  };

  const selectedStepOrders = selectedStepId ? getOrdersAtStep(selectedStepId) : [];
  const selectedStepDef = WORKFLOW_STEPS.find((s) => s.id === selectedStepId);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <span>Mapeamento Fiel do Diagrama de Processo</span>
              <span>·</span>
              <span>Monitoramento em Tempo Real</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Fluxograma de Trabalho BPMN (Abertura e Encerramento)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Clique em qualquer nó do fluxograma para visualizar as Ordens de Serviço ativas naquela etapa específica,
              acompanhar os tempos de permanência e auditar decisões dos gateways.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Produção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Comercial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Resp. Cliente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Faturamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* BPMN Interactive Swimlane 1: ABERTURA DE O.S. */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              FASE 1
            </span>
            <h3 className="text-sm font-bold tracking-wide uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              Abertura de O.S.
            </h3>
          </div>
          <span className="text-2xs text-slate-400">
            {workOrders.filter((wo) => wo.macroPhase === 'abertura').length} O.S. em tramitação
          </span>
        </div>

        <div className="p-6 overflow-x-auto space-y-6">
          {/* Lane 1: Produção (Entrada) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-indigo-50/20">
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Raia: Produção (Entrada & Laudo)</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Start Node */}
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                <div className="w-4 h-4 rounded-full bg-slate-800" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Task: Preencher a O.S. */}
              <StepNode
                id="prod_preencher"
                title="Preencher a O.S. (Papel Físico)"
                sector="producao"
                count={getOrdersAtStep('prod_preencher').length}
                isSelected={selectedStepId === 'prod_preencher'}
                onClick={() => setSelectedStepId('prod_preencher')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Gateway: O.S. preenchida corretamente? */}
              <GatewayNode
                question="A O.S. foi preenchida corretamente?"
                loopLabel="Não: volta para preencher"
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Task: Enviar a O.S. ao comercial */}
              <StepNode
                id="prod_enviar_comercial"
                title="Enviar a O.S. ao comercial"
                sector="producao"
                count={getOrdersAtStep('prod_enviar_comercial').length}
                isSelected={selectedStepId === 'prod_enviar_comercial'}
                onClick={() => setSelectedStepId('prod_enviar_comercial')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Task: Elaborar o laudo (após retorno do comercial) */}
              <StepNode
                id="prod_elaborar_laudo"
                title="Elaborar o laudo do equipamento"
                sector="producao"
                count={getOrdersAtStep('prod_elaborar_laudo').length}
                isSelected={selectedStepId === 'prod_elaborar_laudo'}
                onClick={() => setSelectedStepId('prod_elaborar_laudo')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Task: Enviar o laudo ao comercial */}
              <StepNode
                id="prod_enviar_laudo_comercial"
                title="Enviar o laudo ao comercial"
                sector="producao"
                count={getOrdersAtStep('prod_enviar_laudo_comercial').length}
                isSelected={selectedStepId === 'prod_enviar_laudo_comercial'}
                onClick={() => setSelectedStepId('prod_enviar_laudo_comercial')}
              />
            </div>
          </div>

          {/* Lane 2: Comercial (Controle & Orçamento) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/20">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Raia: Comercial</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StepNode
                id="com_inserir_planilha"
                title="Inserir O.S. na planilha de controle"
                sector="comercial"
                count={getOrdersAtStep('com_inserir_planilha').length}
                isSelected={selectedStepId === 'com_inserir_planilha'}
                onClick={() => setSelectedStepId('com_inserir_planilha')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_imprimir_fichas"
                title="Imprimir O.S. e ficha de teste"
                sector="comercial"
                count={getOrdersAtStep('com_imprimir_fichas').length}
                isSelected={selectedStepId === 'com_imprimir_fichas'}
                onClick={() => setSelectedStepId('com_imprimir_fichas')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_enviar_producao"
                title="Enviar O.S. e ficha para a produção"
                sector="comercial"
                count={getOrdersAtStep('com_enviar_producao').length}
                isSelected={selectedStepId === 'com_enviar_producao'}
                onClick={() => setSelectedStepId('com_enviar_producao')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_elaborar_orcamento"
                title="Elaborar o orçamento"
                sector="comercial"
                count={getOrdersAtStep('com_elaborar_orcamento').length}
                isSelected={selectedStepId === 'com_elaborar_orcamento'}
                onClick={() => setSelectedStepId('com_elaborar_orcamento')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_enviar_orcamento_resp"
                title="Enviar orçamento ao resp. pelo cliente"
                sector="comercial"
                count={getOrdersAtStep('com_enviar_orcamento_resp').length}
                isSelected={selectedStepId === 'com_enviar_orcamento_resp'}
                onClick={() => setSelectedStepId('com_enviar_orcamento_resp')}
              />
            </div>
          </div>

          {/* Lane 3: Responsável pelo Cliente */}
          <div className="border border-slate-200 rounded-lg p-4 bg-purple-50/20">
            <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Raia: Responsável pelo Cliente</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StepNode
                id="resp_enviar_cliente"
                title="Enviar o orçamento ao cliente"
                sector="responsavel_cliente"
                count={getOrdersAtStep('resp_enviar_cliente').length}
                isSelected={selectedStepId === 'resp_enviar_cliente'}
                onClick={() => setSelectedStepId('resp_enviar_cliente')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* End Node */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-4 border-slate-800 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-slate-800" />
                </div>
                <span className="text-2xs font-semibold text-slate-600">Aprovação / Fim Abertura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BPMN Interactive Swimlane 2: ENCERRAMENTO DE O.S. */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              FASE 2
            </span>
            <h3 className="text-sm font-bold tracking-wide uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              Encerramento de O.S.
            </h3>
          </div>
          <span className="text-2xs text-slate-400">
            {workOrders.filter((wo) => wo.macroPhase === 'encerramento').length} O.S. em execução final
          </span>
        </div>

        <div className="p-6 overflow-x-auto space-y-6">
          {/* Lane 1: Produção (Finalização & Carimbo) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-indigo-50/20">
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Raia: Produção (Execução Técnica)</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-white flex items-center justify-center shrink-0">
                <div className="w-4 h-4 rounded-full bg-slate-800" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="prod_finalizar_servico"
                title="Finalizar o serviço"
                sector="producao"
                count={getOrdersAtStep('prod_finalizar_servico').length}
                isSelected={selectedStepId === 'prod_finalizar_servico'}
                onClick={() => setSelectedStepId('prod_finalizar_servico')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="prod_enviar_os_comercial"
                title="Enviar a O.S. ao comercial"
                sector="producao"
                count={getOrdersAtStep('prod_enviar_os_comercial').length}
                isSelected={selectedStepId === 'prod_enviar_os_comercial'}
                onClick={() => setSelectedStepId('prod_enviar_os_comercial')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              {/* Task: Inserir o carimbo de "Pronto" */}
              <StepNode
                id="prod_inserir_carimbo"
                title="Inserir o carimbo de 'Pronto'"
                sector="producao"
                count={getOrdersAtStep('prod_inserir_carimbo').length}
                isSelected={selectedStepId === 'prod_inserir_carimbo'}
                onClick={() => setSelectedStepId('prod_inserir_carimbo')}
                highlight="border-amber-400 bg-amber-50"
              />
            </div>
          </div>

          {/* Lane 2: Comercial (Conferência de Carimbo, PCP, Logística) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/20">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Raia: Comercial</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <GatewayNode
                question="A O.S. possui o carimbo de 'Pronto'?"
                loopLabel="Não -> Inserir carimbo na Produção"
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_apagar_pcp"
                title="Apagar as informações do PCP"
                sector="comercial"
                count={getOrdersAtStep('com_apagar_pcp').length}
                isSelected={selectedStepId === 'com_apagar_pcp'}
                onClick={() => setSelectedStepId('com_apagar_pcp')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_informar_cliente"
                title="Informar cliente: serviço finalizado"
                sector="comercial"
                count={getOrdersAtStep('com_informar_cliente').length}
                isSelected={selectedStepId === 'com_informar_cliente'}
                onClick={() => setSelectedStepId('com_informar_cliente')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_verificar_envio"
                title="Verificar meio de envio (retira / entrega)"
                sector="comercial"
                count={getOrdersAtStep('com_verificar_envio').length}
                isSelected={selectedStepId === 'com_verificar_envio'}
                onClick={() => setSelectedStepId('com_verificar_envio')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_enviar_faturamento"
                title="Enviar a O.S. ao faturamento"
                sector="comercial"
                count={getOrdersAtStep('com_enviar_faturamento').length}
                isSelected={selectedStepId === 'com_enviar_faturamento'}
                onClick={() => setSelectedStepId('com_enviar_faturamento')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_digitalizar_os"
                title="Digitalizar a O.S. e a ficha de teste"
                sector="comercial"
                count={getOrdersAtStep('com_digitalizar_os').length}
                isSelected={selectedStepId === 'com_digitalizar_os'}
                onClick={() => setSelectedStepId('com_digitalizar_os')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="com_arquivar_os"
                title="Arquivar a O.S. e a ficha de teste"
                sector="comercial"
                count={getOrdersAtStep('com_arquivar_os').length}
                isSelected={selectedStepId === 'com_arquivar_os'}
                onClick={() => setSelectedStepId('com_arquivar_os')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-900 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Lane 3: Faturamento & Fiscal */}
          <div className="border border-slate-200 rounded-lg p-4 bg-amber-50/20">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Raia: Faturamento</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StepNode
                id="fat_dar_seguimento"
                title="Dar seguimento ao faturamento (NF-e)"
                sector="faturamento"
                count={getOrdersAtStep('fat_dar_seguimento').length}
                isSelected={selectedStepId === 'fat_dar_seguimento'}
                onClick={() => setSelectedStepId('fat_dar_seguimento')}
              />
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <StepNode
                id="fat_devolver_comercial"
                title="Devolver a O.S. ao comercial"
                sector="faturamento"
                count={getOrdersAtStep('fat_devolver_comercial').length}
                isSelected={selectedStepId === 'fat_devolver_comercial'}
                onClick={() => setSelectedStepId('fat_devolver_comercial')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Step Orders Drawer/Inspector */}
      {selectedStepId && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-wider text-indigo-600">
                Nó Selecionado no Diagrama
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {selectedStepDef?.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedStepDef?.description}</p>
            </div>
            <button
              onClick={() => setSelectedStepId(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Fechar Inspector ✕
            </button>
          </div>

          {selectedStepOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              Nenhuma Ordem de Serviço aguardando nesta etapa no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedStepOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-900">{wo.osNumber}</div>
                    <div className="text-xs text-slate-700 font-medium">{wo.clientName}</div>
                    <div className="text-2xs text-slate-500">{wo.equipmentModel}</div>
                  </div>
                  <button
                    onClick={() => onOpenOrderModal(wo)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                    title="Abrir Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepNode({
  id,
  title,
  sector,
  count,
  isSelected,
  onClick,
  highlight,
}: {
  id: string;
  title: string;
  sector: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  highlight?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-all shrink-0 w-44 cursor-pointer relative shadow-2xs ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white'
          : highlight
          ? highlight
          : 'bg-white hover:bg-slate-50 border-slate-300'
      }`}
    >
      {count > 0 && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-2xs font-bold shadow-xs">
          {count} O.S.
        </span>
      )}
      <div className="text-2xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
        {sector}
      </div>
      <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
        {title}
      </div>
    </button>
  );
}

function GatewayNode({
  question,
  loopLabel,
}: {
  question: string;
  loopLabel: string;
}) {
  return (
    <div
      className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg text-left shrink-0 w-44 shadow-2xs"
      title={loopLabel}
    >
      <div className="text-2xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">
        Gateway de Decisão ◇
      </div>
      <div className="text-xs font-semibold text-amber-950 line-clamp-2 leading-tight">
        {question}
      </div>
      <div className="text-2xs text-amber-700 mt-1 italic">
        {loopLabel}
      </div>
    </div>
  );
}
