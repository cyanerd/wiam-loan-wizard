import { describe, it, expect } from 'vitest';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  loanFormSchema,
} from '@/features/loan-wizard/schema';

describe('step1Schema', () => {
  it('принимает валидный номер с пробелами', () => {
    const r = step1Schema.safeParse({
      phone: '0501 234 567',
      firstName: 'Иван',
      lastName: 'Петров',
      gender: 'male',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe('0501234567');
  });

  it('отклоняет номер не начинающийся с 0', () => {
    const r = step1Schema.safeParse({
      phone: '1501 234 567',
      firstName: 'Иван',
      lastName: 'Петров',
      gender: 'male',
    });
    expect(r.success).toBe(false);
  });

  it('отклоняет короткий номер', () => {
    const r = step1Schema.safeParse({
      phone: '050 1234',
      firstName: 'Иван',
      lastName: 'Петров',
      gender: 'male',
    });
    expect(r.success).toBe(false);
  });

  it('отклоняет пустое имя', () => {
    const r = step1Schema.safeParse({
      phone: '0501234567',
      firstName: '',
      lastName: 'Петров',
      gender: 'male',
    });
    expect(r.success).toBe(false);
  });

  it('отклоняет невалидный gender', () => {
    const r = step1Schema.safeParse({
      phone: '0501234567',
      firstName: 'И',
      lastName: 'П',
      gender: 'other',
    });
    expect(r.success).toBe(false);
  });

  it('отклоняет пустой gender (не выбран)', () => {
    const r = step1Schema.safeParse({
      phone: '0501234567',
      firstName: 'И',
      lastName: 'П',
      gender: '',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('Выберите пол');
    }
  });
});

describe('step2Schema', () => {
  it('принимает валидный адрес и работу', () => {
    const r = step2Schema.safeParse({ workplace: 'beauty', address: 'Киев, Крещатик 1' });
    expect(r.success).toBe(true);
  });

  it('отклоняет пустое место работы', () => {
    const r = step2Schema.safeParse({ workplace: '', address: 'Адрес' });
    expect(r.success).toBe(false);
  });
});

describe('step3Schema', () => {
  it('принимает amount=500 (шаг 100)', () => {
    expect(step3Schema.safeParse({ amount: 500, term: 20 }).success).toBe(true);
  });

  it('отклоняет amount=150 (не кратно 100)', () => {
    expect(step3Schema.safeParse({ amount: 150, term: 20 }).success).toBe(false);
  });

  it('отклоняет amount вне диапазона', () => {
    expect(step3Schema.safeParse({ amount: 100, term: 20 }).success).toBe(false);
    expect(step3Schema.safeParse({ amount: 1100, term: 20 }).success).toBe(false);
  });

  it('отклоняет term=5 и term=31', () => {
    expect(step3Schema.safeParse({ amount: 500, term: 5 }).success).toBe(false);
    expect(step3Schema.safeParse({ amount: 500, term: 31 }).success).toBe(false);
  });
});

describe('loanFormSchema', () => {
  it('принимает полный валидный объект', () => {
    const r = loanFormSchema.safeParse({
      phone: '0501234567',
      firstName: 'И',
      lastName: 'П',
      gender: 'female',
      workplace: 'beauty',
      address: 'A',
      amount: 500,
      term: 20,
    });
    expect(r.success).toBe(true);
  });
});
