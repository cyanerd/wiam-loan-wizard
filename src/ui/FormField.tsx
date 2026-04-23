import clsx from 'clsx';
import { useController, useFormContext, type FieldValues } from 'react-hook-form';
import type { StringFieldPath } from '.';
import { FieldError } from './FieldError';

type Props<T extends FieldValues> = {
  name: StringFieldPath<T>;
  label: string;
  type?: 'text' | 'email';
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  autoFocus,
}: Props<T>) {
  const { control } = useFormContext<T>();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium mb-1 text-slate-700">{label}</span>
      <input
        {...field}
        value={(field.value as string | undefined) ?? ''}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={clsx('input', error && 'input-error')}
      />
      <FieldError message={error?.message} />
    </label>
  );
}
