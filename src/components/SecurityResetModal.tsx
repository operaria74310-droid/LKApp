import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SecurityResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWipe: (password: string) => { success: boolean; message: string };
}

export const SecurityResetModal: React.FC<SecurityResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmWipe,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const result = onConfirmWipe(password.trim());
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setPassword('');
        setSuccessMsg('');
        onClose();
      }, 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/50 rounded-2xl w-full max-w-md shadow-2xl shadow-rose-950/40 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/20 bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-200">
                Remover Valores das Contas
              </h2>
              <p className="text-xs text-rose-300/80">
                Ação protegida por senha de segurança
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-200/90 leading-relaxed">
                <strong>ATENÇÃO:</strong> Esta opção remove totalmente todos os lançamentos financeiros, históricos de pagamento e zera os saldos diário e mensal.
              </p>
            </div>
            <p className="text-slate-400 text-[11px] pl-6">
              Os cadastros dos clientes (nome, servidor, aplicativo, MAC, key) continuarão salvos, mas seus saldos e pagamentos registrados serão reiniciados a zero.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                Digite a Senha de Confirmação (74310) <span className="text-rose-400">*</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-300 font-normal"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Digite a senha autorizada..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/40 rounded-lg text-sm font-mono tracking-widest text-center text-rose-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

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
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-950/60 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Confirmar Remoção dos Valores</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
