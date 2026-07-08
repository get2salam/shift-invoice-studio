import { describe, it, expect } from 'vitest';
import { buildBillingModelWalkthrough } from '../examples/billing-model-walkthrough';
import { RATES } from '../src/lib/types';

describe('billing model walkthrough example', () => {
  it('bills a flat day rate per shift and only pays overtime past the standard-hours threshold', () => {
    const { shifts, totals, summaryLines } = buildBillingModelWalkthrough();

    // A 10h shift (exactly standardHours) and an 8h overnight shift both bill the same flat day rate.
    expect(shifts[0].hours).toBe(RATES.standardHours);
    expect(shifts[0].amount).toBe(RATES.dailyRate);
    expect(shifts[3].hours).toBe(8);
    expect(shifts[3].amount).toBe(RATES.dailyRate);

    // A 12h shift bills the same day rate plus 2h of overtime at otRate.
    expect(shifts[1].otHours).toBe(2);
    expect(shifts[1].amount).toBe(RATES.dailyRate + 2 * RATES.otRate);

    // A zero-length shift (e.g. an unresolved OCR read) is excluded from billing entirely.
    expect(shifts[2].hours).toBe(0);
    expect(shifts[2].amount).toBe(0);

    expect(totals.dailyTotal).toBe(3 * RATES.dailyRate);
    expect(totals.otHoursTotal).toBe(2);
    expect(totals.otTotal).toBe(2 * RATES.otRate);
    expect(totals.grandTotal).toBe(3 * RATES.dailyRate + 2 * RATES.otRate);

    expect(summaryLines).toHaveLength(shifts.length + 4);
  });
});
