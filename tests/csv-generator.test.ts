import { describe, expect, it } from 'vitest';
import { generateInvoiceCsv } from '../src/lib/csv-generator';
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

describe('generateInvoiceCsv', () => {
  it('separates rows with CRLF for RFC 4180 / Excel compatibility', () => {
    const csv = generateInvoiceCsv(buildInvoice());
    expect(csv).toContain('\r\n');
    expect(csv.split('\r\n').length).toBeGreaterThan(1);
  });

  it('quotes and escapes values containing commas, quotes, or newlines', () => {
    const csv = generateInvoiceCsv(
      buildInvoice({ notes: 'Line one,with comma\nLine two with "quotes"' }),
    );
    expect(csv).toContain('"Line one,with comma\nLine two with ""quotes"""');
  });

  it('emits a header row and one row per shift', () => {
    const shifts = [
      createShiftEntry('Morning', '2024-05-01', '08:00', '14:00', false),
      createShiftEntry('Evening', '2024-05-02', '14:00', '20:00', false),
    ];
    const csv = generateInvoiceCsv(buildInvoice({ shifts }));
    const lines = csv.split('\r\n');
    expect(lines).toContain('Description,Date,Start,End,Hours,OT Hours,Daily Rate,Amount');
    expect(lines.some((line) => line.startsWith('Morning,2024-05-01,'))).toBe(true);
    expect(lines.some((line) => line.startsWith('Evening,2024-05-02,'))).toBe(true);
  });

  it('formats currency totals with thousand separators', () => {
    const csv = generateInvoiceCsv(
      buildInvoice({ dailyTotal: 1400, otTotal: 28, grandTotal: 1428 }),
    );
    const lines = csv.split('\r\n');
    expect(lines).toContain('Daily Total,"£1,400.00"');
    expect(lines).toContain('Grand Total,"£1,428.00"');
  });

  it('includes a dedicated OT hours total row', () => {
    const csv = generateInvoiceCsv(buildInvoice({ otHoursTotal: 4.5, otTotal: 63 }));
    const lines = csv.split('\r\n');
    expect(lines).toContain('OT Hours Total,4.5');
    expect(lines).toContain('OT Total,£63.00');
  });
});
