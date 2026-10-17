import React from 'react';
import { Plus, Database, DollarSign, Settings, Bell, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenNewClient: () => void;
  onOpenFinancials: () => void;
  onOpenBackup: () => void;
  onOpenSettings: () => void;
  todayCount: number;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewClient,
  onOpenFinancials,
  onOpenBackup,
  onOpenSettings,
  todayCount,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
            LK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                LK-Clientes
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-400 border border-slate-800 bg-slate-900/80 px-2 py-0.5 rounded">
                Gestão Mensalista
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Agendamentos, cobranças e conferência financeira
            </p>
          </div>
        </div>

        {/* Center / Alerts Quick Glance */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          {todayCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
              <Bell className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{todayCount} {todayCount === 1 ? 'cobrança hoje' : 'cobranças hoje'}</span>
            </div>
          )}
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
              <span>{overdueCount} {overdueCount === 1 ? 'em atraso' : 'em atraso'}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenFinancials}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Conferência de Caixa Diário e Mensal"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Conferência & Saldos</span>
            <span className="sm:hidden">Saldos</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Backup, Exportação e Importação de Dados"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
            title="Configurações de PIX e Mensagem"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-950 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>
    </header>
  );
};
