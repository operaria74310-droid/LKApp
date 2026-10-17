import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Copy,
  Edit,
  Trash2,
  Tv,
  Server,
  Shield,
  Key,
  Calendar,
  AlertTriangle,
  UserCheck,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { Client, FilterStatus, AppSettings } from '../types';
import {
  formatCurrency,
  formatDateDisplay,
  getDueStatus,
  getDueStatusLabel,
  cleanPhoneForWhatsapp,
  getCurrentMonthYear,
} from '../utils/dateUtils';

interface ClientListProps {
  clients: Client[];
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  onConfirmPayment: (client: Client) => void;
  onReschedule: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onSendWhatsapp: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  currentFilter,
  onFilterChange,
  onConfirmPayment,
  onReschedule,
  onEditClient,
  onDeleteClient,
  onSendWhatsapp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentMonth = getCurrentMonthYear();

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Text search
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        (client.phone && client.phone.toLowerCase().includes(term)) ||
        (client.server && client.server.toLowerCase().includes(term)) ||
        (client.app && client.app.toLowerCase().includes(term)) ||
        (client.mac && client.mac.toLowerCase().includes(term)) ||
        (client.key && client.key.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // 2. Status filter
      const statusType = getDueStatus(client.dueDate);
      if (currentFilter === 'today') return statusType === 'today';
      if (currentFilter === 'overdue') return statusType === 'overdue';
      if (currentFilter === 'next7days') return statusType === 'next7days';
      if (currentFilter === 'paid_this_month') {
        return client.lastPaymentDate && client.lastPaymentDate.startsWith(currentMonth);
      }
      return true; // 'all'
    });
  }, [clients, searchTerm, currentFilter, currentMonth]);

  // Counts for tabs
  const counts = useMemo(() => {
    let today = 0;
    let overdue = 0;
    let next7 = 0;
    let paidMonth = 0;

    clients.forEach((c) => {
      const s = getDueStatus(c.dueDate);
      if (s === 'today') today++;
      if (s === 'overdue') overdue++;
      if (s === 'next7days') next7++;
      if (c.lastPaymentDate && c.lastPaymentDate.startsWith(currentMonth)) paidMonth++;
    });

    return { all: clients.length, today, overdue, next7, paidMonth };
  }, [clients, currentMonth]);

  const handleCopyCredentials = (client: Client) => {
    const textToCopy = `*Dados de Acesso - LK-Clientes*
Cliente: ${client.name}
Servidor: ${client.server}
Aplicativo: ${client.app}
MAC: ${client.mac || 'N/A'}
Key: ${client.key || 'N/A'}
Telas: ${client.connections}
Vencimento: ${formatDateDisplay(client.dueDate)}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, MAC, Key, app, servidor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span>Todos</span>
            <span className="font-mono text-[11px] text-slate-400">({counts.all})</span>
          </button>

          <button
            onClick={() => onFilterChange('today')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentFilter === 'today'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Hoje</span>
            <span className="font-mono text-[11px] text-amber-400">({counts.today})</span>
          </button>

          <button
            onClick={() => onFilterChange('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentFilter === 'overdue'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Atrasados</span>
            <span className="font-mono text-[11px] text-rose-400">({counts.overdue})</span>
          </button>

          <button
            onClick={() => onFilterChange('next7days')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentFilter === 'next7days'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            <span>Próx. 7 Dias</span>
            <span className="font-mono text-[11px] text-blue-400">({counts.next7})</span>
          </button>

          <button
            onClick={() => onFilterChange('paid_this_month')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentFilter === 'paid_this_month'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pagos no Mês</span>
            <span className="font-mono text-[11px] text-emerald-400">({counts.paidMonth})</span>
          </button>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">Nenhum cliente encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `Nenhum resultado corresponde a "${searchTerm}". Tente outro termo.`
              : 'Nenhum cliente cadastrado neste filtro no momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredClients.map((client) => {
            const statusInfo = getDueStatusLabel(client.dueDate);
            const isToday = statusInfo.type === 'today';
            const isOverdue = statusInfo.type === 'overdue';

            return (
              <div
                key={client.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  isToday
                    ? 'border-amber-500/60 bg-amber-500/[0.03] shadow-md shadow-amber-950/20'
                    : isOverdue
                    ? 'border-rose-500/50 bg-rose-500/[0.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Client identification & Status */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {client.name}
                      </h3>

                      {/* Status indicator unboxed text */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>

                      {client.phone && (
                        <span className="text-xs font-mono text-slate-400">
                          {client.phone}
                        </span>
                      )}
                    </div>

                    {/* Technical details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Servidor</span>
                        <span className="font-medium text-slate-200 truncate block">
                          {client.server || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Aplicativo</span>
                        <span className="font-medium text-slate-200 truncate block">
                          {client.app || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">MAC</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate block">
                          {client.mac || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Key / Senha</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate block">
                          {client.key || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Additional Notes or accesses info */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>
                        <strong className="text-slate-300 font-semibold">{client.connections}</strong> {client.connections === 1 ? 'tela / acesso' : 'telas / acessos'}
                      </span>
                      {client.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate italic max-w-xs">{client.notes}</span>
                        </>
                      )}
                      {client.lastPaymentDate && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono">
                            Último pago: {formatDateDisplay(client.lastPaymentDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Due Date & Amount */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800 shrink-0 min-w-[130px]">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Valor Cobrança</span>
                      <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                        {formatCurrency(client.chargeAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Vencimento</span>
                      <span className={`text-xs font-mono font-semibold tabular-nums ${isToday ? 'text-amber-400' : isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {formatDateDisplay(client.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    {/* Confirm Payment button (Crucial action) */}
                    <button
                      onClick={() => onConfirmPayment(client)}
                      className="px-3 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Confirmar pagamento, alterar valor e renovar para 30 dias"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar (+30d)</span>
                    </button>

                    {/* Reschedule button */}
                    <button
                      onClick={() => onReschedule(client)}
                      className="px-2.5 py-2 text-xs font-medium text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                      title="Reagendar data de cobrança"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reagendar</span>
                    </button>

                    {/* WhatsApp charge button */}
                    {client.phone && (
                      <button
                        onClick={() => onSendWhatsapp(client)}
                        className="px-2.5 py-2 text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                        title="Enviar mensagem de cobrança no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cobrar</span>
                      </button>
                    )}

                    {/* Copy details */}
                    <button
                      onClick={() => handleCopyCredentials(client)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Copiar dados de acesso do cliente"
                    >
                      {copiedId === client.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar cadastro"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteClient(client)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
