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
});

describe('formatCurrency', () => {
  it('formats number as GBP currency', () => {
    expect(formatCurrency(140)).toBe('£140.00');
    expect(formatCurrency(14.5)).toBe('£14.50');
    expect(formatCurrency(0)).toBe('£0.00');
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
