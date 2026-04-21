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
      shifts: parsed.shifts || [],
      companyDetails: { ...DEFAULT_COMPANY_DETAILS, ...parsed.companyDetails },
      clientDetails: { ...DEFAULT_CLIENT_DETAILS, ...parsed.clientDetails },
      rateSettings: { ...DEFAULT_RATE_SETTINGS, ...parsed.rateSettings },
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
