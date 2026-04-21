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
});
