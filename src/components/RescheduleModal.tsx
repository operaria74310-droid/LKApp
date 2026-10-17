import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Client } from '../types';
import { formatDateDisplay, addDaysToDate, getTodayDateString } from '../utils/dateUtils';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onReschedule: (client: Client, newDueDate: string, reason: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  client,
  onReschedule,
}) => {
  if (!isOpen || !client) return null;

  const [selectedDate, setSelectedDate] = useState<string>(client.dueDate || getTodayDateString());
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (client) {
      setSelectedDate(client.dueDate || getTodayDateString());
      setReason('');
    }
  }, [client, isOpen]);

  const handleQuickAddDays = (days: number) => {
    const today = getTodayDateString();
    setSelectedDate(addDaysToDate(today, days));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    onReschedule(client, selectedDate, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reagendar Cobrança</h2>
              <p className="text-xs text-slate-400">
                Ajuste a data de vencimento da mensalidade
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
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Cliente</span>
              <span className="font-semibold text-white">{client.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vencimento Atual</span>
              <span className="font-mono text-amber-400 font-semibold">
                {formatDateDisplay(client.dueDate)}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Atalhos Rápidos de Reagendamento:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '+3 dias', days: 3 },
                { label: '+5 dias', days: 5 },
                { label: '+7 dias', days: 7 },
                { label: '+15 dias', days: 15 },
              ].map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => handleQuickAddDays(shortcut.days)}
                  className="py-1.5 px-2 text-xs font-mono font-medium rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nova Data */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Nova Data de Cobrança <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              O alerta de cobrança será reprogramado para {formatDateDisplay(selectedDate)}.
            </p>
          </div>

          {/* Motivo do Reagendamento */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Motivo do Reagendamento (Opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Cliente pediu para receber no 5º dia útil..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Salvar Reagendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
