import { z } from 'zod';
import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP, TERM_MAX, TERM_MIN } from './constants';

export const step1Schema = z.object({
  // Формат 0XXX XXX XXX - 10 цифр с trunk-prefix 0 (украинский/внутренний формат).
  // Код оператора ТЗ не требует валидировать.
  phone: z
    .string()
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().regex(/^0\d{9}$/, 'Телефон должен быть в формате 0XXX XXX XXX')),
  firstName: z.string().trim().min(1, 'Введите имя'),
  lastName: z.string().trim().min(1, 'Введите фамилию'),
  gender: z
    .enum(['male', 'female'], { errorMap: () => ({ message: 'Выберите пол' }) })
    .or(z.literal(''))
    .superRefine((v, ctx) => {
      if (v === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Выберите пол' });
      }
    }),
});

export const step2Schema = z.object({
  workplace: z.string().min(1, 'Выберите место работы'),
  address: z.string().trim().min(1, 'Введите адрес проживания'),
});

export const step3Schema = z.object({
  amount: z
    .number()
    .int()
    .min(AMOUNT_MIN, `Минимум $${AMOUNT_MIN}`)
    .max(AMOUNT_MAX, `Максимум $${AMOUNT_MAX}`)
    .refine((n) => n % AMOUNT_STEP === 0, `Шаг должен быть $${AMOUNT_STEP}`),
  term: z
    .number()
    .int()
    .min(TERM_MIN, `Минимум ${TERM_MIN} дней`)
    .max(TERM_MAX, `Максимум ${TERM_MAX} дней`),
});

export const loanFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export const draftSchema = z
  .object({
    phone: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.enum(['male', 'female']).or(z.literal('')),
    workplace: z.string(),
    address: z.string(),
    amount: z.number(),
    term: z.number(),
  })
  .partial()
  .strict();
