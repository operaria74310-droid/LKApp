import { Client, PaymentRecord, MonthlyClosure, AppSettings } from '../types';
import { getTodayDateString, addDaysToDate, getCurrentMonthYear } from './dateUtils';

const STORAGE_KEYS = {
  CLIENTS: 'lk_clientes_list_v1',
  PAYMENTS: 'lk_clientes_payments_v1',
  CLOSURES: 'lk_clientes_closures_v1',
  SETTINGS: 'lk_clientes_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  pixKey: 'operaria74310@gmail.com',
  pixKeyType: 'email',
  pixReceiverName: 'LK Clientes',
  companyName: 'LK-Clientes',
  whatsappMessageTemplate: `Olá, {NOME}! 🌟
Lembramos que sua mensalidade vence em {VENCIMENTO}.

📡 *Detalhes do Acesso:*
• Servidor: {SERVIDOR}
• Aplicativo: {APLICATIVO}
• MAC: {MAC}
• Key: {KEY}
• Telas: {TELAS}

💰 *Valor:* {VALOR}
🔑 *Chave PIX:* {CHAVE_PIX} ({TITULAR})

Após realizar o pagamento, por favor nos envie o comprovante por aqui para confirmação e renovação imediata! Obrigado!`,
};

// Realistic initial sample data to make the app interactive on first launch
export function getInitialClients(): Client[] {
  const today = getTodayDateString();
  const past3Days = addDaysToDate(today, -3);
  const next2Days = addDaysToDate(today, 2);
  const next15Days = addDaysToDate(today, 15);
  const past1Day = addDaysToDate(today, -1);

  return [
    {
      id: 'cli-001',
      name: 'Carlos Eduardo Silva',
      phone: '(11) 98765-4321',
      server: 'Servidor Gold Ultra',
      app: 'XCIPTV Pro',
      mac: '00:1A:79:B4:C8:10',
      key: 'xc99421',
      connections: 2,
      chargeAmount: 45.0,
      dueDate: today, // Cobrança HOJE!
      notes: 'Cliente prefere pagar via PIX sempre pela manhã.',
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-09-17T10:00:00.000Z',
      lastPaymentDate: addDaysToDate(today, -30),
      lastPaymentAmount: 45.0,
      status: 'active',
    },
    {
      id: 'cli-002',
      name: 'Mariana Ribeiro Costa',
      phone: '(21) 99876-5432',
      server: 'CDN Platinum 4K',
      app: 'IBO Player',
      mac: '00:1B:44:11:3A:99',
      key: 'ibo_pass_882',
      connections: 1,
      chargeAmount: 35.0,
      dueDate: past3Days, // Vencido há 3 dias!
      notes: 'Solicitou link de cobrança com chave Pix.',
      createdAt: '2026-07-10T14:30:00.000Z',
      updatedAt: '2026-09-14T14:30:00.000Z',
      lastPaymentDate: addDaysToDate(today, -33),
      lastPaymentAmount: 35.0,
      status: 'active',
    },
    {
      id: 'cli-003',
      name: 'Rodrigo Alcantara',
      phone: '(31) 97654-3210',
      server: 'Servidor Gold Ultra',
      app: 'IPTV Smarters Pro',
      mac: 'E4:5F:01:88:22:1A',
      key: 'smart_7721',
      connections: 3,
      chargeAmount: 60.0,
      dueDate: today, // Cobrança HOJE!
      notes: 'Plano família (3 telas).',
      createdAt: '2026-05-20T09:15:00.000Z',
      updatedAt: '2026-09-17T09:15:00.000Z',
      lastPaymentDate: addDaysToDate(today, -30),
      lastPaymentAmount: 60.0,
      status: 'active',
    },
    {
      id: 'cli-004',
      name: 'Patrícia Mendes Rocha',
      phone: '(41) 98123-4567',
      server: 'P2P Turbo Extreme',
      app: 'TiviMate IPTV',
      mac: 'A8:9C:ED:41:20:FE',
      key: 'tivi_mendes_01',
      connections: 1,
      chargeAmount: 35.0,
      dueDate: next2Days,
      notes: 'Pagamento pontual todo mês.',
      createdAt: '2026-08-01T16:00:00.000Z',
      updatedAt: '2026-09-19T16:00:00.000Z',
      lastPaymentDate: addDaysToDate(today, -28),
      lastPaymentAmount: 35.0,
      status: 'active',
    },
    {
      id: 'cli-005',
      name: 'Lucas Ferreira Guimarães',
      phone: '(51) 99112-2334',
      server: 'CDN Platinum 4K',
      app: 'Bob Player',
      mac: '02:00:00:00:00:01',
      key: 'bob_lucas_key',
      connections: 2,
      chargeAmount: 50.0,
      dueDate: next15Days,
      notes: 'Renovado recentemente.',
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-10-02T11:00:00.000Z',
      lastPaymentDate: addDaysToDate(today, -15),
      lastPaymentAmount: 50.0,
      status: 'active',
    },
    {
      id: 'cli-006',
      name: 'Fernando Dias Barbosa',
      phone: '(85) 98877-6655',
      server: 'Servidor Gold Ultra',
      app: 'XCIPTV Pro',
      mac: 'CC:46:D6:77:88:99',
      key: 'dias_fer_991',
      connections: 1,
      chargeAmount: 35.0,
      dueDate: past1Day, // Vencido ontem!
      notes: 'Costuma responder no fim da tarde.',
      createdAt: '2026-06-15T08:00:00.000Z',
      updatedAt: '2026-09-16T08:00:00.000Z',
      lastPaymentDate: addDaysToDate(today, -31),
      lastPaymentAmount: 35.0,
      status: 'active',
    },
  ];
}

// Initial sample payments for today and this month to test financial balance
export function getInitialPayments(): PaymentRecord[] {
  const today = getTodayDateString();
  const currentMonth = getCurrentMonthYear();
  const yesterday = addDaysToDate(today, -1);

  return [
    {
      id: 'pay-001',
      clientId: 'cli-005',
      clientName: 'Lucas Ferreira Guimarães',
      server: 'CDN Platinum 4K',
      app: 'Bob Player',
      date: `${today}T09:40:00.000Z`,
      dateOnly: today,
      monthYear: currentMonth,
      amountCharged: 50.0,
      amountPaid: 50.0,
      paymentMethod: 'pix',
      notes: 'Confirmado via comprovante Pix Bradesco',
      previousDueDate: today,
      newDueDate: addDaysToDate(today, 30),
    },
    {
      id: 'pay-002',
      clientId: 'cli-007',
      clientName: 'Juliana Vieira Gomes',
      server: 'Servidor Gold Ultra',
      app: 'XCIPTV Pro',
      date: `${yesterday}T15:20:00.000Z`,
      dateOnly: yesterday,
      monthYear: currentMonth,
      amountCharged: 35.0,
      amountPaid: 35.0,
      paymentMethod: 'pix',
      notes: 'Pago pontual',
      previousDueDate: yesterday,
      newDueDate: addDaysToDate(yesterday, 30),
    },
  ];
}

export const StorageService = {
  loadClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!data) {
        const initial = getInitialClients();
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading clients from localStorage', e);
      return [];
    }
  },

  saveClients(clients: Client[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients to localStorage', e);
    }
  },

  loadPayments(): PaymentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (!data) {
        const initial = getInitialPayments();
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading payments from localStorage', e);
      return [];
    }
  },

  savePayments(payments: PaymentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.error('Error saving payments to localStorage', e);
    }
  },

  loadClosures(): MonthlyClosure[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOSURES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading closures', e);
      return [];
    }
  },

  saveClosures(closures: MonthlyClosure[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(closures));
    } catch (e) {
      console.error('Error saving closures', e);
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // Export full backup JSON
  exportBackup(): void {
    const clients = this.loadClients();
    const payments = this.loadPayments();
    const closures = this.loadClosures();
    const settings = this.loadSettings();

    const backupPayload = {
      app: 'LK-Clientes',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      stats: {
        totalClients: clients.length,
        totalPayments: payments.length,
      },
      data: {
        clients,
        payments,
        closures,
        settings,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const todayStr = getTodayDateString();
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LK-Clientes-Backup-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Import full backup JSON
  importBackup(jsonString: string): { success: boolean; message: string; count?: { clients: number; payments: number } } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!parsed.data && !parsed.clients)) {
        return { success: false, message: 'Arquivo de backup inválido. Estrutura não reconhecida.' };
      }

      const clients: Client[] = parsed.data?.clients || parsed.clients || [];
      const payments: PaymentRecord[] = parsed.data?.payments || parsed.payments || [];
      const closures: MonthlyClosure[] = parsed.data?.closures || parsed.closures || [];
      const settings: AppSettings = parsed.data?.settings || parsed.settings || DEFAULT_SETTINGS;

      this.saveClients(clients);
      this.savePayments(payments);
      this.saveClosures(closures);
      this.saveSettings(settings);

      return {
        success: true,
        message: 'Backup restaurado com sucesso!',
        count: { clients: clients.length, payments: payments.length },
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao processar arquivo: ${err?.message || 'Arquivo corrompido'}` };
    }
  },

  // Security wiping of financial values using required password 74310
  securityWipeFinancialValues(password: string): { success: boolean; message: string } {
    const REQUIRED_PASSWORD = '74310';
    if (password !== REQUIRED_PASSWORD) {
      return {
        success: false,
        message: 'Senha incorreta! Apenas a senha de segurança autorizada permite a remoção total dos valores.',
      };
    }

    // Remove all payment records
    this.savePayments([]);

    // Clear lastPayment info from clients without deleting client accounts
    const clients = this.loadClients();
    const updatedClients = clients.map((c) => ({
      ...c,
      lastPaymentDate: undefined,
      lastPaymentAmount: undefined,
    }));
    this.saveClients(updatedClients);

    return {
      success: true,
      message: 'Todos os valores financeiros e lançamentos de caixa foram zerados com sucesso.',
    };
  },

  // Close and reset current month conference
  closeAndResetMonth(monthYear: string, totalCollected: number, paymentsCount: number): MonthlyClosure {
    const closures = this.loadClosures();
    const newClosure: MonthlyClosure = {
      id: `closure-${Date.now()}`,
      monthYear,
      label: `Fechamento de ${monthYear}`,
      closedAt: new Date().toISOString(),
      totalCollected,
      paymentsCount,
    };

    closures.push(newClosure);
    this.saveClosures(closures);
    return newClosure;
  },
};
