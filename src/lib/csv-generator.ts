import { InvoiceData } from './types';

function escapeCsv(value: string | number): string {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function generateInvoiceCsv(data: InvoiceData): string {
  const { companyDetails, clientDetails, rateSettings } = data;
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
      `${rateSettings.currencySymbol}${shift.rate.toFixed(2)}`,
      `${rateSettings.currencySymbol}${shift.amount.toFixed(2)}`,
    ]),
    [],
    ['Daily Total', `${rateSettings.currencySymbol}${data.dailyTotal.toFixed(2)}`],
    ['OT Total', `${rateSettings.currencySymbol}${data.otTotal.toFixed(2)}`],
    ['Grand Total', `${rateSettings.currencySymbol}${data.grandTotal.toFixed(2)}`],
  ];

  if (data.notes) {
    rows.push([]);
    rows.push(['Notes', data.notes]);
  }

  return rows.map((row) => row.map((cell) => escapeCsv(cell ?? '')).join(',')).join('\n');
}

export function downloadCsv(data: InvoiceData, filename: string): void {
  const csv = generateInvoiceCsv(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
