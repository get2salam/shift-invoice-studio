import * as XLSX from 'xlsx';
import { InvoiceData } from './types';
import { formatCurrency, formatDate } from './calculations';
import { neutralizeSpreadsheetFormula } from './spreadsheet-safety';

function safeCell(value: string): string {
  return neutralizeSpreadsheetFormula(value);
}

export function generateInvoiceExcel(data: InvoiceData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const wsData: (string | number | null)[][] = [];
  const { companyDetails, clientDetails, rateSettings } = data;

  wsData.push(['', safeCell(companyDetails.name), '', '', '', '', '', 'INVOICE', '']);
  wsData.push(['', safeCell(companyDetails.tagline), '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'FROM', '', '', '', '', 'Invoice No.', '', safeCell(data.invoiceNumber)]);
  wsData.push(['', safeCell(`${companyDetails.address}, ${companyDetails.city}, ${companyDetails.postcode}`), '', '', '', '', 'Date', '', safeCell(formatDate(data.invoiceDate))]);
  wsData.push(['', safeCell(`${companyDetails.phone} | ${companyDetails.email}`), '', '', '', '', 'Due Date', '', safeCell(data.dueDate)]);
  wsData.push(['', safeCell(`${companyDetails.taxLabel}# ${companyDetails.taxNumber}`), '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'BILL TO', '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(clientDetails.name), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(clientDetails.contactName), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(clientDetails.email), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`${clientDetails.address}, ${clientDetails.city}, ${clientDetails.postcode}`), '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'DESCRIPTION', 'DATE', 'START', 'END', 'HRS', 'OT HRS', 'RATE', 'AMOUNT']);

  for (const shift of data.shifts) {
    wsData.push(['', safeCell(shift.description), safeCell(formatDate(shift.date)), safeCell(shift.startTime), safeCell(shift.endTime), shift.hours, shift.otHours, shift.rate, shift.amount]);
  }

  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`* Overtime: Hours beyond ${rateSettings.standardHours}hrs @ ${formatCurrency(rateSettings.otRate, rateSettings.currencySymbol)}/hr`), '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', `Daily Total (${data.shifts.length} days)`, '', data.dailyTotal]);
  wsData.push(['', '', '', '', '', '', `OT Total (${data.otHoursTotal} hrs)`, '', data.otTotal]);
  wsData.push(['', '', '', '', '', '', 'Tax (0%)', '', data.tax]);
  wsData.push(['', '', '', '', '', 'TOTAL DUE', '', '', data.grandTotal]);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'PAYMENT DETAILS', '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`Bank: ${companyDetails.bankName}`), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`Account Name: ${companyDetails.accountName}`), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`Account Number: ${companyDetails.accountNumber}`), '', '', '', '', '', '', '']);
  wsData.push(['', safeCell(`Sort Code: ${companyDetails.sortCode}`), '', '', '', '', '', '', '']);

  if (data.notes) {
    wsData.push(['', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'NOTES', '', '', '', '', '', '', '']);
    wsData.push(['', safeCell(data.notes), '', '', '', '', '', '', '']);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 3 }, { wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
  return wb;
}

export function downloadExcel(data: InvoiceData, filename: string): void {
  const wb = generateInvoiceExcel(data);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
