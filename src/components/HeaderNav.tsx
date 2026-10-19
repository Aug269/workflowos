import React, { useState } from 'react';
import {
  FileScan,
  Kanban,
  GitMerge,
  BarChart3,
  Bell,
  RotateCcw,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { Collaborator, ActivityNotification } from '../types/workflow';
import { INITIAL_COLLABORATORS } from '../data/workflowConstants';

interface HeaderNavProps {
  activeTab: 'ocr_scanner' | 'kanban' | 'bpmn_flow' | 'analytics';
  setActiveTab: (tab: 'ocr_scanner' | 'kanban' | 'bpmn_flow' | 'analytics') => void;
  activeCollaborator: Collaborator;
  setActiveCollaborator: (c: Collaborator) => void;
  notifications: ActivityNotification[];
  onOpenFeedDrawer: () => void;
  onResetData: () => void;
}

export function HeaderNav({
  activeTab,
  setActiveTab,
  activeCollaborator,
  setActiveCollaborator,
  notifications,
  onOpenFeedDrawer,
  onResetData,
}: HeaderNavProps) {
  const [isColabMenuOpen, setIsColabMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              OS
            </span>
            <button
              onClick={() => setActiveTab('ocr_scanner')}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-indigo-600 transition-colors font-['Plus_Jakarta_Sans',sans-serif] cursor-pointer"
            >
              WorkFlow OS Pro
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ocr_scanner')}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'ocr_scanner'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileScan className="w-4 h-4" />
              <span>Scanner OCR (Papel)</span>
              <span className="text-2xs bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono">Módulo 1</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'kanban'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Quadro Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('bpmn_flow')}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'bpmn_flow'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              <span>Fluxograma BPMN</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios & SLAs</span>
            </button>
          </nav>

          {/* Zone 3: Collaborator Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Reset Data Button (Helper) */}
            <button
              onClick={onResetData}
              title="Restaurar dados de demonstração"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenFeedDrawer}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Feed de atividades em tempo real"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-2xs font-bold rounded-full flex items-center justify-center font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Collaborator Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsColabMenuOpen(!isColabMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-2xs font-bold flex items-center justify-center">
                  {activeCollaborator.avatar}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-none">
                    {activeCollaborator.name}
                  </div>
                  <div className="text-2xs text-slate-500 capitalize leading-tight mt-0.5">
                    {activeCollaborator.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isColabMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Alternar Colaborador Ativo
                  </div>
                  {INITIAL_COLLABORATORS.map((colab) => (
                    <button
                      key={colab.id}
                      onClick={() => {
                        setActiveCollaborator(colab);
                        setIsColabMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                        activeCollaborator.id === colab.id ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-2xs font-bold flex items-center justify-center">
                          {colab.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{colab.name}</div>
                          <div className="text-2xs text-slate-500 capitalize">{colab.role}</div>
                        </div>
                      </div>
                      {activeCollaborator.id === colab.id && (
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
