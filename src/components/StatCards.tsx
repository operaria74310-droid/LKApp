import React from 'react';
import { DollarSign, CalendarCheck, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { formatCurrency, formatMonthYear, getCurrentMonthYear } from '../utils/dateUtils';

interface StatCardsProps {
  dailyTotal: number;
  dailyCount: number;
  monthlyTotal: number;
  monthlyCount: number;
  monthlyProjected: number;
  todayDueCount: number;
  overdueCount: number;
  totalActiveClients: number;
  onFilterChange: (filter: 'all' | 'today' | 'overdue' | 'next7days' | 'paid_this_month') => void;
  currentFilter: string;
}

export const StatCards: React.FC<StatCardsProps> = ({
  dailyTotal,
  dailyCount,
  monthlyTotal,
  monthlyCount,
  monthlyProjected,
  todayDueCount,
  overdueCount,
  totalActiveClients,
  onFilterChange,
  currentFilter,
}) => {
  const currentMonth = getCurrentMonthYear();
  const currentMonthLabel = formatMonthYear(currentMonth);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Saldo Diário */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Saldo Diário (Hoje)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {dailyCount} {dailyCount === 1 ? 'baixa' : 'baixas'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            {formatCurrency(dailyTotal)}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Recebido e confirmado hoje
        </p>
      </div>

      {/* 2. Saldo do Mês */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Saldo do Mês
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {currentMonthLabel.split('/')[0].trim()}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatCurrency(monthlyTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
          <span>{monthlyCount} {monthlyCount === 1 ? 'pagamento' : 'pagamentos'}</span>
          {monthlyProjected > 0 && (
            <span className="text-slate-400 font-mono">
              Meta: {formatCurrency(monthlyProjected)}
            </span>
          )}
        </div>
      </div>

      {/* 3. Cobranças de Hoje (Alerta) */}
      <div
        onClick={() => onFilterChange('today')}
        className={`bg-slate-900/90 border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:border-amber-500/50 ${
          currentFilter === 'today'
            ? 'border-amber-500/80 bg-amber-500/5 ring-1 ring-amber-500/30'
            : todayDueCount > 0
            ? 'border-amber-500/30'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium flex items-center gap-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Cobrança Hoje
          </span>
          {todayDueCount > 0 && (
            <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              Atenção
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
            {todayDueCount}
          </span>
          <span className="text-xs text-slate-400">
            {todayDueCount === 1 ? 'cliente vence hoje' : 'clientes vencem hoje'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>Clique para filtrar</span>
          <span className="text-amber-400 font-medium">Ver lista →</span>
        </p>
      </div>

      {/* 4. Vencidos / Em atraso */}
      <div
        onClick={() => onFilterChange('overdue')}
        className={`bg-slate-900/90 border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:border-rose-500/50 ${
          currentFilter === 'overdue'
            ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30'
            : overdueCount > 0
            ? 'border-rose-500/30'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium flex items-center gap-1.5 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Em Atraso
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {totalActiveClients} ativos
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-rose-400 tabular-nums">
            {overdueCount}
          </span>
          <span className="text-xs text-slate-400">
            {overdueCount === 1 ? 'cliente pendente' : 'clientes pendentes'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>Cobrança vencida</span>
          <span className="text-rose-400 font-medium">Ver lista →</span>
        </p>
      </div>
    </div>
  );
};
