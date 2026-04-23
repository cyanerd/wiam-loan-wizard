import { describe, it, expect } from 'vitest';
import { pluralizeDay } from '@/features/loan-wizard/utils/pluralize';

describe('pluralizeDay', () => {
  it('одиночный: 1 → день, 21 → день, 101 → день', () => {
    expect(pluralizeDay(1)).toBe('день');
    expect(pluralizeDay(21)).toBe('день');
    expect(pluralizeDay(101)).toBe('день');
  });
  it('2-4, 22-24: дня', () => {
    expect(pluralizeDay(2)).toBe('дня');
    expect(pluralizeDay(3)).toBe('дня');
    expect(pluralizeDay(4)).toBe('дня');
    expect(pluralizeDay(22)).toBe('дня');
  });
  it('5-20, 25-30: дней', () => {
    expect(pluralizeDay(5)).toBe('дней');
    expect(pluralizeDay(10)).toBe('дней');
    expect(pluralizeDay(11)).toBe('дней');
    expect(pluralizeDay(12)).toBe('дней');
    expect(pluralizeDay(14)).toBe('дней');
    expect(pluralizeDay(20)).toBe('дней');
    expect(pluralizeDay(25)).toBe('дней');
  });
});
