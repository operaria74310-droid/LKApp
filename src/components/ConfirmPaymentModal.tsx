import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, ArrowRight, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { Client, PaymentRecord, AppSettings } from '../types';
import { formatCurrency, getTodayDateString, addDaysToDate, formatDateDisplay, cleanPhoneForWhatsapp } from '../utils/dateUtils';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirm: (
    client: Client,
    amountPaid: number,
    paymentMethod: PaymentRecord['paymentMethod'],
    newDueDate: string,
    notes: string,
    openWhatsapp: boolean
  ) => void;
  settings: AppSettings;
}

export const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  onConfirm,
  settings,
}) => {
  if (!isOpen || !client) return null;

  const todayStr = getTodayDateString();
  // Regra do prompt: "quando confirmar pagamento, adicione novamente o mesmo pagamento para 30 dias após confirmação"
  const defaultNextDueDate = addDaysToDate(todayStr, 30);

  const [amountPaid, setAmountPaid] = useState<number>(client.chargeAmount);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('pix');
  const [newDueDate, setNewDueDate] = useState<string>(defaultNextDueDate);
  const [notes, setNotes] = useState<string>('');
  const [sendWhatsappConfirmation, setSendWhatsappConfirmation] = useState<boolean>(true);

  useEffect(() => {
    if (client) {
      setAmountPaid(client.chargeAmount);
      setNewDueDate(addDaysToDate(getTodayDateString(), 30));
      setNotes('');
    }
  }, [client, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      client,
      Number(amountPaid) || 0,
      paymentMethod,
      newDueDate,
      notes,
      sendWhatsappConfirmation && !!client.phone
    );
    onClose();
  };

  const isValueModified = Number(amountPaid) !== client.chargeAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Confirmar Pagamento</h2>
              <p className="text-xs text-slate-400">
                Baixa de cobrança e renovação automática de 30 dias
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Details Card */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Cliente</span>
                <p className="text-sm font-semibold text-white">{client.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Vencimento Atual</span>
                <p className="text-sm font-mono font-medium text-amber-400">
                  {formatDateDisplay(client.dueDate)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">Servidor</span>
                <span className="truncate block font-medium">{client.server || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">App</span>
                <span className="truncate block font-medium">{client.app || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">MAC</span>
                <span className="font-mono text-[11px] truncate block">{client.mac || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Acessos</span>
                <span className="font-medium">{client.connections} tela(s)</span>
              </div>
            </div>
          </div>

          {/* Alteração de Valor na Confirmação (Prompt requirement) */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Valor Recebido na Confirmação (R$)
              </label>
              <span className="text-[11px] text-slate-400">
                Original: <span className="font-mono">{formatCurrency(client.chargeAmount)}</span>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-lg text-lg font-bold font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {isValueModified && (
              <p className="text-[11px] text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Valor alterado para esta cobrança ({formatCurrency(amountPaid)} vs original {formatCurrency(client.chargeAmount)})
              </p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'pix', label: 'PIX' },
                { id: 'money', label: 'Dinheiro' },
                { id: 'card', label: 'Cartão' },
                { id: 'transfer', label: 'Transf.' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id as any)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    paymentMethod === item.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Regra de Renovação Automática (+30 dias após confirmação) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Nova Data de Cobrança (+30 dias)
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Renovação Automática
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="text-right text-xs text-slate-400 shrink-0">
                <span>Vencerá em: </span>
                <span className="font-semibold text-white font-mono block">
                  {formatDateDisplay(newDueDate)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Conforme a regra do LK-Clientes, a próxima mensalidade é reagendada automaticamente para 30 dias após a confirmação.
            </p>
          </div>

          {/* Observações / Notas do Recebimento */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observação do Pagamento (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pago via PIX Nubank, comprovante recebido no WhatsApp..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Enviar WhatsApp de confirmação */}
          {client.phone && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendWhatsappConfirmation}
                onChange={(e) => setSendWhatsappConfirmation(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Abrir WhatsApp para enviar recibo de renovação ao cliente
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-lg shadow-emerald-950/50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pagamento (+30 Dias)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
