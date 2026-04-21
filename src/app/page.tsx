'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Eye, FileDown, FileSpreadsheet, PenLine, RefreshCw, Upload, CheckCircle, TableProperties } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import ShiftEditor from '@/components/ShiftEditor';
import InvoicePreview from '@/components/InvoicePreview';
import InvoiceSettings from '@/components/InvoiceSettings';
import SummaryCards from '@/components/SummaryCards';
import ValidationPanel from '@/components/ValidationPanel';
import {
  ClientDetails,
  CompanyDetails,
  DEFAULT_CLIENT_DETAILS,
  DEFAULT_COMPANY_DETAILS,
  DEFAULT_RATE_SETTINGS,
  InvoiceData,
  RateSettings,
  ShiftEntry,
} from '@/lib/types';
import {
  calculateInvoiceTotals,
  createShiftEntry,
  generateInvoiceNumber,
  recalculateShiftCollection,
} from '@/lib/calculations';
import { parseTimesheetText, cleanOCRText } from '@/lib/ocr-parser';
import { downloadPDF } from '@/lib/pdf-generator';
import { downloadExcel } from '@/lib/excel-generator';
import { downloadCsv } from '@/lib/csv-generator';
import { clearInvoiceDraft, loadInvoiceDraft, saveInvoiceDraft } from '@/lib/storage';
import { sortShiftsByDate } from '@/lib/validations';

export default function Home() {
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateInvoiceNumber(1));
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('Upon Receipt');
  const [notes, setNotes] = useState('');
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(DEFAULT_COMPANY_DETAILS);
  const [clientDetails, setClientDetails] = useState<ClientDetails>(DEFAULT_CLIENT_DETAILS);
  const [rateSettings, setRateSettings] = useState<RateSettings>(DEFAULT_RATE_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [roundHours, setRoundHours] = useState(true);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const totals = calculateInvoiceTotals(shifts, rateSettings);
  const invoiceData: InvoiceData = {
    invoiceNumber,
    invoiceDate,
    dueDate,
    notes,
    shifts,
    ...totals,
    tax: 0,
    companyDetails,
    clientDetails,
    rateSettings,
  };

  const loadTesseract = useCallback(async () => {
    if (typeof window !== 'undefined' && !tesseractLoaded) {
      try {
        const Tesseract = await import('tesseract.js');
        (window as any).Tesseract = Tesseract;
        setTesseractLoaded(true);
      } catch (error) {
        console.error('Failed to load Tesseract:', error);
      }
    }
  }, [tesseractLoaded]);

  useEffect(() => {
    loadTesseract();
  }, [loadTesseract]);

  useEffect(() => {
    const draft = loadInvoiceDraft();
    if (draft) {
      setInvoiceNumber(draft.invoiceNumber);
      setInvoiceDate(draft.invoiceDate);
      setDueDate(draft.dueDate);
      setNotes(draft.notes);
      setRoundHours(draft.roundHours);
      setShifts(draft.shifts);
      setCompanyDetails(draft.companyDetails);
      setClientDetails(draft.clientDetails);
      setRateSettings(draft.rateSettings);
    }
    setDraftHydrated(true);
  }, []);

  useEffect(() => {
    if (!shifts.length) return;
    setShifts((current) => recalculateShiftCollection(current, roundHours, rateSettings));
  }, [rateSettings]);

  useEffect(() => {
    if (!draftHydrated) return;
    saveInvoiceDraft({
      invoiceNumber,
      invoiceDate,
      dueDate,
      notes,
      roundHours,
      shifts,
      companyDetails,
      clientDetails,
      rateSettings,
    });
  }, [draftHydrated, invoiceNumber, invoiceDate, dueDate, notes, roundHours, shifts, companyDetails, clientDetails, rateSettings]);

  const processTimesheet = async (file: File) => {
    setIsProcessing(true);
    setOcrStatus('loading');
    try {
      if (!tesseractLoaded) await loadTesseract();
      const Tesseract = (window as any).Tesseract || await import('tesseract.js');
      const imageUrl = URL.createObjectURL(file);
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (message: { status: string; progress: number }) => {
          if (message.status === 'recognizing text') {
            console.log(`OCR: ${Math.round(message.progress * 100)}%`);
          }
        },
      });
      const parsed = parseTimesheetText(cleanOCRText(result.data.text));
      if (parsed.shifts.length > 0) {
        const nextShifts = recalculateShiftCollection(
          parsed.shifts.map((shift) => ({ ...shift, description: rateSettings.defaultShiftDescription })),
          roundHours,
          rateSettings,
        );
        setShifts(nextShifts);
        setOcrStatus('success');
      } else {
        setOcrStatus('error');
        startManualEntry();
      }
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      setOcrStatus('error');
      startManualEntry();
    } finally {
      setIsProcessing(false);
    }
  };

  const startManualEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    setShifts([
      createShiftEntry(rateSettings.defaultShiftDescription, today, '06:00', '18:00', roundHours, rateSettings),
    ]);
    setOcrStatus('idle');
  };

  const handleDownloadPDF = () => downloadPDF(invoiceData, `invoice_${invoiceNumber.replace('/', '_')}`);
  const handleDownloadExcel = () => downloadExcel(invoiceData, `invoice_${invoiceNumber.replace('/', '_')}`);
  const handleDownloadCsv = () => downloadCsv(invoiceData, `invoice_${invoiceNumber.replace('/', '_')}`);
  const handleSortShifts = () => setShifts((current) => sortShiftsByDate(current));
  const handleReset = () => {
    setShifts([]);
    setShowPreview(false);
    setOcrStatus('idle');
    clearInvoiceDraft();
  };
  const hasShifts = shifts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-royal-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Shift Invoice Studio</h1>
              <p className="text-light-blue text-sm mt-1">Turn work logs into clean, client-ready invoices in minutes</p>
            </div>
            {hasShifts && (
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                <RefreshCw className="w-4 h-4" />Start Over
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!hasShifts ? (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-light-blue rounded-full mb-4"><Upload className="w-8 h-8 text-medium-blue" /></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload a timesheet or build one manually</h2>
              <p className="text-gray-600">Perfect for contractors, site supervisors, and warehouse teams.</p>
            </div>
            <FileUploader onFileSelect={processTimesheet} isProcessing={isProcessing} />

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 text-gray-500">OR</span></div>
              </div>
              <button onClick={startManualEntry} className="mt-6 flex items-center justify-center gap-2 w-full px-6 py-3 text-medium-blue font-medium border-2 border-medium-blue rounded-xl hover:bg-light-blue transition-colors">
                <PenLine className="w-5 h-5" />
                Enter shifts manually
              </button>
              <p className="mt-2 text-sm text-gray-500">Great when you already know the dates and hours</p>
            </div>

            {ocrStatus === 'error' && <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800"><strong>Note:</strong> Could not detect shifts automatically. Please enter them manually.</p></div>}
          </div>
        ) : (
          <div className="space-y-6">
            {ocrStatus === 'success' && <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /><p className="text-sm text-green-800">Extracted {shifts.length} shift(s). Review and tailor before exporting.</p></div>}
            <InvoiceSettings
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              notes={notes}
              companyDetails={companyDetails}
              clientDetails={clientDetails}
              rateSettings={rateSettings}
              onInvoiceNumberChange={setInvoiceNumber}
              onInvoiceDateChange={setInvoiceDate}
              onDueDateChange={setDueDate}
              onNotesChange={setNotes}
              onCompanyDetailsChange={setCompanyDetails}
              onClientDetailsChange={setClientDetails}
              onRateSettingsChange={setRateSettings}
            />
            <ShiftEditor shifts={shifts} rateSettings={rateSettings} onShiftsChange={setShifts} roundHours={roundHours} onRoundHoursChange={setRoundHours} />
            <ValidationPanel shifts={shifts} onSortByDate={handleSortShifts} />
            <SummaryCards shifts={shifts} currencySymbol={rateSettings.currencySymbol} grandTotal={invoiceData.grandTotal} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div><span className="text-gray-500">Days:</span><span className="ml-2 font-semibold">{shifts.length}</span></div>
                  <div><span className="text-gray-500">Daily:</span><span className="ml-2 font-semibold">{rateSettings.currencySymbol}{invoiceData.dailyTotal.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">OT ({invoiceData.otHoursTotal}hrs):</span><span className="ml-2 font-semibold">{rateSettings.currencySymbol}{invoiceData.otTotal.toFixed(2)}</span></div>
                  <div className="text-lg"><span className="text-gray-500">Total:</span><span className="ml-2 font-bold text-royal-blue">{rateSettings.currencySymbol}{invoiceData.grandTotal.toFixed(2)}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"><Eye className="w-4 h-4" />{showPreview ? 'Hide' : 'Preview'}</button>
                  <button onClick={handleDownloadCsv} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700"><TableProperties className="w-4 h-4" />CSV</button>
                  <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"><FileSpreadsheet className="w-4 h-4" />Excel</button>
                  <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-medium-blue rounded-lg hover:bg-royal-blue"><FileDown className="w-4 h-4" />PDF</button>
                </div>
              </div>
            </div>
            {showPreview && <InvoicePreview data={invoiceData} />}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">Shift Invoice Studio • A contractor-friendly invoicing workflow</footer>
    </div>
  );
}
