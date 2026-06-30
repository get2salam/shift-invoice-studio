import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearInvoiceDraft, InvoiceDraft, loadInvoiceDraft, saveInvoiceDraft } from '../src/lib/storage';
import { DEFAULT_CLIENT_DETAILS, DEFAULT_COMPANY_DETAILS, DEFAULT_RATE_SETTINGS } from '../src/lib/types';

const STORAGE_KEY = 'shift-invoice-studio:draft';

// Minimal in-memory localStorage double for Node test environment.
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
};

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: localStorageMock });
  Object.keys(store).forEach((k) => { delete store[k]; });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeDraft(overrides: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    invoiceNumber: 'MAY/001',
    invoiceDate: '2024-05-31',
    dueDate: 'Net 30 days',
    notes: 'Payment to usual account',
    roundHours: true,
    shifts: [],
    companyDetails: DEFAULT_COMPANY_DETAILS,
    clientDetails: DEFAULT_CLIENT_DETAILS,
    rateSettings: DEFAULT_RATE_SETTINGS,
    ...overrides,
  };
}

describe('loadInvoiceDraft', () => {
  it('returns null when localStorage is empty', () => {
    expect(loadInvoiceDraft()).toBeNull();
  });

  it('returns null when invoiceNumber is missing', () => {
    store[STORAGE_KEY] = JSON.stringify({ invoiceDate: '2024-05-31' });
    expect(loadInvoiceDraft()).toBeNull();
  });

  it('returns null when invoiceDate is missing', () => {
    store[STORAGE_KEY] = JSON.stringify({ invoiceNumber: 'MAY/001' });
    expect(loadInvoiceDraft()).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    store[STORAGE_KEY] = '{bad json{{';
    expect(loadInvoiceDraft()).toBeNull();
  });

  it('round-trips a complete draft', () => {
    const draft = makeDraft();
    saveInvoiceDraft(draft);
    const loaded = loadInvoiceDraft();

    expect(loaded?.invoiceNumber).toBe('MAY/001');
    expect(loaded?.invoiceDate).toBe('2024-05-31');
    expect(loaded?.dueDate).toBe('Net 30 days');
    expect(loaded?.rateSettings.dailyRate).toBe(DEFAULT_RATE_SETTINGS.dailyRate);
    expect(loaded?.companyDetails.name).toBe(DEFAULT_COMPANY_DETAILS.name);
    expect(loaded?.clientDetails.name).toBe(DEFAULT_CLIENT_DETAILS.name);
  });

  it('fills in default dueDate, notes, and roundHours when absent', () => {
    store[STORAGE_KEY] = JSON.stringify({ invoiceNumber: 'MAY/001', invoiceDate: '2024-05-31' });
    const loaded = loadInvoiceDraft();

    expect(loaded?.dueDate).toBe('Upon Receipt');
    expect(loaded?.notes).toBe('');
    expect(loaded?.roundHours).toBe(true);
  });

  it('merges stored company details over defaults', () => {
    store[STORAGE_KEY] = JSON.stringify({
      invoiceNumber: 'MAY/001',
      invoiceDate: '2024-05-31',
      companyDetails: { name: 'My Ltd', phone: '0161 000 0000' },
    });
    const loaded = loadInvoiceDraft();

    expect(loaded?.companyDetails.name).toBe('My Ltd');
    expect(loaded?.companyDetails.phone).toBe('0161 000 0000');
    expect(loaded?.companyDetails.city).toBe(DEFAULT_COMPANY_DETAILS.city);
  });

  it('treats a non-array shifts value as an empty list', () => {
    store[STORAGE_KEY] = JSON.stringify({
      invoiceNumber: 'MAY/001',
      invoiceDate: '2024-05-31',
      shifts: 'corrupted-string',
    });
    expect(loadInvoiceDraft()?.shifts).toEqual([]);
  });

  it('falls back to default rates when numeric fields are non-numeric strings', () => {
    store[STORAGE_KEY] = JSON.stringify({
      invoiceNumber: 'MAY/001',
      invoiceDate: '2024-05-31',
      rateSettings: { dailyRate: 'NaN', otRate: 'bad', standardHours: null },
    });
    const loaded = loadInvoiceDraft();

    expect(loaded?.rateSettings.dailyRate).toBe(DEFAULT_RATE_SETTINGS.dailyRate);
    expect(loaded?.rateSettings.otRate).toBe(DEFAULT_RATE_SETTINGS.otRate);
    expect(loaded?.rateSettings.standardHours).toBe(DEFAULT_RATE_SETTINGS.standardHours);
  });

  it('accepts valid numeric rate overrides', () => {
    store[STORAGE_KEY] = JSON.stringify({
      invoiceNumber: 'MAY/001',
      invoiceDate: '2024-05-31',
      rateSettings: { dailyRate: 200, otRate: 20, standardHours: 8 },
    });
    const loaded = loadInvoiceDraft();

    expect(loaded?.rateSettings.dailyRate).toBe(200);
    expect(loaded?.rateSettings.otRate).toBe(20);
    expect(loaded?.rateSettings.standardHours).toBe(8);
  });
});

describe('saveInvoiceDraft', () => {
  it('persists the draft so it can be loaded back', () => {
    saveInvoiceDraft(makeDraft());
    expect(store[STORAGE_KEY]).toBeTruthy();
    expect(loadInvoiceDraft()).not.toBeNull();
  });

  it('overwrites a previously saved draft', () => {
    saveInvoiceDraft(makeDraft({ invoiceNumber: 'JAN/001' }));
    saveInvoiceDraft(makeDraft({ invoiceNumber: 'FEB/002' }));
    expect(loadInvoiceDraft()?.invoiceNumber).toBe('FEB/002');
  });
});

describe('clearInvoiceDraft', () => {
  it('removes the stored draft', () => {
    saveInvoiceDraft(makeDraft());
    clearInvoiceDraft();
    expect(loadInvoiceDraft()).toBeNull();
  });

  it('is a no-op when no draft is stored', () => {
    expect(() => clearInvoiceDraft()).not.toThrow();
  });
});
