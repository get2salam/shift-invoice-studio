export interface ShiftEntry {
  id: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  otHours: number;
  rate: number;
  amount: number;
}

export interface CompanyDetails {
  name: string;
  tagline: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  taxLabel: string;
  taxNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
}

export interface ClientDetails {
  name: string;
  contactName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
}

export interface RateSettings {
  currencySymbol: string;
  dailyRate: number;
  otRate: number;
  standardHours: number;
  defaultShiftDescription: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  shifts: ShiftEntry[];
  dailyTotal: number;
  otTotal: number;
  otHoursTotal: number;
  tax: number;
  grandTotal: number;
  companyDetails: CompanyDetails;
  clientDetails: ClientDetails;
  rateSettings: RateSettings;
}

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  name: 'Northline Contracting Ltd',
  tagline: 'Independent contractor invoicing',
  address: '14 Kingsway Business Park',
  city: 'Manchester',
  postcode: 'M1 4BT',
  phone: '0161 555 0199',
  email: 'accounts@northline.example',
  taxLabel: 'UTR',
  taxNumber: '0000000000',
  bankName: 'Monzo Business',
  accountName: 'Northline Contracting Ltd',
  accountNumber: '12345678',
  sortCode: '04-00-04',
};

export const DEFAULT_CLIENT_DETAILS: ClientDetails = {
  name: 'Riverstone Warehousing Group',
  contactName: 'Site Accounts Team',
  email: 'payables@riverstone.example',
  address: '88 Dockside Way',
  city: 'Birmingham',
  postcode: 'B5 6PP',
};

export const DEFAULT_RATE_SETTINGS: RateSettings = {
  currencySymbol: '£',
  dailyRate: 140,
  otRate: 14,
  standardHours: 10,
  defaultShiftDescription: 'Day shift',
};

export const COMPANY_DETAILS = DEFAULT_COMPANY_DETAILS;
export const CLIENT_DETAILS = DEFAULT_CLIENT_DETAILS;
export const RATES = DEFAULT_RATE_SETTINGS;
