import React, { useState } from 'react';
import {
  Wrench,
  Store,
  Users,
  Receipt,
  CheckCircle,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { WorkOrder, SectorType } from '../types/workflow';
import { WorkOrderCard } from './WorkOrderCard';

interface KanbanBoardProps {
  workOrders: WorkOrder[];
  filterSector: 'all' | SectorType;
  setFilterSector: (s: 'all' | SectorType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAdvanceOrder: (order: WorkOrder) => void;
  onRejectOrder: (order: WorkOrder) => void;
  onOpenOrderModal: (order: WorkOrder) => void;
  onNavigateToScanner: () => void;
}

export function KanbanBoard({
  workOrders,
  filterSector,
  setFilterSector,
  searchQuery,
  setSearchQuery,
  onAdvanceOrder,
  onRejectOrder,
  onOpenOrderModal,
  onNavigateToScanner,
}: KanbanBoardProps) {
  // Filter by search query
  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.osNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.equipmentModel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector =
      filterSector === 'all' || wo.currentSector === filterSector;

    return matchesSearch && matchesSector;
  });

  // Group columns by BPMN Sector
  const columns = [
    {
      id: 'producao',
      sector: 'producao' as SectorType,
      title: 'Produção (Bancada Técnica)',
      icon: Wrench,
      accentColor: 'border-indigo-400 text-indigo-700 bg-indigo-50/50',
      orders: filteredOrders.filter((wo) => wo.currentSector === 'producao' && wo.macroPhase !== 'concluida'),
    },
    {
      id: 'comercial',
      sector: 'comercial' as SectorType,
      title: 'Comercial & PCP',
      icon: Store,
      accentColor: 'border-emerald-400 text-emerald-700 bg-emerald-50/50',
      orders: filteredOrders.filter((wo) => wo.currentSector === 'comercial' && wo.macroPhase !== 'concluida'),
    },
    {
      id: 'responsavel_cliente',
      sector: 'responsavel_cliente' as SectorType,
      title: 'Responsável pelo Cliente',
      icon: Users,
      accentColor: 'border-purple-400 text-purple-700 bg-purple-50/50',
      orders: filteredOrders.filter((wo) => wo.currentSector === 'responsavel_cliente' && wo.macroPhase !== 'concluida'),
    },
    {
      id: 'faturamento',
      sector: 'faturamento' as SectorType,
      title: 'Faturamento & Fiscal',
      icon: Receipt,
      accentColor: 'border-amber-400 text-amber-700 bg-amber-50/50',
      orders: filteredOrders.filter((wo) => wo.currentSector === 'faturamento' && wo.macroPhase !== 'concluida'),
    },
    {
      id: 'concluida',
      sector: 'concluida' as any,
      title: 'Concluídas & Arquivadas',
      icon: CheckCircle,
      accentColor: 'border-slate-300 text-slate-700 bg-slate-100/50',
      orders: filteredOrders.filter((wo) => wo.macroPhase === 'concluida'),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Search and Sector Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Setor:</span>
          </span>

          <button
            onClick={() => setFilterSector('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterSector === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({workOrders.length})
          </button>

          <button
            onClick={() => setFilterSector('producao')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterSector === 'producao'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Produção
          </button>

          <button
            onClick={() => setFilterSector('comercial')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterSector === 'comercial'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Comercial
          </button>

          <button
            onClick={() => setFilterSector('responsavel_cliente')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterSector === 'responsavel_cliente'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cliente
          </button>

          <button
            onClick={() => setFilterSector('faturamento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterSector === 'faturamento'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Faturamento
          </button>
        </div>

        {/* Search input & New OS shortcut */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por O.S., cliente ou máquina..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={onNavigateToScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Digitalizar O.S. (OCR)</span>
          </button>
        </div>
      </div>

      {/* Kanban Multi-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md border ${col.accentColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {col.title}
                  </h3>
                </div>
                <span className="text-2xs font-mono font-bold bg-white text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                  {col.orders.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                {col.orders.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-3 text-center">
                    <p className="text-2xs text-slate-400">Nenhuma O.S. nesta raia.</p>
                  </div>
                ) : (
                  col.orders.map((order) => (
                    <WorkOrderCard
                      key={order.id}
                      order={order}
                      onAdvance={onAdvanceOrder}
                      onReject={onRejectOrder}
                      onOpenDetails={onOpenOrderModal}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
