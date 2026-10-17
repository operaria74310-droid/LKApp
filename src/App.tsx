import React, { useState, useEffect, useMemo } from 'react';
import {
  Client,
  PaymentRecord,
  MonthlyClosure,
  AppSettings,
  FilterStatus,
} from './types';
import { StorageService } from './utils/storage';
import {
  getTodayDateString,
  getCurrentMonthYear,
  getDueStatus,
  formatDateDisplay,
  formatCurrency,
  cleanPhoneForWhatsapp,
  addDaysToDate,
} from './utils/dateUtils';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { DailyAlertBanner } from './components/DailyAlertBanner';
import { ClientList } from './components/ClientList';
import { ClientFormModal } from './components/ClientFormModal';
import { ConfirmPaymentModal } from './components/ConfirmPaymentModal';
import { RescheduleModal } from './components/RescheduleModal';
import { FinancialConferenceModal } from './components/FinancialConferenceModal';
import { SecurityResetModal } from './components/SecurityResetModal';
import { BackupModal } from './components/BackupModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Application Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [closures, setClosures] = useState<MonthlyClosure[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.loadSettings());

  // UI & Filter States
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [confirmPaymentClient, setConfirmPaymentClient] = useState<Client | null>(null);
  const [rescheduleClient, setRescheduleClient] = useState<Client | null>(null);

  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);
  const [isSecurityResetModalOpen, setIsSecurityResetModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const loadedClients = StorageService.loadClients();
    const loadedPayments = StorageService.loadPayments();
    const loadedClosures = StorageService.loadClosures();
    const loadedSettings = StorageService.loadSettings();

    setClients(loadedClients);
    setPayments(loadedPayments);
    setClosures(loadedClosures);
    setSettings(loadedSettings);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Financial Metrics
  const todayStr = getTodayDateString();
  const currentMonth = getCurrentMonthYear();

  const dailyPayments = useMemo(() => {
    return payments.filter((p) => p.dateOnly === todayStr || p.date.startsWith(todayStr));
  }, [payments, todayStr]);

  const dailyTotal = useMemo(() => {
    return dailyPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  }, [dailyPayments]);

  const monthlyPayments = useMemo(() => {
    return payments.filter((p) => p.monthYear === currentMonth || p.date.startsWith(currentMonth));
  }, [payments, currentMonth]);

  const monthlyTotal = useMemo(() => {
    return monthlyPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  }, [monthlyPayments]);

  // Projected monthly income (sum of monthly charges from active clients)
  const monthlyProjected = useMemo(() => {
    return clients
      .filter((c) => c.status === 'active')
      .reduce((acc, c) => acc + c.chargeAmount, 0);
  }, [clients]);

  // Categorize clients
  const todayClients = useMemo(() => {
    return clients.filter((c) => getDueStatus(c.dueDate) === 'today');
  }, [clients]);

  const overdueClients = useMemo(() => {
    return clients.filter((c) => getDueStatus(c.dueDate) === 'overdue');
  }, [clients]);

  // Save or Update Client
  const handleSaveClient = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
    clientId?: string
  ) => {
    const nowIso = new Date().toISOString();
    let updatedList: Client[];

    if (clientId) {
      // Edit
      updatedList = clients.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            ...clientData,
            updatedAt: nowIso,
          };
        }
        return c;
      });
      showToast(`Cadastro de ${clientData.name} atualizado com sucesso!`);
    } else {
      // New
      const newClient: Client = {
        ...clientData,
        id: `cli-${Date.now()}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedList = [newClient, ...clients];
      showToast(`Cliente ${clientData.name} cadastrado com sucesso!`);
    }

    setClients(updatedList);
    StorageService.saveClients(updatedList);
  };

  // Delete Client
  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      const updatedList = clients.filter((c) => c.id !== client.id);
      setClients(updatedList);
      StorageService.saveClients(updatedList);
      showToast(`Cliente ${client.name} removido.`, 'info');
    }
  };

  // Confirm Payment
  // Required: "aceite alteração de valor na hora da confirmação do pagamento. quando confirmar pagamento, adicione novamente o mesmo pagamento para 30 dias após confirmação"
  const handleConfirmPayment = (
    client: Client,
    amountPaid: number,
    paymentMethod: PaymentRecord['paymentMethod'],
    newDueDate: string,
    notes: string,
    openWhatsapp: boolean
  ) => {
    const nowIso = new Date().toISOString();
    const today = getTodayDateString();
    const month = getCurrentMonthYear();

    // 1. Create Payment Record
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      server: client.server,
      app: client.app,
      date: nowIso,
      dateOnly: today,
      monthYear: month,
      amountCharged: client.chargeAmount,
      amountPaid: amountPaid,
      paymentMethod: paymentMethod,
      notes: notes,
      previousDueDate: client.dueDate,
      newDueDate: newDueDate,
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);

    // 2. Update Client with new due date (+30 days) and last payment details
    const updatedClients = clients.map((c) => {
      if (c.id === client.id) {
        return {
          ...c,
          dueDate: newDueDate,
          lastPaymentDate: today,
          lastPaymentAmount: amountPaid,
          updatedAt: nowIso,
        };
      }
      return c;
    });

    setClients(updatedClients);
    StorageService.saveClients(updatedClients);

    showToast(`Pagamento de ${client.name} confirmado no valor de ${formatCurrency(amountPaid)}! Próximo vencimento: ${formatDateDisplay(newDueDate)}.`);

    // 3. Open WhatsApp receipt if requested
    if (openWhatsapp && client.phone) {
      sendWhatsappReceipt(client, amountPaid, newDueDate);
    }
  };

  // Reschedule Due Date
  const handleReschedule = (client: Client, newDueDate: string, reason: string) => {
    const updatedClients = clients.map((c) => {
      if (c.id === client.id) {
        return {
          ...c,
          dueDate: newDueDate,
          notes: reason ? `${c.notes ? c.notes + ' | ' : ''}Reagendado para ${formatDateDisplay(newDueDate)}: ${reason}` : c.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    setClients(updatedClients);
    StorageService.saveClients(updatedClients);
    showToast(`Cobrança de ${client.name} reagendada para ${formatDateDisplay(newDueDate)}!`, 'info');
  };

  // Send WhatsApp Charge Message
  const handleSendWhatsappCharge = (client: Client) => {
    if (!client.phone) {
      alert('Este cliente não possui telefone/WhatsApp cadastrado.');
      return;
    }

    const cleanPhone = cleanPhoneForWhatsapp(client.phone);
    if (!cleanPhone) {
      alert('Telefone do cliente é inválido.');
      return;
    }

    let text = settings.whatsappMessageTemplate;
    text = text.replace(/\{NOME\}/g, client.name);
    text = text.replace(/\{VALOR\}/g, formatCurrency(client.chargeAmount));
    text = text.replace(/\{VENCIMENTO\}/g, formatDateDisplay(client.dueDate));
    text = text.replace(/\{SERVIDOR\}/g, client.server || 'Principal');
    text = text.replace(/\{APLICATIVO\}/g, client.app || 'Configurado');
    text = text.replace(/\{MAC\}/g, client.mac || 'N/A');
    text = text.replace(/\{KEY\}/g, client.key || 'N/A');
    text = text.replace(/\{TELAS\}/g, `${client.connections}`);
    text = text.replace(/\{CHAVE_PIX\}/g, settings.pixKey);
    text = text.replace(/\{TITULAR\}/g, settings.pixReceiverName);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Send WhatsApp Receipt
  const sendWhatsappReceipt = (client: Client, amount: number, nextDue: string) => {
    const cleanPhone = cleanPhoneForWhatsapp(client.phone);
    if (!cleanPhone) return;

    const receiptMessage = `✅ *Comprovante de Pagamento Confirmado - LK-Clientes*

Olá, *${client.name}*!
Recebemos a confirmação do seu pagamento no valor de *${formatCurrency(amount)}*.

📡 *Dados do Plano:*
• Servidor: ${client.server}
• Aplicativo: ${client.app}
• Telas: ${client.connections}

📅 *Sua assinatura foi renovada com sucesso!*
Próxima cobrança agendada para: *${formatDateDisplay(nextDue)}* (+30 dias).

Agradecemos a confiança e preferência! Bom divertimento! 🍿`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(receiptMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Security Wipe of financial values (Requires password 74310)
  const handleSecurityWipe = (password: string) => {
    const result = StorageService.securityWipeFinancialValues(password);
    if (result.success) {
      setPayments([]);
      loadAllData();
      showToast(result.message, 'info');
    }
    return result;
  };

  // Month Reset
  const handleResetMonth = (monthYear: string, totalCollected: number, count: number) => {
    const newClosure = StorageService.closeAndResetMonth(monthYear, totalCollected, count);
    setClosures((prev) => [...prev, newClosure]);
    showToast(`Mês ${monthYear} arquivado e conferência reiniciada.`);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('Configurações de PIX e mensagem salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-medium backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenNewClient={() => {
          setClientToEdit(null);
          setIsClientModalOpen(true);
        }}
        onOpenFinancials={() => setIsFinancialsModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        todayCount={todayClients.length}
        overdueCount={overdueClients.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Daily & Monthly Stat Cards */}
        <StatCards
          dailyTotal={dailyTotal}
          dailyCount={dailyPayments.length}
          monthlyTotal={monthlyTotal}
          monthlyCount={monthlyPayments.length}
          monthlyProjected={monthlyProjected}
          todayDueCount={todayClients.length}
          overdueCount={overdueClients.length}
          totalActiveClients={clients.length}
          onFilterChange={(filter) => setCurrentFilter(filter)}
          currentFilter={currentFilter}
        />

        {/* Prominent Daily Alert Banner */}
        <DailyAlertBanner
          todayClients={todayClients}
          overdueClients={overdueClients}
          onFilterToday={() => setCurrentFilter('today')}
          onFilterOverdue={() => setCurrentFilter('overdue')}
          onConfirmPayment={(client) => setConfirmPaymentClient(client)}
          onSendWhatsapp={handleSendWhatsappCharge}
        />

        {/* Client Management & List */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Clientes Mensalistas
              </h2>
              <p className="text-xs text-slate-400">
                Gerenciamento de acessos, servidores, aplicativos e agendamentos
              </p>
            </div>
          </div>

          <ClientList
            clients={clients}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            onConfirmPayment={(client) => setConfirmPaymentClient(client)}
            onReschedule={(client) => setRescheduleClient(client)}
            onEditClient={(client) => {
              setClientToEdit(client);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onSendWhatsapp={handleSendWhatsappCharge}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
        <p>LK-Clientes · Sistema de Gestão de Cobranças Mensalistas · Senha de Zeramento Autorizada: 74310</p>
      </footer>

      {/* Modals */}
      {/* 1. Client Form (New/Edit) */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* 2. Confirm Payment Modal */}
      <ConfirmPaymentModal
        isOpen={!!confirmPaymentClient}
        onClose={() => setConfirmPaymentClient(null)}
        client={confirmPaymentClient}
        onConfirm={handleConfirmPayment}
        settings={settings}
      />

      {/* 3. Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleClient}
        onClose={() => setRescheduleClient(null)}
        client={rescheduleClient}
        onReschedule={handleReschedule}
      />

      {/* 4. Financial Conference Modal */}
      <FinancialConferenceModal
        isOpen={isFinancialsModalOpen}
        onClose={() => setIsFinancialsModalOpen(false)}
        payments={payments}
        closures={closures}
        onOpenSecurityWipe={() => setIsSecurityResetModalOpen(true)}
        onResetMonth={handleResetMonth}
      />

      {/* 5. Security Reset Modal (Requires 74310 password) */}
      <SecurityResetModal
        isOpen={isSecurityResetModalOpen}
        onClose={() => setIsSecurityResetModalOpen(false)}
        onConfirmWipe={handleSecurityWipe}
      />

      {/* 6. Backup Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        clientsCount={clients.length}
        paymentsCount={payments.length}
        onDataRestored={() => {
          loadAllData();
          showToast('Dados restaurados com sucesso!');
        }}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
