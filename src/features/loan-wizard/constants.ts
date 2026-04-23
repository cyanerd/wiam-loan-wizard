import type { LoanFormValues } from './types';

export const defaultLoanValues: LoanFormValues = {
  phone: '',
  firstName: '',
  lastName: '',
  gender: '',
  workplace: '',
  address: '',
  amount: 200,
  term: 10,
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
] as const;

export const AMOUNT_MIN = 200;
export const AMOUNT_MAX = 1000;
export const AMOUNT_STEP = 100;

export const TERM_MIN = 10;
export const TERM_MAX = 30;
export const TERM_STEP = 1;

export const DRAFT_STORAGE_KEY = 'loan-wizard:draft';
