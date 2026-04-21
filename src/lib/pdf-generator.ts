import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from './types';
import { formatCurrency, formatDate } from './calculations';

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const { companyDetails, clientDetails, rateSettings } = data;

  const royalBlue: [number, number, number] = [30, 58, 138];
  const mediumBlue: [number, number, number] = [59, 130, 246];
  const charcoal: [number, number, number] = [55, 65, 81];
  const mediumGray: [number, number, number] = [107, 114, 128];
  const lightBlue: [number, number, number] = [219, 234, 254];

  doc.setFillColor(...royalBlue);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(companyDetails.name, margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...lightBlue);
  doc.text(companyDetails.tagline, margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - margin, 17, { align: 'right' });

  let yPos = 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...mediumBlue);
  doc.text('FROM', margin, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...charcoal);
  doc.text(`${companyDetails.address}, ${companyDetails.city}, ${companyDetails.postcode}`, margin, yPos + 5);
  doc.text(`${companyDetails.phone} | ${companyDetails.email}`, margin, yPos + 9);
  doc.text(`${companyDetails.taxLabel}# ${companyDetails.taxNumber}`, margin, yPos + 13);

  const boxX = pageWidth - margin - 60;
  doc.setFillColor(...lightBlue);
  doc.roundedRect(boxX, 38, 60, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...royalBlue);
  doc.text('Invoice No.', boxX + 3, 44);
  doc.text('Date', boxX + 3, 50);
  doc.text('Due Date', boxX + 3, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...charcoal);
  doc.text(data.invoiceNumber, boxX + 57, 44, { align: 'right' });
  doc.text(formatDate(data.invoiceDate), boxX + 57, 50, { align: 'right' });
  doc.text(data.dueDate, boxX + 57, 56, { align: 'right' });

  yPos = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...mediumBlue);
  doc.text('BILL TO', margin, yPos);

  doc.setTextColor(...charcoal);
  doc.setFontSize(10);
  doc.text(clientDetails.name, margin, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(clientDetails.contactName, margin, yPos + 10);
  doc.text(clientDetails.email, margin, yPos + 14);
  doc.text(`${clientDetails.address}, ${clientDetails.city}, ${clientDetails.postcode}`, margin, yPos + 18);

  const tableData = data.shifts.map((shift) => [
    shift.description,
    formatDate(shift.date),
    shift.startTime,
    shift.endTime,
    shift.hours.toString(),
    shift.otHours.toString(),
    formatCurrency(shift.rate, rateSettings.currencySymbol),
    formatCurrency(shift.amount, rateSettings.currencySymbol),
  ]);

  autoTable(doc, {
    startY: 98,
    head: [['DESCRIPTION', 'DATE', 'START', 'END', 'HRS', 'OT HRS', 'RATE', 'AMOUNT']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: mediumBlue, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8, textColor: charcoal },
    columnStyles: {
      0: { halign: 'left', cellWidth: 25 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'right', cellWidth: 22 },
    },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    theme: 'plain',
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...mediumGray);
  doc.text(`* Overtime: Hours beyond ${rateSettings.standardHours}hrs @ ${formatCurrency(rateSettings.otRate, rateSettings.currencySymbol)}/hr`, margin, finalY);

  const totalsX = pageWidth - margin - 70;
  const totalsY = finalY + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mediumGray);
  doc.text(`Daily Total (${data.shifts.length} days)`, totalsX, totalsY);
  doc.setTextColor(...charcoal);
  doc.text(formatCurrency(data.dailyTotal, rateSettings.currencySymbol), pageWidth - margin, totalsY, { align: 'right' });

  doc.setTextColor(...mediumGray);
  doc.text(`OT Total (${data.otHoursTotal} hrs)`, totalsX, totalsY + 5);
  doc.setTextColor(...charcoal);
  doc.text(formatCurrency(data.otTotal, rateSettings.currencySymbol), pageWidth - margin, totalsY + 5, { align: 'right' });

  doc.setTextColor(...mediumGray);
  doc.text('Tax (0%)', totalsX, totalsY + 10);
  doc.setTextColor(...charcoal);
  doc.text(formatCurrency(data.tax, rateSettings.currencySymbol), pageWidth - margin, totalsY + 10, { align: 'right' });

  doc.setFillColor(...royalBlue);
  doc.roundedRect(pageWidth - margin - 75, totalsY + 13, 75, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DUE', pageWidth - margin - 70, totalsY + 21);
  doc.setFontSize(14);
  doc.text(formatCurrency(data.grandTotal, rateSettings.currencySymbol), pageWidth - margin - 3, totalsY + 21, { align: 'right' });

  const paymentY = totalsY + 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mediumBlue);
  doc.text('PAYMENT DETAILS', margin, paymentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text('Please make payment to:', margin, paymentY + 6);

  doc.setFontSize(8);
  doc.text(`Bank: ${companyDetails.bankName}`, margin, paymentY + 12);
  doc.text(`Account Name: ${companyDetails.accountName}`, margin, paymentY + 17);
  doc.text(`Account Number: ${companyDetails.accountNumber}`, margin, paymentY + 22);
  doc.text(`Sort Code: ${companyDetails.sortCode}`, margin, paymentY + 27);

  if (data.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('NOTES', margin, paymentY + 37);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...charcoal);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, paymentY + 42);
  }

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...royalBlue);
  const thanksY = data.notes ? paymentY + 52 : paymentY + 35;
  doc.text('Thank you for your business!', margin, thanksY);

  return doc;
}

export function downloadPDF(data: InvoiceData, filename: string): void {
  const doc = generateInvoicePDF(data);
  doc.save(`${filename}.pdf`);
}
