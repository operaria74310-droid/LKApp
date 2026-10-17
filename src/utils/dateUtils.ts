/**
 * Date and currency helper utilities for LK-Clientes
 */

// Formats a number to Brazilian Real (BRL)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(amount) ? 0 : amount);
}

// Parses string like "35", "35,50", "35.50" to float
export function parseCurrencyInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Clean up currency symbols and format
  const cleaned = value.toString().replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Get current date string as YYYY-MM-DD in local time
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current Month-Year as YYYY-MM
export function getCurrentMonthYear(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Format YYYY-MM to readable "Mês / Ano" (ex: "Outubro / 2026")
export function formatMonthYear(monthYear: string): string {
  if (!monthYear || !monthYear.includes('-')) return monthYear;
  const [yearStr, monthStr] = monthYear.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const name = months[monthIndex] || monthStr;
  return `${name} / ${yearStr}`;
}

// Format YYYY-MM-DD to DD/MM/YYYY
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '--/--/----';
  // Handles YYYY-MM-DD or ISO strings
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

// Format ISO string to DD/MM/YYYY às HH:mm
export function formatDateTimeDisplay(isoString?: string): string {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return formatDateDisplay(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return formatDateDisplay(isoString);
  }
}

// Add exactly N days to a YYYY-MM-DD date string (or from current day)
export function addDaysToDate(baseDateStr: string, days: number = 30): string {
  let base: Date;
  if (!baseDateStr || !baseDateStr.includes('-')) {
    base = new Date();
  } else {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    base = new Date(y, m - 1, d);
  }
  base.setDate(base.getDate() + days);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate days difference between target date and today
// positive = future (e.g. +3 days), 0 = today, negative = overdue (e.g. -2 days)
export function getDaysDifference(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const todayStr = getTodayDateString();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);

  const cleanTarget = targetDateStr.includes('T') ? targetDateStr.split('T')[0] : targetDateStr;
  const [y, m, d] = cleanTarget.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export type DueStatusType = 'today' | 'overdue' | 'next7days' | 'ok';

export function getDueStatus(dueDateStr: string): DueStatusType {
  const diff = getDaysDifference(dueDateStr);
  if (diff === 0) return 'today';
  if (diff < 0) return 'overdue';
  if (diff <= 7) return 'next7days';
  return 'ok';
}

export function getDueStatusLabel(dueDateStr: string): {
  label: string;
  type: DueStatusType;
  colorClass: string;
  badgeClass: string;
} {
  const diff = getDaysDifference(dueDateStr);
  if (diff === 0) {
    return {
      label: 'Cobrança Hoje!',
      type: 'today',
      colorClass: 'text-amber-400 font-semibold',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    };
  }
  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    return {
      label: `Vencido há ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}`,
      type: 'overdue',
      colorClass: 'text-rose-400 font-semibold',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    };
  }
  if (diff <= 7) {
    return {
      label: `Vence em ${diff} ${diff === 1 ? 'dia' : 'dias'}`,
      type: 'next7days',
      colorClass: 'text-blue-400 font-medium',
      badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    };
  }
  return {
    label: `Vence em ${diff} dias`,
    type: 'ok',
    colorClass: 'text-slate-400',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  };
}

// Clean phone for whatsapp link
export function cleanPhoneForWhatsapp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return '';
  // If no country code, add Brazil 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}
