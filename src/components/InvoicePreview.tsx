'use client';

import React from 'react';
import { InvoiceData } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/calculations';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  const { companyDetails, clientDetails, rateSettings } = data;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto">
      <div className="bg-royal-blue text-white p-6">
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl font-bold">{companyDetails.name}</h1>
            <p className="text-light-blue text-sm mt-1">{companyDetails.tagline}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">INVOICE</h2>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between mb-6 gap-6">
          <div>
            <p className="text-sm font-semibold text-medium-blue mb-1">FROM</p>
            <p className="text-sm text-gray-700 font-medium">{companyDetails.name}</p>
            <p className="text-sm text-gray-600">{companyDetails.address}, {companyDetails.city}, {companyDetails.postcode}</p>
            <p className="text-sm text-gray-600">{companyDetails.phone} | {companyDetails.email}</p>
            <p className="text-sm text-gray-600">{companyDetails.taxLabel}# {companyDetails.taxNumber}</p>
          </div>
          <div className="bg-light-blue rounded-lg p-4 text-sm min-w-56">
            <div className="flex justify-between gap-4 mb-1">
              <span className="font-semibold text-royal-blue">Invoice No.</span>
              <span className="text-gray-700">{data.invoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-4 mb-1">
              <span className="font-semibold text-royal-blue">Date</span>
              <span className="text-gray-700">{formatDate(data.invoiceDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-royal-blue">Due</span>
              <span className="text-gray-700">{data.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-medium-blue mb-1">BILL TO</p>
          <p className="font-semibold text-gray-800">{clientDetails.name}</p>
          <p className="text-sm text-gray-600">{clientDetails.contactName}</p>
          <p className="text-sm text-gray-600">{clientDetails.email}</p>
          <p className="text-sm text-gray-600">{clientDetails.address}, {clientDetails.city}, {clientDetails.postcode}</p>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-medium-blue text-white">
                <th className="px-2 py-2 text-left font-semibold">Description</th>
                <th className="px-2 py-2 text-center font-semibold">Date</th>
                <th className="px-2 py-2 text-center font-semibold">Start</th>
                <th className="px-2 py-2 text-center font-semibold">End</th>
                <th className="px-2 py-2 text-center font-semibold">Hrs</th>
                <th className="px-2 py-2 text-center font-semibold">OT</th>
                <th className="px-2 py-2 text-right font-semibold">Rate</th>
                <th className="px-2 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.shifts.map((shift, index) => (
                <tr key={shift.id} className={index % 2 === 1 ? 'bg-sky-blue' : ''}>
                  <td className="px-2 py-2 text-gray-700">{shift.description}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{formatDate(shift.date)}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{shift.startTime}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{shift.endTime}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{shift.hours}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{shift.otHours}</td>
                  <td className="px-2 py-2 text-right text-gray-700">{formatCurrency(shift.rate, rateSettings.currencySymbol)}</td>
                  <td className="px-2 py-2 text-right font-medium text-gray-800">{formatCurrency(shift.amount, rateSettings.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 italic mb-4">* Overtime (OT): Hours beyond {rateSettings.standardHours}hrs at {formatCurrency(rateSettings.otRate, rateSettings.currencySymbol)} per hour</p>
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Daily Total ({data.shifts.length} days)</span>
              <span className="text-gray-700">{formatCurrency(data.dailyTotal, rateSettings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">OT Total ({data.otHoursTotal} hrs)</span>
              <span className="text-gray-700">{formatCurrency(data.otTotal, rateSettings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Tax (0%)</span>
              <span className="text-gray-700">{formatCurrency(data.tax, rateSettings.currencySymbol)}</span>
            </div>
            <div className="bg-royal-blue text-white rounded-lg p-3 mt-2 flex justify-between items-center">
              <span className="font-semibold">TOTAL DUE</span>
              <span className="text-xl font-bold">{formatCurrency(data.grandTotal, rateSettings.currencySymbol)}</span>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-medium-blue mb-2">NOTES</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-medium-blue mb-2">PAYMENT DETAILS</p>
          <p className="text-sm text-gray-600 mb-2">Please make payment to:</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="mb-1"><span className="text-gray-500">Bank: </span><span className="text-gray-800 font-medium">{companyDetails.bankName}</span></p>
            <p className="mb-1"><span className="text-gray-500">Account Name: </span><span className="text-gray-800 font-medium">{companyDetails.accountName}</span></p>
            <p className="mb-1"><span className="text-gray-500">Account Number: </span><span className="text-gray-800 font-medium">{companyDetails.accountNumber}</span></p>
            <p><span className="text-gray-500">Sort Code: </span><span className="text-gray-800 font-medium">{companyDetails.sortCode}</span></p>
          </div>
          <p className="text-sm italic text-royal-blue mt-4">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
