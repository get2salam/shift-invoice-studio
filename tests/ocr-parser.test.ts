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

  it('rejects entries whose day or month components are out of range', () => {
    const text = `
      55/03/2024 08:00 17:00
      15/13/2024 08:00 17:00
      00/06/2024 09:00 17:00
      15/03/2024 09:00 17:00
    `;

    const result = parseTimesheetText(text);

    expect(result.shifts).toHaveLength(1);
    expect(result.shifts[0].date).toBe('2024-03-15');
  });

  it('rejects entries with out-of-range hour or minute components', () => {
    const text = `
      15/03/2024 25:00 17:00
      15/03/2024 08:60 17:00
      15/03/2024 08:00 24:00
      15/03/2024 08:00 17:99
      16/03/2024 08:00 17:00
    `;

    const result = parseTimesheetText(text);

    expect(result.shifts).toHaveLength(1);
    expect(result.shifts[0].date).toBe('2024-03-16');
  });

  it('parses lines that begin with a day-of-week prefix', () => {
    const text = `
      Mon 15/03/2024 08:00 17:00
      Tue 16/03/2024 09:30 18:30
    `;

    const result = parseTimesheetText(text);

    expect(result.shifts).toHaveLength(2);
    expect(result.shifts[0].date).toBe('2024-03-15');
    expect(result.shifts[0].startTime).toBe('08:00');
    expect(result.shifts[0].endTime).toBe('17:00');
    expect(result.shifts[1].date).toBe('2024-03-16');
    expect(result.shifts[1].startTime).toBe('09:30');
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

  it('corrects letter-for-digit misreads that follow a digit', () => {
    expect(cleanOCRText('1O:00')).toBe('10:00');
    expect(cleanOCRText('8O')).toBe('80');
    expect(cleanOCRText('1l:30')).toBe('11:30');
    expect(cleanOCRText('2I:45')).toBe('21:45');
  });

  it('leaves letters alone when not adjacent to a digit', () => {
    expect(cleanOCRText('Hello World')).toBe('Hello World');
    expect(cleanOCRText("O'Brien")).toBe("O'Brien");
  });

  it('trims whitespace', () => {
    expect(cleanOCRText('  hello  ')).toBe('hello');
  });
});
