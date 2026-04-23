import type { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

// Утилити-типы: отбирают только те имена полей формы, чьё значение строкового
// или числового типа. Благодаря этому <FormField name="amount" /> (число в
// текстовом инпуте) отрезается ещё компилятором.
export type StringFieldPath<T extends FieldValues> = {
  [K in FieldPath<T>]: FieldPathValue<T, K> extends string ? K : never;
}[FieldPath<T>];

export type NumberFieldPath<T extends FieldValues> = {
  [K in FieldPath<T>]: FieldPathValue<T, K> extends number ? K : never;
}[FieldPath<T>];

export { Button } from './Button';
export { FormField } from './FormField';
export { SelectField } from './SelectField';
export { RangeField } from './RangeField';
export { PhoneField } from './PhoneField';
export { FieldError } from './FieldError';
export { ErrorBanner } from './ErrorBanner';
