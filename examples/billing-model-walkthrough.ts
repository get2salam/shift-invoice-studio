/**
 * Runnable walkthrough of the invoicing billing model.
 *
 * Run it with:
 *   npx vitest run tests/billing-model-example.test.ts
 *
 * The model is easy to misread from calculateShiftAmount alone: each billable
 * shift charges a flat `dailyRate` no matter how many hours it covers, and
 * only the hours *beyond* `standardHours` are billed extra, at `otRate` per
 * hour. A 4-hour shift and a 10-hour shift cost the client the same amount;
 * a shift with zero measurable hours (e.g. an unresolved OCR read) is
 * dropped from the invoice entirely.
 */
import { createShiftEntry, calculateInvoiceTotals, formatCurrency } from '../src/lib/calculations';
import { RateSettings, ShiftEntry, RATES } from '../src/lib/types';

export interface BillingWalkthroughResult {
  shifts: ShiftEntry[];
  totals: ReturnType<typeof calculateInvoiceTotals>;
  summaryLines: string[];
}

export function buildBillingModelWalkthrough(rates: RateSettings = RATES): BillingWalkthroughResult {
  const shifts = [
    createShiftEntry('Warehouse cover', '2024-06-03', '08:00', '18:00', false, rates), // exactly standardHours: no overtime
    createShiftEntry('Warehouse cover', '2024-06-04', '08:00', '20:00', false, rates), // 2h past the threshold: bills overtime
    createShiftEntry('OCR misread, needs review', '2024-06-05', '08:00', '08:00', false, rates), // 0h: excluded from the invoice
    createShiftEntry('Night security', '2024-06-06', '22:00', '06:00', false, rates), // overnight 8h: still one flat day rate
  ];

  const totals = calculateInvoiceTotals(shifts, rates);

  const summaryLines = [
    ...shifts.map(
      (shift) =>
        `${shift.date}  ${shift.startTime}-${shift.endTime}  ${shift.hours}h (${shift.otHours}h OT)  ${formatCurrency(shift.amount, rates.currencySymbol)}`,
    ),
    '---',
    `Billable shifts: ${shifts.filter((shift) => shift.hours > 0).length}  Day-rate total: ${formatCurrency(totals.dailyTotal, rates.currencySymbol)}`,
    `Overtime: ${totals.otHoursTotal}h  Overtime total: ${formatCurrency(totals.otTotal, rates.currencySymbol)}`,
    `Grand total: ${formatCurrency(totals.grandTotal, rates.currencySymbol)}`,
  ];

  return { shifts, totals, summaryLines };
}
