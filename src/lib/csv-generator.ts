import { InvoiceData } from './types';
import { formatCurrency } from './calculations';

function escapeCsv(value: string | number): string {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function generateInvoiceCsv(data: InvoiceData): string {
  const { companyDetails, clientDetails, rateSettings } = data;
  const money = (amount: number) => formatCurrency(amount, rateSettings.currencySymbol);
  const rows: Array<Array<string | number>> = [
    ['Invoice Number', data.invoiceNumber],
    ['Invoice Date', data.invoiceDate],
    ['Due Date', data.dueDate],
    ['Company', companyDetails.name],
    ['Client', clientDetails.name],
    [],
    ['Description', 'Date', 'Start', 'End', 'Hours', 'OT Hours', 'Daily Rate', 'Amount'],
    ...data.shifts.map((shift) => [
      shift.description,
      shift.date,
      shift.startTime,
      shift.endTime,
      shift.hours,
      shift.otHours,
      money(shift.rate),
      money(shift.amount),
    ]),
    [],
    ['Daily Total', money(data.dailyTotal)],
    ['OT Hours Total', data.otHoursTotal],
    ['OT Total', money(data.otTotal)],
    ['Grand Total', money(data.grandTotal)],
  ];

  if (data.notes) {
    rows.push([]);
    rows.push(['Notes', data.notes]);
  }

  return rows.map((row) => row.map((cell) => escapeCsv(cell ?? '')).join(',')).join('\r\n');
}

// U+FEFF helps Excel detect UTF-8 so non-ASCII characters (e.g. £, €) render correctly.
const UTF8_BOM = '﻿';

export function downloadCsv(data: InvoiceData, filename: string): void {
  const csv = generateInvoiceCsv(data);
  const blob = new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
