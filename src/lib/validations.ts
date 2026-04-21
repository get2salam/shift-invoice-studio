import { ShiftEntry } from './types';
import { calculateHours } from './calculations';

export interface ShiftValidationIssue {
  level: 'warning' | 'info';
  message: string;
}

export function sortShiftsByDate(shifts: ShiftEntry[]): ShiftEntry[] {
  return [...shifts].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getShiftValidationIssues(shifts: ShiftEntry[]): ShiftValidationIssue[] {
  const issues: ShiftValidationIssue[] = [];
  if (!shifts.length) return issues;

  const duplicateDates = new Map<string, number>();
  shifts.forEach((shift) => {
    duplicateDates.set(shift.date, (duplicateDates.get(shift.date) || 0) + 1);
  });

  duplicateDates.forEach((count, date) => {
    if (count > 1) {
      issues.push({ level: 'info', message: `${count} shifts share ${date}. Double-check if that is intentional.` });
    }
  });

  shifts.forEach((shift) => {
    const computedHours = calculateHours(shift.startTime, shift.endTime);
    if (computedHours <= 0) {
      issues.push({ level: 'warning', message: `${shift.description} on ${shift.date} has an end time before or equal to the start time.` });
    }
    if (shift.hours > 16) {
      issues.push({ level: 'warning', message: `${shift.description} on ${shift.date} is longer than 16 hours. Check for OCR mistakes.` });
    }
    if (!shift.description.trim()) {
      issues.push({ level: 'warning', message: `A shift on ${shift.date} is missing a description.` });
    }
  });

  const sorted = sortShiftsByDate(shifts);
  const isOutOfOrder = sorted.some((shift, index) => shift.id !== shifts[index]?.id);
  if (isOutOfOrder) {
    issues.push({ level: 'info', message: 'Shifts are not sorted by date yet. Sorting makes exports easier to review.' });
  }

  return issues;
}
