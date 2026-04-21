'use client';

import React from 'react';
import { CalendarRange, Clock3, Coins, TrendingUp } from 'lucide-react';
import { ShiftEntry } from '@/lib/types';

interface SummaryCardsProps {
  shifts: ShiftEntry[];
  currencySymbol: string;
  grandTotal: number;
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(dateStr));
}

export default function SummaryCards({ shifts, currencySymbol, grandTotal }: SummaryCardsProps) {
  if (!shifts.length) return null;

  const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
  const totalHours = shifts.reduce((sum, shift) => sum + shift.hours, 0);
  const totalOtHours = shifts.reduce((sum, shift) => sum + shift.otHours, 0);
  const averagePerShift = grandTotal / shifts.length;
  const busiestShift = shifts.reduce((best, shift) => (shift.hours > best.hours ? shift : best), shifts[0]);
  const payPeriod = `${formatShortDate(sorted[0].date)} to ${formatShortDate(sorted[sorted.length - 1].date)}`;

  const cards = [
    {
      label: 'Pay period',
      value: payPeriod,
      helper: `${shifts.length} shifts logged`,
      icon: CalendarRange,
    },
    {
      label: 'Hours worked',
      value: `${totalHours.toFixed(1)}h`,
      helper: `${totalOtHours.toFixed(1)}h overtime`,
      icon: Clock3,
    },
    {
      label: 'Projected total',
      value: `${currencySymbol}${grandTotal.toFixed(2)}`,
      helper: `${currencySymbol}${averagePerShift.toFixed(2)} average per shift`,
      icon: Coins,
    },
    {
      label: 'Busiest shift',
      value: formatShortDate(busiestShift.date),
      helper: `${busiestShift.hours.toFixed(1)}h ${busiestShift.description.toLowerCase()}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-2">{card.helper}</p>
              </div>
              <div className="p-2 rounded-lg bg-light-blue text-medium-blue">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
