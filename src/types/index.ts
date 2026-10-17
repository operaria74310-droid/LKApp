export interface Client {
  id: string;
  name: string;
  phone: string;
  server: string;
  app: string;
  mac: string;
  key: string;
  connections: number; // Número de acessos
  chargeAmount: number; // Valor de cobrança
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  status: 'active' | 'suspended';
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  server: string;
  app: string;
  date: string; // ISO string
  dateOnly: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  amountCharged: number; // Valor original
  amountPaid: number; // Valor efetivamente pago (alterado ou mantido)
  paymentMethod: 'pix' | 'money' | 'card' | 'transfer' | 'other';
  notes?: string;
  previousDueDate: string;
  newDueDate: string;
}

export interface MonthlyClosure {
  id: string;
  monthYear: string; // YYYY-MM
  label: string; // e.g. "Outubro / 2026"
  closedAt: string;
  totalCollected: number;
  paymentsCount: number;
  notes?: string;
}

export interface AppSettings {
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
  companyName: string;
  whatsappMessageTemplate: string;
}

export type FilterStatus = 'all' | 'today' | 'overdue' | 'next7days' | 'paid_this_month';
