/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWorkflowStore } from './store/useWorkflowStore';
import { HeaderNav } from './components/HeaderNav';
import { OcrScanner } from './components/OcrScanner';
import { KanbanBoard } from './components/KanbanBoard';
import { BpmnFlowView } from './components/BpmnFlowView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WorkOrderModal } from './components/WorkOrderModal';
import { ActivityFeedDrawer } from './components/ActivityFeedDrawer';
import { WorkOrder } from './types/workflow';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const {
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
    markNotificationRead,
    clearAllNotifications,
    resetToInitialData,
  } = useWorkflowStore();

  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Quick select an order from notification or card
  const handleOpenOrderModal = (order: WorkOrder) => {
    setSelectedOrder(order);
  };

  const handleSelectByNumber = (osNumber: string) => {
    const found = workOrders.find((w) => w.osNumber === osNumber);
    if (found) {
      setSelectedOrder(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['DM_Sans',sans-serif]">
      {/* Top Bar Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCollaborator={activeCollaborator}
        setActiveCollaborator={setActiveCollaborator}
        notifications={notifications}
        onOpenFeedDrawer={() => setIsFeedDrawerOpen(true)}
        onResetData={resetToInitialData}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ocr_scanner' && (
          <OcrScanner
            activeCollaborator={activeCollaborator}
            onOrderCreated={addWorkOrder}
            onBatchOrdersCreated={addWorkOrdersBatch}
            onNavigateToKanban={() => setActiveTab('kanban')}
            onNavigateToBpmn={() => setActiveTab('bpmn_flow')}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            workOrders={workOrders}
            filterSector={filterSector}
            setFilterSector={setFilterSector}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAdvanceOrder={(order) => {
              const currentStep = order.currentStepId;
              const stepDef = order;
              // Open modal or quick advance
              setSelectedOrder(order);
            }}
            onRejectOrder={(order) => {
              setSelectedOrder(order);
            }}
            onOpenOrderModal={handleOpenOrderModal}
            onNavigateToScanner={() => setActiveTab('ocr_scanner')}
          />
        )}

        {activeTab === 'bpmn_flow' && (
          <BpmnFlowView
            workOrders={workOrders}
            onOpenOrderModal={handleOpenOrderModal}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard workOrders={workOrders} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-2xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            WorkFlow OS Pro · Gestão de Processo Industrial e Assistência Técnica
          </div>
          <div className="flex items-center gap-4">
            <span>Raias: Produção · Comercial · Resp. Cliente · Faturamento</span>
          </div>
        </div>
      </footer>

      {/* Work Order Detail / Transition Modal */}
      <WorkOrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAdvance={(orderId, nextStepId, note) => {
          advanceWorkOrder(orderId, nextStepId, note);
        }}
        onReject={(orderId, returnStepId, reason) => {
          rejectWorkOrder(orderId, returnStepId, reason);
        }}
        onApplyReadyStamp={(orderId) => {
          applyReadyStamp(orderId);
        }}
        activeCollaborator={activeCollaborator}
      />

      {/* Real-time Activity Feed Drawer */}
      <ActivityFeedDrawer
        isOpen={isFeedDrawerOpen}
        onClose={() => setIsFeedDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onClearAll={clearAllNotifications}
        onSelectOrder={handleSelectByNumber}
      />

      {/* Real-time Visual Toast Popup in bottom right */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="mt-0.5 shrink-0">
            {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {activeToast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {activeToast.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {activeToast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {activeToast.title}
            </h5>
            <p className="text-2xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {activeToast.message}
            </p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white shrink-0 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
