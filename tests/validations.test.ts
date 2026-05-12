import { describe, expect, it } from 'vitest';
import { createShiftEntry } from '../src/lib/calculations';
import { getShiftValidationIssues, sortShiftsByDate } from '../src/lib/validations';

describe('sortShiftsByDate', () => {
  it('sorts by date and then by start time', () => {
    const shifts = [
      createShiftEntry('Late', '2024-05-02', '10:00', '18:00', false),
      createShiftEntry('Early', '2024-05-01', '08:00', '16:00', false),
      createShiftEntry('Mid', '2024-05-02', '06:00', '14:00', false),
    ];

    const sorted = sortShiftsByDate(shifts);

    expect(sorted.map((shift) => shift.description)).toEqual(['Early', 'Mid', 'Late']);
  });
});

describe('getShiftValidationIssues', () => {
  it('flags duplicate dates and out-of-order shifts', () => {
    const first = createShiftEntry('Morning shift', '2024-05-02', '08:00', '16:00', false);
    const second = createShiftEntry('Backup shift', '2024-05-02', '17:00', '21:00', false);
    const third = createShiftEntry('Previous day', '2024-05-01', '08:00', '16:00', false);

    const issues = getShiftValidationIssues([first, second, third]);
    const messages = issues.map((issue) => issue.message);

    expect(messages.some((message) => message.includes('share 2024-05-02'))).toBe(true);
    expect(messages.some((message) => message.includes('not sorted by date'))).toBe(true);
  });

  it('flags invalid time ranges', () => {
    const invalid = createShiftEntry('Night shift', '2024-05-02', '18:00', '08:00', false);
    const issues = getShiftValidationIssues([invalid]);

    expect(issues.some((issue) => issue.message.includes('end time before or equal'))).toBe(true);
  });

  it('returns no issues for an empty shift list', () => {
    expect(getShiftValidationIssues([])).toEqual([]);
  });

  it('flags shifts longer than 16 hours', () => {
    const marathon = createShiftEntry('Marathon shift', '2024-05-03', '04:00', '23:00', false);
    const issues = getShiftValidationIssues([marathon]);

    expect(issues.some((issue) => issue.message.includes('longer than 16 hours'))).toBe(true);
  });

  it('flags shifts missing a description', () => {
    const shift = createShiftEntry('placeholder', '2024-05-04', '08:00', '16:00', false);
    shift.description = '   ';
    const issues = getShiftValidationIssues([shift]);

    expect(issues.some((issue) => issue.message.includes('missing a description'))).toBe(true);
  });

  it('does not flag chronologically ordered shifts as out-of-order', () => {
    const first = createShiftEntry('Day one', '2024-05-01', '08:00', '16:00', false);
    const second = createShiftEntry('Day two', '2024-05-02', '08:00', '16:00', false);
    const issues = getShiftValidationIssues([first, second]);

    expect(issues.some((issue) => issue.message.includes('not sorted by date'))).toBe(false);
  });

  it('flags overlapping shifts on the same day', () => {
    const morning = createShiftEntry('Morning', '2024-05-05', '08:00', '14:00', false);
    const overlap = createShiftEntry('Overlap', '2024-05-05', '13:00', '20:00', false);
    const issues = getShiftValidationIssues([morning, overlap]);

    expect(issues.some((issue) => issue.message.includes('overlap'))).toBe(true);
  });

  it('does not flag back-to-back shifts as overlapping', () => {
    const first = createShiftEntry('Early', '2024-05-06', '08:00', '14:00', false);
    const second = createShiftEntry('Late', '2024-05-06', '14:00', '20:00', false);
    const issues = getShiftValidationIssues([first, second]);

    expect(issues.some((issue) => issue.message.includes('overlap'))).toBe(false);
  });
});
