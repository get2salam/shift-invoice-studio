import { ClientDetails, CompanyDetails, DEFAULT_CLIENT_DETAILS, DEFAULT_COMPANY_DETAILS, DEFAULT_RATE_SETTINGS, RateSettings, ShiftEntry } from './types';

export interface InvoiceDraft {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  roundHours: boolean;
  shifts: ShiftEntry[];
  companyDetails: CompanyDetails;
  clientDetails: ClientDetails;
  rateSettings: RateSettings;
}

const STORAGE_KEY = 'shift-invoice-studio:draft';

// Coerce numeric rate fields so corrupted or stringified localStorage values
// (e.g. dailyRate: "NaN") fall back to safe defaults rather than propagating
// NaN through invoice calculations.
function sanitizeRates(raw: unknown): RateSettings {
  const src = (raw !== null && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const safeNum = (val: unknown, fallback: number): number => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
    return val;
  };
  return {
    currencySymbol: (typeof src.currencySymbol === 'string' && src.currencySymbol) ? src.currencySymbol : DEFAULT_RATE_SETTINGS.currencySymbol,
    defaultShiftDescription: (typeof src.defaultShiftDescription === 'string' && src.defaultShiftDescription) ? src.defaultShiftDescription : DEFAULT_RATE_SETTINGS.defaultShiftDescription,
    dailyRate: safeNum(src.dailyRate, DEFAULT_RATE_SETTINGS.dailyRate),
    otRate: safeNum(src.otRate, DEFAULT_RATE_SETTINGS.otRate),
    standardHours: safeNum(src.standardHours, DEFAULT_RATE_SETTINGS.standardHours),
  };
}

export function loadInvoiceDraft(): InvoiceDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InvoiceDraft>;
    if (!parsed.invoiceNumber || !parsed.invoiceDate) return null;

    return {
      invoiceNumber: parsed.invoiceNumber,
      invoiceDate: parsed.invoiceDate,
      dueDate: parsed.dueDate || 'Upon Receipt',
      notes: parsed.notes || '',
      roundHours: parsed.roundHours ?? true,
      shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
      companyDetails: { ...DEFAULT_COMPANY_DETAILS, ...parsed.companyDetails },
      clientDetails: { ...DEFAULT_CLIENT_DETAILS, ...parsed.clientDetails },
      rateSettings: sanitizeRates(parsed.rateSettings),
    };
  } catch (error) {
    console.error('Failed to read invoice draft:', error);
    return null;
  }
}

export function saveInvoiceDraft(draft: InvoiceDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save invoice draft:', error);
  }
}

export function clearInvoiceDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
