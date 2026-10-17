import React from 'react';
import { Bell, AlertCircle, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { Client } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/dateUtils';

interface DailyAlertBannerProps {
  todayClients: Client[];
  overdueClients: Client[];
  onFilterToday: () => void;
  onFilterOverdue: () => void;
  onConfirmPayment: (client: Client) => void;
  onSendWhatsapp: (client: Client) => void;
}

export const DailyAlertBanner: React.FC<DailyAlertBannerProps> = ({
  todayClients,
  overdueClients,
  onFilterToday,
  onFilterOverdue,
  onConfirmPayment,
  onSendWhatsapp,
}) => {
  if (todayClients.length === 0 && overdueClients.length === 0) {
    return null;
  }

  const todayTotal = todayClients.reduce((acc, c) => acc + c.chargeAmount, 0);
  const overdueTotal = overdueClients.reduce((acc, c) => acc + c.chargeAmount, 0);

  return (
    <div className="space-y-2 mb-6">
      {/* Alerta de Vencimento HOJE */}
      {todayClients.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-lg shadow-amber-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-200">
                    ALERTA: {todayClients.length} {todayClients.length === 1 ? 'COBRANÇA AGENDADA PARA HOJE' : 'COBRANÇAS AGENDADAS PARA HOJE'}!
                  </h3>
                  <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Total: {formatCurrency(todayTotal)}
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  Estes clientes possuem mensalidade com vencimento na data de hoje. Envie o lembrete de pagamento ou confirme o recebimento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={onFilterToday}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Ver clientes de hoje</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick list of today's clients */}
          <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {todayClients.slice(0, 3).map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between bg-slate-950/60 border border-amber-500/20 rounded-lg px-3 py-2 text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-medium text-slate-100 block truncate">{client.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatCurrency(client.chargeAmount)} · {client.app}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onSendWhatsapp(client)}
                    className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
                    title="Cobrar via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onConfirmPayment(client)}
                    className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded transition-colors"
                    title="Confirmar pagamento e renovar para 30 dias"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            ))}
            {todayClients.length > 3 && (
              <button
                onClick={onFilterToday}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center justify-center p-2 rounded-lg border border-dashed border-amber-500/30 hover:bg-amber-500/10 transition-colors"
              >
                +{todayClients.length - 3} outros para cobrar hoje →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alerta de Vencidos (se houver e não estiver filtrado) */}
      {overdueClients.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-rose-200">
              <strong className="text-rose-300">{overdueClients.length} {overdueClients.length === 1 ? 'cliente' : 'clientes'}</strong> com cobrança em atraso ({formatCurrency(overdueTotal)} pendente).
            </span>
          </div>
          <button
            onClick={onFilterOverdue}
            className="text-xs font-medium text-rose-300 hover:text-rose-100 underline underline-offset-2 shrink-0"
          >
            Filtrar em atraso
          </button>
        </div>
      )}
    </div>
  );
};
