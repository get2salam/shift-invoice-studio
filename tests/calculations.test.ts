import { describe, it, expect } from 'vitest';
import {
  parseTime,
  calculateHours,
  roundHoursToNearest,
  calculateOvertimeHours,
  calculateShiftAmount,
  calculateInvoiceTotals,
  createShiftEntry,
  formatDate,
  formatCurrency,
  generateInvoiceNumber,
} from '../src/lib/calculations';
import { RATES } from '../src/lib/types';

describe('parseTime', () => {
  it('parses colon-separated time', () => {
    expect(parseTime('09:30')).toEqual({ hours: 9, minutes: 30 });
  });

  it('parses dot-separated time', () => {
    expect(parseTime('14.45')).toEqual({ hours: 14, minutes: 45 });
  });

  it('returns null for invalid input', () => {
    expect(parseTime('invalid')).toBeNull();
    expect(parseTime('')).toBeNull();
  });

  it('handles single-digit hours', () => {
    expect(parseTime('7:00')).toEqual({ hours: 7, minutes: 0 });
  });

  it('rejects out-of-range hours', () => {
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('24:00')).toBeNull();
  });

  it('rejects out-of-range minutes', () => {
    expect(parseTime('09:60')).toBeNull();
    expect(parseTime('09:99')).toBeNull();
  });

  it('accepts boundary times', () => {
    expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
  });
});

describe('calculateHours', () => {
  it('calculates hours between two times', () => {
    expect(calculateHours('08:00', '16:00')).toBe(8);
  });

  it('handles partial hours', () => {
    expect(calculateHours('09:00', '17:30')).toBe(8.5);
  });

  it('returns 0 for invalid times', () => {
    expect(calculateHours('invalid', '16:00')).toBe(0);
  });

  it('handles 12-hour shifts', () => {
    expect(calculateHours('06:00', '18:00')).toBe(12);
  });

  it('calculates overnight shifts that cross midnight', () => {
    expect(calculateHours('22:00', '06:00')).toBe(8);
    expect(calculateHours('23:30', '01:15')).toBe(1.75);
  });

  it('treats matching start and end times as zero hours', () => {
    expect(calculateHours('08:00', '08:00')).toBe(0);
  });
});

describe('roundHoursToNearest', () => {
  it('rounds to nearest 0.5 by default', () => {
    expect(roundHoursToNearest(8.3)).toBe(8.5);
    expect(roundHoursToNearest(8.1)).toBe(8);
    expect(roundHoursToNearest(8.75)).toBe(9);
  });

  it('rounds to nearest 0.25 when specified', () => {
    expect(roundHoursToNearest(8.1, 0.25)).toBe(8);
    expect(roundHoursToNearest(8.2, 0.25)).toBe(8.25);
  });
});

describe('calculateOvertimeHours', () => {
  it('returns 0 when hours are within standard', () => {
    expect(calculateOvertimeHours(8)).toBe(0);
    expect(calculateOvertimeHours(RATES.standardHours)).toBe(0);
  });

  it('returns overtime hours when exceeding standard', () => {
    expect(calculateOvertimeHours(12)).toBe(2);
    expect(calculateOvertimeHours(11.5)).toBe(1.5);
  });
});

describe('calculateShiftAmount', () => {
  it('returns daily rate when no overtime', () => {
    expect(calculateShiftAmount(8, 0)).toBe(RATES.dailyRate);
  });

  it('adds overtime pay', () => {
    const expected = RATES.dailyRate + 2 * RATES.otRate;
    expect(calculateShiftAmount(12, 2)).toBe(expected);
  });

  it('does not charge for invalid or zero-hour shifts', () => {
    expect(calculateShiftAmount(0, 0)).toBe(0);
    expect(calculateShiftAmount(-8, 2)).toBe(0);
  });

  it('ignores negative overtime adjustments when calculating pay', () => {
    expect(calculateShiftAmount(8, -1)).toBe(RATES.dailyRate);
  });
});

describe('calculateInvoiceTotals', () => {
  it('calculates totals for multiple shifts', () => {
    const shifts = [
      createShiftEntry('Shift', '2024-01-01', '08:00', '18:00', false),
      createShiftEntry('Shift', '2024-01-02', '08:00', '20:00', false),
    ];
    const totals = calculateInvoiceTotals(shifts);

    expect(totals.dailyTotal).toBe(2 * RATES.dailyRate);
    expect(totals.otHoursTotal).toBe(shifts[0].otHours + shifts[1].otHours);
    expect(totals.otTotal).toBe(totals.otHoursTotal * RATES.otRate);
    expect(totals.grandTotal).toBe(totals.dailyTotal + totals.otTotal);
  });

  it('handles empty shifts array', () => {
    const totals = calculateInvoiceTotals([]);
    expect(totals.dailyTotal).toBe(0);
    expect(totals.otHoursTotal).toBe(0);
    expect(totals.otTotal).toBe(0);
    expect(totals.grandTotal).toBe(0);
  });

  it('excludes zero-length time ranges from billable invoice totals', () => {
    const valid = createShiftEntry('Day shift', '2024-01-01', '08:00', '18:00', false);
    const invalid = createShiftEntry('OCR review needed', '2024-01-02', '08:00', '08:00', false);
    const totals = calculateInvoiceTotals([valid, invalid]);

    expect(invalid.hours).toBe(0);
    expect(invalid.amount).toBe(0);
    expect(totals.dailyTotal).toBe(RATES.dailyRate);
    expect(totals.grandTotal).toBe(RATES.dailyRate);
  });

  it('includes overnight shifts in billable invoice totals', () => {
    const overnight = createShiftEntry('Night cover', '2024-01-03', '22:00', '06:00', false);
    const totals = calculateInvoiceTotals([overnight]);

    expect(overnight.hours).toBe(8);
    expect(overnight.amount).toBe(RATES.dailyRate);
    expect(totals.dailyTotal).toBe(RATES.dailyRate);
    expect(totals.grandTotal).toBe(RATES.dailyRate);
  });

  it('does not let negative overtime reduce invoice totals', () => {
    const shift = createShiftEntry('Adjusted shift', '2024-01-03', '08:00', '16:00', false);
    const totals = calculateInvoiceTotals([{ ...shift, otHours: -2 }]);

    expect(totals.otHoursTotal).toBe(0);
    expect(totals.otTotal).toBe(0);
    expect(totals.grandTotal).toBe(RATES.dailyRate);
  });
});

describe('createShiftEntry', () => {
  it('creates a shift entry with calculated fields', () => {
    const shift = createShiftEntry('Test', '2024-01-15', '08:00', '18:00', false);
    expect(shift.hours).toBe(10);
    expect(shift.otHours).toBe(0);
    expect(shift.rate).toBe(RATES.dailyRate);
    expect(shift.amount).toBe(RATES.dailyRate);
    expect(shift.id).toBeDefined();
  });

  it('rounds hours when rounding is enabled', () => {
    const shift = createShiftEntry('Test', '2024-01-15', '08:00', '18:20', true);
    expect(shift.hours).toBe(10.5);
  });
});

describe('formatDate', () => {
  it('formats ISO date to DD/MM/YYYY', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024');
  });

  it('is timezone-independent for ISO date strings', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'Pacific/Pago_Pago';
    try {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31')).toBe('31/12/2024');
    } finally {
      process.env.TZ = originalTZ;
    }
  });

  it('returns original string for unparseable input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatCurrency', () => {
  it('formats number as GBP currency', () => {
    expect(formatCurrency(140)).toBe('£140.00');
    expect(formatCurrency(14.5)).toBe('£14.50');
    expect(formatCurrency(0)).toBe('£0.00');
  });

  it('inserts thousand separators for large amounts', () => {
    expect(formatCurrency(1234.56)).toBe('£1,234.56');
    expect(formatCurrency(1000000)).toBe('£1,000,000.00');
  });

  it('places the negative sign before the currency symbol', () => {
    expect(formatCurrency(-10)).toBe('-£10.00');
    expect(formatCurrency(-1234.5)).toBe('-£1,234.50');
  });

  it('honours a custom currency symbol', () => {
    expect(formatCurrency(2500, '$')).toBe('$2,500.00');
  });
});

describe('generateInvoiceNumber', () => {
  it('generates invoice number with month prefix', () => {
    const invoiceNum = generateInvoiceNumber(1);
    expect(invoiceNum).toMatch(/^[A-Z]{3}\/001$/);
  });

  it('pads sequence number', () => {
    const invoiceNum = generateInvoiceNumber(42);
    expect(invoiceNum).toMatch(/^[A-Z]{3}\/042$/);
  });
});
