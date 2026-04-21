import { describe, it, expect } from 'vitest';
import { parseTimesheetText, cleanOCRText } from '../src/lib/ocr-parser';

describe('parseTimesheetText', () => {
  it('parses date and time entries from OCR text', () => {
    const text = `
      CANDIDATE NAME: John Smith
      01/01/2024 08:00 18:00
      02/01/2024 07:30 17:30
    `;

    const result = parseTimesheetText(text);

    expect(result.shifts.length).toBe(2);
    expect(result.shifts[0].startTime).toBe('08:00');
    expect(result.shifts[0].endTime).toBe('18:00');
    expect(result.shifts[1].startTime).toBe('07:30');
    expect(result.shifts[1].endTime).toBe('17:30');
  });

  it('extracts candidate name', () => {
    const text = 'CANDIDATE NAME: Jane Doe  WORK LOCATION: Site A';
    const result = parseTimesheetText(text);
    expect(result.candidateName).toBe('Jane Doe');
  });

  it('returns empty shifts for unparseable text', () => {
    const result = parseTimesheetText('no valid data here');
    expect(result.shifts).toHaveLength(0);
  });

  it('sorts shifts by date', () => {
    const text = `
      15/03/2024 08:00 16:00
      10/03/2024 09:00 17:00
      12/03/2024 07:00 15:00
    `;

    const result = parseTimesheetText(text);

    expect(result.shifts.length).toBe(3);
    expect(result.shifts[0].date).toBe('2024-03-10');
    expect(result.shifts[1].date).toBe('2024-03-12');
    expect(result.shifts[2].date).toBe('2024-03-15');
  });

  it('handles dates with 2-digit years', () => {
    const text = '05/06/24 08:00 17:00';
    const result = parseTimesheetText(text);

    expect(result.shifts.length).toBe(1);
    expect(result.shifts[0].date).toBe('2024-06-05');
  });

  it('preserves raw text', () => {
    const text = 'Some raw OCR output';
    const result = parseTimesheetText(text);
    expect(result.rawText).toBe(text);
  });

  it('handles dot-separated times', () => {
    const text = '01/01/2024 08.00 17.30';
    const result = parseTimesheetText(text);

    expect(result.shifts.length).toBe(1);
    expect(result.shifts[0].startTime).toBe('08:00');
    expect(result.shifts[0].endTime).toBe('17:30');
  });
});

describe('cleanOCRText', () => {
  it('removes pipe characters', () => {
    expect(cleanOCRText('hello | world')).toBe('hello world');
  });

  it('collapses multiple spaces', () => {
    expect(cleanOCRText('hello    world')).toBe('hello world');
  });

  it('corrects common OCR misreads', () => {
    expect(cleanOCRText('o8:00')).toBe('08:00');
    expect(cleanOCRText('l5:30')).toBe('15:30');
    expect(cleanOCRText('I2:00')).toBe('12:00');
  });

  it('trims whitespace', () => {
    expect(cleanOCRText('  hello  ')).toBe('hello');
  });
});
