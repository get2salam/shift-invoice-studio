import { ShiftEntry } from './types';
import { createShiftEntry } from './calculations';

interface ParsedTimesheet {
  candidateName: string;
  shifts: ShiftEntry[];
  rawText: string;
}

export function parseTimesheetText(text: string): ParsedTimesheet {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const shifts: ShiftEntry[] = [];
  let candidateName = '';

  const nameMatch = text.match(/CANDIDATE\s*NAME[:\s]*([A-Za-z\s]+?)(?:\s{2,}|WORK|EMAIL|$)/i);
  if (nameMatch) candidateName = nameMatch[1].trim();

  const dateTimePattern = /(\d{1,2})[\\\/](\d{1,2})(?:[\\\/](\d{2,4}))?\s*(\d{1,2})[:\.]?(\d{2})\s*(\d{1,2})[:\.]?(\d{2})/gi;
  const currentYear = new Date().getFullYear();
  const fullText = text.replace(/\n/g, ' ');
  let match;

  while ((match = dateTimePattern.exec(fullText)) !== null) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3] ? (match[3].length === 2 ? `20${match[3]}` : match[3]) : currentYear.toString();
    const startTime = `${match[4].padStart(2, '0')}:${match[5]}`;
    const endTime = `${match[6].padStart(2, '0')}:${match[7]}`;
    const dateStr = `${year}-${month}-${day}`;
    shifts.push(createShiftEntry('Shift', dateStr, startTime, endTime, true));
  }

  if (shifts.length === 0) {
    const dayPattern = /(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*(\d{1,2})[\\\/](\d{1,2})(?:[\\\/](\d{2,4}))?\s*(\d{1,2})[:\.]?(\d{2})\s*(\d{1,2})[:\.]?(\d{2})/gi;
    for (const line of lines) {
      const m = line.match(dayPattern);
      if (m) {
        const day = m[1].padStart(2, '0');
        const month = m[2].padStart(2, '0');
        const year = m[3] ? (m[3].length === 2 ? `20${m[3]}` : m[3]) : currentYear.toString();
        const startTime = `${m[4].padStart(2, '0')}:${m[5]}`;
        const endTime = `${m[6].padStart(2, '0')}:${m[7]}`;
        shifts.push(createShiftEntry('Shift', `${year}-${month}-${day}`, startTime, endTime, true));
      }
    }
  }

  shifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return { candidateName, shifts, rawText: text };
}

export function cleanOCRText(text: string): string {
  return text
    .replace(/[|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[oO](?=\d)/g, '0')
    .replace(/[lI](?=\d)/g, '1')
    .trim();
}
