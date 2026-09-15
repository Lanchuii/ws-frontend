import { describe, expect, it } from 'vitest';
import { getComingSunday, getMonthDays, toDateKey } from './date';

describe('date utilities', () => {
  it('keeps date-only values stable', () => {
    expect(toDateKey('2026-09-15T23:59:59.000Z')).toBe('2026-09-15');
  });

  it('treats Sunday as the coming Sunday', () => {
    expect(toDateKey(getComingSunday(new Date(2026, 8, 20, 15)))).toBe(
      '2026-09-20',
    );
  });

  it('returns complete calendar weeks', () => {
    const days = getMonthDays(new Date(2026, 8, 1));
    expect(days.length % 7).toBe(0);
    expect(days.filter(Boolean)).toHaveLength(30);
  });
});
