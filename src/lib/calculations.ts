import { RateSettings, ShiftEntry, RATES } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/(\d{1,2})[:\.](\d{2})/);
  if (match) {
    return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
  }
  return null;
}

export function calculateHours(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (!start || !end) return 0;
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  const diffMinutes = endMinutes - startMinutes;
  return Math.round((diffMinutes / 60) * 100) / 100;
}

export function roundHoursToNearest(hours: number, nearest: number = 0.5): number {
  return Math.round(hours / nearest) * nearest;
}

export function calculateOvertimeHours(totalHours: number, rates: RateSettings = RATES): number {
  if (totalHours <= rates.standardHours) return 0;
  return totalHours - rates.standardHours;
}

export function calculateShiftAmount(hours: number, otHours: number, rates: RateSettings = RATES): number {
  const baseAmount = rates.dailyRate;
  const otAmount = otHours * rates.otRate;
  return baseAmount + otAmount;
}

export function recalculateShiftEntry(
  shift: ShiftEntry,
  roundHrs: boolean,
  rates: RateSettings = RATES,
): ShiftEntry {
  let hours = calculateHours(shift.startTime, shift.endTime);
  if (roundHrs) hours = roundHoursToNearest(hours, 0.5);
  const otHours = calculateOvertimeHours(hours, rates);
  const amount = calculateShiftAmount(hours, otHours, rates);
  return {
    ...shift,
    description: shift.description || rates.defaultShiftDescription,
    hours,
    otHours,
    rate: rates.dailyRate,
    amount,
  };
}

export function recalculateShiftCollection(
  shifts: ShiftEntry[],
  roundHrs: boolean,
  rates: RateSettings = RATES,
): ShiftEntry[] {
  return shifts.map((shift) => recalculateShiftEntry(shift, roundHrs, rates));
}

export function calculateInvoiceTotals(
  shifts: ShiftEntry[],
  rates: RateSettings = RATES,
): {
  dailyTotal: number;
  otHoursTotal: number;
  otTotal: number;
  grandTotal: number;
} {
  const dailyTotal = shifts.length * rates.dailyRate;
  const otHoursTotal = shifts.reduce((sum, shift) => sum + shift.otHours, 0);
  const otTotal = otHoursTotal * rates.otRate;
  const grandTotal = dailyTotal + otTotal;
  return { dailyTotal, otHoursTotal, otTotal, grandTotal };
}

export function createShiftEntry(
  description: string,
  date: string,
  startTime: string,
  endTime: string,
  roundHrs: boolean = true,
  rates: RateSettings = RATES,
): ShiftEntry {
  const shift: ShiftEntry = {
    id: generateId(),
    description: description || rates.defaultShiftDescription,
    date,
    startTime,
    endTime,
    hours: 0,
    otHours: 0,
    rate: rates.dailyRate,
    amount: 0,
  };
  return recalculateShiftEntry(shift, roundHrs, rates);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatCurrency(amount: number, symbol: string = RATES.currencySymbol): string {
  return `${symbol}${amount.toFixed(2)}`;
}

export function getCurrentMonthPrefix(): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[new Date().getMonth()];
}

export function generateInvoiceNumber(sequenceNumber: number = 1): string {
  return `${getCurrentMonthPrefix()}/${sequenceNumber.toString().padStart(3, '0')}`;
}
