import { describe, expect, it } from 'vitest';
import { generateInvoiceExcel } from '../src/lib/excel-generator';
import { createShiftEntry } from '../src/lib/calculations';
import {
  DEFAULT_CLIENT_DETAILS,
  DEFAULT_COMPANY_DETAILS,
  DEFAULT_RATE_SETTINGS,
  InvoiceData,
} from '../src/lib/types';

function buildInvoice(overrides: Partial<InvoiceData> = {}): InvoiceData {
  const shifts = [createShiftEntry('Day shift', '2024-05-01', '08:00', '18:00', false)];
  return {
    invoiceNumber: 'MAY/001',
    invoiceDate: '2024-05-31',
    dueDate: '2024-06-30',
    notes: '',
    shifts,
    dailyTotal: DEFAULT_RATE_SETTINGS.dailyRate,
    otTotal: 0,
    otHoursTotal: 0,
    tax: 0,
    grandTotal: DEFAULT_RATE_SETTINGS.dailyRate,
    companyDetails: DEFAULT_COMPANY_DETAILS,
    clientDetails: DEFAULT_CLIENT_DETAILS,
    rateSettings: DEFAULT_RATE_SETTINGS,
    ...overrides,
  };
}

describe('generateInvoiceExcel', () => {
  it('writes formula-like invoice text as inert strings', () => {
    const wb = generateInvoiceExcel(
      buildInvoice({
        invoiceNumber: '=HYPERLINK("https://example.test")',
        shifts: [createShiftEntry('@SUM(1,2)', '2024-05-01', '08:00', '18:00', false)],
        notes: '+cmd|calc',
      }),
    );
    const sheet = wb.Sheets.Invoice;

    expect(sheet.I4.v).toBe('\'=HYPERLINK("https://example.test")');
    expect(sheet.B16.v).toBe("'@SUM(1,2)");
    expect(sheet.B32.v).toBe("'+cmd|calc");
    expect(sheet.I4.f).toBeUndefined();
    expect(sheet.B16.f).toBeUndefined();
    expect(sheet.B32.f).toBeUndefined();
  });
});
