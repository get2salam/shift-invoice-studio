import * as XLSX from 'xlsx';
import { InvoiceData } from './types';
import { formatCurrency, formatDate } from './calculations';

export function generateInvoiceExcel(data: InvoiceData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const wsData: (string | number | null)[][] = [];
  const { companyDetails, clientDetails, rateSettings } = data;

  wsData.push(['', companyDetails.name, '', '', '', '', '', 'INVOICE', '']);
  wsData.push(['', companyDetails.tagline, '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'FROM', '', '', '', '', 'Invoice No.', '', data.invoiceNumber]);
  wsData.push(['', `${companyDetails.address}, ${companyDetails.city}, ${companyDetails.postcode}`, '', '', '', '', 'Date', '', formatDate(data.invoiceDate)]);
  wsData.push(['', `${companyDetails.phone} | ${companyDetails.email}`, '', '', '', '', 'Due Date', '', data.dueDate]);
  wsData.push(['', `${companyDetails.taxLabel}# ${companyDetails.taxNumber}`, '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'BILL TO', '', '', '', '', '', '', '']);
  wsData.push(['', clientDetails.name, '', '', '', '', '', '', '']);
  wsData.push(['', clientDetails.contactName, '', '', '', '', '', '', '']);
  wsData.push(['', clientDetails.email, '', '', '', '', '', '', '']);
  wsData.push(['', `${clientDetails.address}, ${clientDetails.city}, ${clientDetails.postcode}`, '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'DESCRIPTION', 'DATE', 'START', 'END', 'HRS', 'OT HRS', 'RATE', 'AMOUNT']);

  for (const shift of data.shifts) {
    wsData.push(['', shift.description, formatDate(shift.date), shift.startTime, shift.endTime, shift.hours, shift.otHours, shift.rate, shift.amount]);
  }

  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', `* Overtime: Hours beyond ${rateSettings.standardHours}hrs @ ${formatCurrency(rateSettings.otRate, rateSettings.currencySymbol)}/hr`, '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', `Daily Total (${data.shifts.length} days)`, '', data.dailyTotal]);
  wsData.push(['', '', '', '', '', '', `OT Total (${data.otHoursTotal} hrs)`, '', data.otTotal]);
  wsData.push(['', '', '', '', '', '', 'Tax (0%)', '', data.tax]);
  wsData.push(['', '', '', '', '', 'TOTAL DUE', '', '', data.grandTotal]);
  wsData.push(['', '', '', '', '', '', '', '', '']);
  wsData.push(['', 'PAYMENT DETAILS', '', '', '', '', '', '', '']);
  wsData.push(['', `Bank: ${companyDetails.bankName}`, '', '', '', '', '', '', '']);
  wsData.push(['', `Account Name: ${companyDetails.accountName}`, '', '', '', '', '', '', '']);
  wsData.push(['', `Account Number: ${companyDetails.accountNumber}`, '', '', '', '', '', '', '']);
  wsData.push(['', `Sort Code: ${companyDetails.sortCode}`, '', '', '', '', '', '', '']);

  if (data.notes) {
    wsData.push(['', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'NOTES', '', '', '', '', '', '', '']);
    wsData.push(['', data.notes, '', '', '', '', '', '', '']);
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
