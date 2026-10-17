import React, { useState, useRef } from 'react';
import { X, Database, Download, Upload, CheckCircle2, AlertTriangle, FileJson, RefreshCw } from 'lucide-react';
import { StorageService, getInitialClients, getInitialPayments } from '../utils/storage';
import { getTodayDateString } from '../utils/dateUtils';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsCount: number;
  paymentsCount: number;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  clientsCount,
  paymentsCount,
  onDataRestored,
}) => {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    StorageService.exportBackup();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = StorageService.importBackup(content);
      if (result.success) {
        setImportStatus({
          type: 'success',
          message: `${result.message} (${result.count?.clients || 0} clientes e ${result.count?.payments || 0} lançamentos restaurados).`,
        });
        onDataRestored();
      } else {
        setImportStatus({ type: 'error', message: result.message });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreSampleData = () => {
    if (window.confirm('Deseja recarregar a base com os clientes e lançamentos de demonstração?')) {
      const sampleClients = getInitialClients();
      const samplePayments = getInitialPayments();
      StorageService.saveClients(sampleClients);
      StorageService.savePayments(samplePayments);
      setImportStatus({
        type: 'success',
        message: 'Dados demonstrativos carregados com sucesso!',
      });
      onDataRestored();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Backup e Restauração</h2>
              <p className="text-xs text-slate-400">
                Exportação e importação de segurança dos dados
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Current status summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Dados Atuais no Sistema:</span>
              <span className="font-semibold text-white">
                {clientsCount} clientes cadastrados · {paymentsCount} pagamentos registrados
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Local Ativo
            </span>
          </div>

          {/* 1. Export Section */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Criar / Exportar Backup
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gera um arquivo JSON completo com todos os clientes, servidores, MACs, chaves, valores e histórico de pagamentos para você salvar no seu computador ou celular.
              </p>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Backup Completo (.json)</span>
            </button>
          </div>

          {/* 2. Import Section */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Importar / Restaurar Backup
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Restaura os dados a partir de um arquivo JSON previamente exportado do LK-Clientes.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileJson className="w-4 h-4 text-blue-400" />
              <span>Selecionar Arquivo de Backup (.json)</span>
            </button>
          </div>

          {/* 3. Demo Data Recovery */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Precisa restaurar dados de teste?</span>
            <button
              onClick={handleRestoreSampleData}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Carregar Exemplo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
