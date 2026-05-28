import { ShiftEntry } from './types';
import { createShiftEntry } from './calculations';

interface ParsedTimesheet {
  candidateName: string;
  shifts: ShiftEntry[];
  rawText: string;
}

// OCR easily mistakes digits, so reject impossible dates rather than emitting
// shifts with bogus values like 2024-77-55 that later code will treat as real.
function buildShiftFromMatch(match: RegExpMatchArray, currentYear: number): ShiftEntry | null {
  const dayNum = parseInt(match[1], 10);
  const monthNum = parseInt(match[2], 10);
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null;

  const startHour = parseInt(match[4], 10);
  const startMinute = parseInt(match[5], 10);
  const endHour = parseInt(match[6], 10);
  const endMinute = parseInt(match[7], 10);
  if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59) return null;

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3] ? (match[3].length === 2 ? `20${match[3]}` : match[3]) : currentYear.toString();
  const startTime = `${match[4].padStart(2, '0')}:${match[5]}`;
  const endTime = `${match[6].padStart(2, '0')}:${match[7]}`;
  return createShiftEntry('Shift', `${year}-${month}-${day}`, startTime, endTime, true);
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
    const shift = buildShiftFromMatch(match, currentYear);
    if (shift) shifts.push(shift);
  }

  if (shifts.length === 0) {
    // No /g flag: String.match with /g would discard capture groups, leaving m[1..7] undefined.
    const dayPattern = /(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*(\d{1,2})[\\\/](\d{1,2})(?:[\\\/](\d{2,4}))?\s*(\d{1,2})[:\.]?(\d{2})\s*(\d{1,2})[:\.]?(\d{2})/i;
    for (const line of lines) {
      const m = line.match(dayPattern);
      if (m) {
        const shift = buildShiftFromMatch(m, currentYear);
        if (shift) shifts.push(shift);
      }
    }
  }

  shifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return { candidateName, shifts, rawText: text };
}

export function cleanOCRText(text: string): string {
  // Replace whole runs of OCR-confusable letters so consecutive misreads (e.g.
  // "1OO:00") all get corrected; per-character lookarounds only fix the letter
  // touching the digit and leave the rest behind.
  return text
    .replace(/[|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[oOlI]+/g, (run, offset: number, full: string) => {
      const before = full[offset - 1] ?? '';
      const after = full[offset + run.length] ?? '';
      if (!/\d/.test(before) && !/\d/.test(after)) return run;
      return run.replace(/[oO]/g, '0').replace(/[lI]/g, '1');
    })
    .trim();
}
