import clsx from 'clsx';
import { Controller, useFormContext, type FieldValues } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import type { StringFieldPath } from '.';
import { FieldError } from './FieldError';

type Props<T extends FieldValues> = {
  name: StringFieldPath<T>;
  label: string;
  autoFocus?: boolean;
};

// Формат 0XXX XXX XXX
// потому что другие форматы в проекте пока не встречаются; если появится,
// вынесем маску и normalizer в пропсы.
const PHONE_MASK = '0000 000 000';

const normalizePhone = (value: string): string => {
  const digits = value.replace(/\s/g, '');
  // Любая первая цифра кроме 0 получает 0 впереди: '501234567' → '0501234567'.
  if (digits && digits[0] !== '0') {
    return ('0' + digits).slice(0, 10);
  }
  return value;
};

export function PhoneField<T extends FieldValues>({ name, label, autoFocus }: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 text-slate-700">{label}</span>
          <IMaskInput
            mask={PHONE_MASK}
            value={(field.value as string | undefined) ?? ''}
            onAccept={(value) => field.onChange(normalizePhone(value))}
            inputMode="tel"
            autoComplete="tel"
            autoFocus={autoFocus}
            placeholder="0XXX XXX XXX"
            className={clsx('input', error && 'input-error')}
          />
          <FieldError message={error?.message} />
        </label>
      )}
    />
  );
}
