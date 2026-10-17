import React, { useState, useMemo } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  Clock,
  RotateCcw,
  ShieldAlert,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { PaymentRecord, MonthlyClosure } from '../types';
import {
  formatCurrency,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatMonthYear,
  getCurrentMonthYear,
  getTodayDateString,
} from '../utils/dateUtils';

interface FinancialConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRecord[];
  closures: MonthlyClosure[];
  onOpenSecurityWipe: () => void;
  onResetMonth: (monthYear: string, totalCollected: number, count: number) => void;
}

export const FinancialConferenceModal: React.FC<FinancialConferenceModalProps> = ({
  isOpen,
  onClose,
  payments,
  closures,
  onOpenSecurityWipe,
  onResetMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'all' | 'closures'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthYear());
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

  const todayStr = getTodayDateString();

  // Filter payments for today
  const dailyPayments = useMemo(() => {
    return payments.filter((p) => p.dateOnly === todayStr || p.date.startsWith(todayStr));
  }, [payments, todayStr]);

  const dailyTotal = useMemo(() => {
    return dailyPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  }, [dailyPayments]);

  // Breakdown of daily payments by payment method
  const dailyByMethod = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      money: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      transfer: { count: 0, total: 0 },
    };
    dailyPayments.forEach((p) => {
      const method = p.paymentMethod || 'pix';
      if (!summary[method]) {
        summary[method] = { count: 0, total: 0 };
      }
      summary[method].count += 1;
      summary[method].total += p.amountPaid;
    });
    return summary;
  }, [dailyPayments]);

  // Filter payments for the selected month
  const monthlyPayments = useMemo(() => {
    return payments.filter((p) => p.monthYear === selectedMonth || p.date.startsWith(selectedMonth));
  }, [payments, selectedMonth]);

  const monthlyTotal = useMemo(() => {
    return monthlyPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  }, [monthlyPayments]);

  // Handle month closure & reset
  const handleTriggerResetMonth = () => {
    if (window.confirm(`Deseja encerrar e reiniciar a conferência do mês ${formatMonthYear(selectedMonth)}? Um registro de fechamento será gerado.`)) {
      onResetMonth(selectedMonth, monthlyTotal, monthlyPayments.length);
      setResetSuccessMessage(`Mês ${formatMonthYear(selectedMonth)} fechado com sucesso!`);
      setTimeout(() => setResetSuccessMessage(''), 3000);
    }
  };

  // Export payments to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Cliente', 'Servidor', 'App', 'Forma', 'Valor Cobrado', 'Valor Pago', 'Novo Vencimento', 'Notas'];
    const rows = payments.map((p) => [
      p.id,
      formatDateTimeDisplay(p.date),
      `"${p.clientName}"`,
      `"${p.server}"`,
      `"${p.app}"`,
      p.paymentMethod.toUpperCase(),
      p.amountCharged.toFixed(2),
      p.amountPaid.toFixed(2),
      formatDateDisplay(p.newDueDate),
      `"${p.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LK-Clientes-Extrato-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Conferência de Caixa & Saldos
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhe o saldo diário, saldo do mês e conciliação de pagamentos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Saldo Diário (Hoje)</span>
              <span className="font-mono text-[11px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                {dailyPayments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'monthly'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Saldo do Mês</span>
              <span className="font-mono text-[11px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                {monthlyPayments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Todos os Lançamentos</span>
              <span className="font-mono text-[11px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                {payments.length}
              </span>
            </button>

            {closures.length > 0 && (
              <button
                onClick={() => setActiveTab('closures')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'closures'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Fechamentos Anteriores ({closures.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Baixar planilha CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: CONFERÊNCIA DIÁRIA */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {/* Daily KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">Total Recebido Hoje</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(dailyTotal)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Data: {formatDateDisplay(todayStr)}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">Baixas Realizadas Hoje</span>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums">
                    {dailyPayments.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {dailyPayments.length === 1 ? 'cliente atendido' : 'clientes atendidos'}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">Distribuição por Forma</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>PIX:</span>
                      <span className="font-mono text-emerald-400 font-medium">
                        {formatCurrency(dailyByMethod.pix?.total || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Dinheiro:</span>
                      <span className="font-mono text-white font-medium">
                        {formatCurrency(dailyByMethod.money?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Transactions Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Lançamentos Confirmados Hoje
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Total: {formatCurrency(dailyTotal)}
                  </span>
                </div>

                {dailyPayments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nenhum pagamento foi confirmado ainda na data de hoje.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-medium">
                        <tr>
                          <th className="py-2.5 px-3">Horário</th>
                          <th className="py-2.5 px-3">Cliente</th>
                          <th className="py-2.5 px-3">Servidor / App</th>
                          <th className="py-2.5 px-3">Forma</th>
                          <th className="py-2.5 px-3 text-right">Valor Pago</th>
                          <th className="py-2.5 px-3 text-right">Próx. Vencimento (+30d)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {dailyPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                              {p.date.includes('T') ? p.date.split('T')[1].slice(0, 5) : '--:--'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                              {p.clientName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              <span>{p.server}</span>
                              <span className="text-slate-400 text-[11px] block">{p.app}</span>
                            </td>
                            <td className="py-2.5 px-3 uppercase text-[11px] font-semibold text-emerald-400">
                              {p.paymentMethod}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                              {formatCurrency(p.amountPaid)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                              {formatDateDisplay(p.newDueDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONFERÊNCIA MENSAL */}
          {activeTab === 'monthly' && (
            <div className="space-y-4">
              {/* Month selector & Reset button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400 font-medium">Mês de Conferência:</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-semibold text-blue-300">
                    {formatMonthYear(selectedMonth)}
                  </span>
                </div>

                {/* Prompt requirement: "reiniciar os valores quando trocar de mês" */}
                <button
                  onClick={handleTriggerResetMonth}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  title="Arquiva o mês e reinicia o ciclo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Fechar / Reiniciar Ciclo do Mês</span>
                </button>
              </div>

              {/* Monthly KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">Total Arrecadado no Mês</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(monthlyTotal)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {monthlyPayments.length} {monthlyPayments.length === 1 ? 'pagamento confirmado' : 'pagamentos confirmados'}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">Ticket Médio por Cliente</span>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums">
                    {formatCurrency(monthlyPayments.length > 0 ? monthlyTotal / monthlyPayments.length : 0)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Média de cobrança por assinatura
                  </span>
                </div>
              </div>

              {/* Monthly table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Lançamentos do Mês ({formatMonthYear(selectedMonth)})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Total: {formatCurrency(monthlyTotal)}
                  </span>
                </div>

                {monthlyPayments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nenhum lançamento registrado neste mês.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-medium sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Data</th>
                          <th className="py-2.5 px-3">Cliente</th>
                          <th className="py-2.5 px-3">Servidor</th>
                          <th className="py-2.5 px-3">Forma</th>
                          <th className="py-2.5 px-3 text-right">Valor Pago</th>
                          <th className="py-2.5 px-3 text-right">Próx. Vencimento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {monthlyPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">
                              {formatDateDisplay(p.dateOnly)}
                            </td>
                            <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">
                              {p.clientName}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {p.server} · {p.app}
                            </td>
                            <td className="py-2 px-3 uppercase text-[11px] font-semibold text-emerald-400">
                              {p.paymentMethod}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                              {formatCurrency(p.amountPaid)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                              {formatDateDisplay(p.newDueDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TODOS OS LANÇAMENTOS */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Histórico Geral de Pagamentos ({payments.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Total Acumulado: {formatCurrency(payments.reduce((a, b) => a + b.amountPaid, 0))}
                  </span>
                </div>

                {payments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nenhum pagamento registrado no sistema.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-medium sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Data / Hora</th>
                          <th className="py-2 px-3">Cliente</th>
                          <th className="py-2 px-3">Servidor</th>
                          <th className="py-2 px-3">Forma</th>
                          <th className="py-2 px-3 text-right">Valor Pago</th>
                          <th className="py-2 px-3 text-right">Novo Vencimento (+30d)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">
                              {formatDateTimeDisplay(p.date)}
                            </td>
                            <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">
                              {p.clientName}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {p.server} · {p.app}
                            </td>
                            <td className="py-2 px-3 uppercase text-[11px] font-semibold text-emerald-400">
                              {p.paymentMethod}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                              {formatCurrency(p.amountPaid)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                              {formatDateDisplay(p.newDueDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FECHAMENTOS ANTERIORES */}
          {activeTab === 'closures' && (
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Histórico de Fechamentos Mensais
                  </h3>
                </div>

                <div className="divide-y divide-slate-800">
                  {closures.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm">{formatMonthYear(c.monthYear)}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Encerrado em: {formatDateTimeDisplay(c.closedAt)} · {c.paymentsCount} pagamentos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Arrecadado</span>
                        <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                          {formatCurrency(c.totalCollected)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DANGER ZONE: PROMPT REQUIREMENT:
              "Acrescente uma opção de remover totalmente os valores das contas, mas que só aceite a remoção total dos valores após a confirmação da senha 74310;" */}
          <div className="border border-rose-500/30 rounded-xl p-4 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Remoção Total dos Valores das Contas
                </h4>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Zera todos os lançamentos financeiros e saldos do sistema. Exige obrigatoriamente a senha de segurança <strong>74310</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSecurityWipe}
              className="px-4 py-2 text-xs font-bold text-rose-200 hover:text-white bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Remover Valores (Senha 74310)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Sistema LK-Clientes · Gestão de Cobranças</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
