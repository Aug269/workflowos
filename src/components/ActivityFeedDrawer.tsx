import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { ActivityNotification } from '../types/workflow';

interface ActivityFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ActivityNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onSelectOrder: (osNumber: string) => void;
}

export function ActivityFeedDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
  onSelectOrder,
}: ActivityFeedDrawerProps) {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    alert: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    info: <Info className="w-4 h-4 text-indigo-600" />,
  };

  const borderMap = {
    success: 'border-l-4 border-l-emerald-500 bg-emerald-50/30',
    warning: 'border-l-4 border-l-amber-500 bg-amber-50/30',
    alert: 'border-l-4 border-l-rose-500 bg-rose-50/30',
    info: 'border-l-4 border-l-indigo-500 bg-indigo-50/30',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Feed de Atividades em Tempo Real
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="Limpar histórico de notificações"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs">Nenhum evento registrado ainda.</p>
              <p className="text-2xs text-slate-400 mt-1">
                Avanços de etapa, digitalizações OCR e alertas de SLA aparecerão aqui em tempo real.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`p-3 rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer ${
                  borderMap[notif.type]
                } ${!notif.read ? 'bg-white shadow-2xs' : 'opacity-85'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {iconMap[notif.type]}
                    <span>{notif.title}</span>
                  </div>
                  <span className="text-2xs font-mono text-slate-400">
                    {new Date(notif.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                  {notif.message}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-2xs text-slate-400">
                  <span className="uppercase font-semibold tracking-wider font-mono">
                    Setor: {notif.sector}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(notif.osNumber);
                      onClose();
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver O.S. {notif.osNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
