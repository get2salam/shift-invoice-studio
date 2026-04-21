'use client';

import React from 'react';
import { AlertTriangle, Info, ListOrdered } from 'lucide-react';
import { ShiftEntry } from '@/lib/types';
import { getShiftValidationIssues } from '@/lib/validations';

interface ValidationPanelProps {
  shifts: ShiftEntry[];
  onSortByDate: () => void;
}

export default function ValidationPanel({ shifts, onSortByDate }: ValidationPanelProps) {
  const issues = getShiftValidationIssues(shifts);
  if (!issues.length) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-800">Shift checks look clean</p>
          <p className="text-sm text-green-700">Dates, durations, and descriptions all look healthy.</p>
        </div>
        <button onClick={onSortByDate} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-100">
          <ListOrdered className="w-4 h-4" />Sort by date
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-900">Review before export</p>
          <p className="text-sm text-amber-800">I found {issues.length} thing{issues.length === 1 ? '' : 's'} worth checking.</p>
        </div>
        <button onClick={onSortByDate} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-100">
          <ListOrdered className="w-4 h-4" />Sort by date
        </button>
      </div>
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div key={`${issue.level}-${index}`} className="flex items-start gap-2 text-sm text-amber-900">
            {issue.level === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <Info className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
