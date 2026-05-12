import { ShiftEntry } from './types';
import { calculateHours, parseTime } from './calculations';

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

  const intervalsByDate = new Map<string, { start: number; end: number; desc: string }[]>();
  shifts.forEach((shift) => {
    const start = parseTime(shift.startTime);
    const end = parseTime(shift.endTime);
    if (!start || !end) return;
    const startMin = start.hours * 60 + start.minutes;
    const endMin = end.hours * 60 + end.minutes;
    if (endMin <= startMin) return;
    const list = intervalsByDate.get(shift.date) ?? [];
    list.push({ start: startMin, end: endMin, desc: shift.description });
    intervalsByDate.set(shift.date, list);
  });

  intervalsByDate.forEach((daysShifts, date) => {
    if (daysShifts.length < 2) return;
    const sorted = [...daysShifts].sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        issues.push({
          level: 'warning',
          message: `Shifts on ${date} overlap: "${sorted[i - 1].desc}" and "${sorted[i].desc}".`,
        });
        return;
      }
    }
  });

  const sorted = sortShiftsByDate(shifts);
  const isOutOfOrder = sorted.some((shift, index) => shift.id !== shifts[index]?.id);
  if (isOutOfOrder) {
    issues.push({ level: 'info', message: 'Shifts are not sorted by date yet. Sorting makes exports easier to review.' });
  }

  return issues;
}
