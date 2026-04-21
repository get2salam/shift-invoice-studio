'use client';

import React from 'react';
import { Building2, Calendar, FileText, Hash, Landmark, Receipt, UserRound } from 'lucide-react';
import { ClientDetails, CompanyDetails, RateSettings } from '@/lib/types';

interface InvoiceSettingsProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  companyDetails: CompanyDetails;
  clientDetails: ClientDetails;
  rateSettings: RateSettings;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCompanyDetailsChange: (value: CompanyDetails) => void;
  onClientDetailsChange: (value: ClientDetails) => void;
  onRateSettingsChange: (value: RateSettings) => void;
}

const sectionTitleClass = 'font-semibold text-gray-800 flex items-center gap-2 mb-4';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue';

export default function InvoiceSettings({
  invoiceNumber,
  invoiceDate,
  dueDate,
  notes,
  companyDetails,
  clientDetails,
  rateSettings,
  onInvoiceNumberChange,
  onInvoiceDateChange,
  onDueDateChange,
  onNotesChange,
  onCompanyDetailsChange,
  onClientDetailsChange,
  onRateSettingsChange,
}: InvoiceSettingsProps) {
  const updateCompany = <K extends keyof CompanyDetails>(field: K, value: CompanyDetails[K]) => {
    onCompanyDetailsChange({ ...companyDetails, [field]: value });
  };

  const updateClient = <K extends keyof ClientDetails>(field: K, value: ClientDetails[K]) => {
    onClientDetailsChange({ ...clientDetails, [field]: value });
  };

  const updateRates = <K extends keyof RateSettings>(field: K, value: RateSettings[K]) => {
    onRateSettingsChange({ ...rateSettings, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className={sectionTitleClass}>
          <FileText className="w-5 h-5 text-medium-blue" />
          Invoice basics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Invoice Number
              </span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              placeholder="APR/001"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Invoice Date
              </span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Due date / payment terms</label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              placeholder="Net 7 days"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Invoice notes</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Optional handoff notes, payment reminders, or thank-you message"
              rows={4}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className={sectionTitleClass}>
          <Receipt className="w-5 h-5 text-medium-blue" />
          Rates & defaults
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Currency symbol</label>
            <input
              type="text"
              value={rateSettings.currencySymbol}
              onChange={(e) => updateRates('currencySymbol', e.target.value || '£')}
              className={inputClass}
              maxLength={3}
            />
          </div>
          <div>
            <label className={labelClass}>Default shift label</label>
            <input
              type="text"
              value={rateSettings.defaultShiftDescription}
              onChange={(e) => updateRates('defaultShiftDescription', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Daily rate</label>
            <input
              type="number"
              min="0"
              step="1"
              value={rateSettings.dailyRate}
              onChange={(e) => updateRates('dailyRate', Number(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Overtime rate</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={rateSettings.otRate}
              onChange={(e) => updateRates('otRate', Number(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Standard hours before OT</label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={rateSettings.standardHours}
              onChange={(e) => updateRates('standardHours', Number(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className={sectionTitleClass}>
          <Building2 className="w-5 h-5 text-medium-blue" />
          From details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Business name</label>
            <input type="text" value={companyDetails.name} onChange={(e) => updateCompany('name', e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Tagline</label>
            <input type="text" value={companyDetails.tagline} onChange={(e) => updateCompany('tagline', e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input type="text" value={companyDetails.address} onChange={(e) => updateCompany('address', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input type="text" value={companyDetails.city} onChange={(e) => updateCompany('city', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Postcode</label>
            <input type="text" value={companyDetails.postcode} onChange={(e) => updateCompany('postcode', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" value={companyDetails.phone} onChange={(e) => updateCompany('phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={companyDetails.email} onChange={(e) => updateCompany('email', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tax label</label>
            <input type="text" value={companyDetails.taxLabel} onChange={(e) => updateCompany('taxLabel', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tax number</label>
            <input type="text" value={companyDetails.taxNumber} onChange={(e) => updateCompany('taxNumber', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className={sectionTitleClass}>
            <UserRound className="w-5 h-5 text-medium-blue" />
            Bill to details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Client name</label>
              <input type="text" value={clientDetails.name} onChange={(e) => updateClient('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact</label>
              <input type="text" value={clientDetails.contactName} onChange={(e) => updateClient('contactName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={clientDetails.email} onChange={(e) => updateClient('email', e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input type="text" value={clientDetails.address} onChange={(e) => updateClient('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={clientDetails.city} onChange={(e) => updateClient('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Postcode</label>
              <input type="text" value={clientDetails.postcode} onChange={(e) => updateClient('postcode', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className={sectionTitleClass}>
            <Landmark className="w-5 h-5 text-medium-blue" />
            Payment details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bank name</label>
              <input type="text" value={companyDetails.bankName} onChange={(e) => updateCompany('bankName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Account name</label>
              <input type="text" value={companyDetails.accountName} onChange={(e) => updateCompany('accountName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Account number</label>
              <input type="text" value={companyDetails.accountNumber} onChange={(e) => updateCompany('accountNumber', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sort code</label>
              <input type="text" value={companyDetails.sortCode} onChange={(e) => updateCompany('sortCode', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
