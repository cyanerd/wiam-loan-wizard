import clsx from 'clsx';
import { useController, useFormContext, type FieldValues } from 'react-hook-form';
import type { StringFieldPath } from '.';
import { FieldError } from './FieldError';

type Option = { value: string; label: string };

type Props<T extends FieldValues> = {
  name: StringFieldPath<T>;
  label: string;
  options: readonly Option[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Выберите…',
  disabled,
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
      <select
        {...field}
        value={(field.value as string | undefined) ?? ''}
        disabled={disabled}
        autoFocus={autoFocus}
        className={clsx('input', error && 'input-error')}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError message={error?.message} />
    </label>
  );
}
