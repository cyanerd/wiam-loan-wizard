import { useController, useFormContext, type FieldValues } from 'react-hook-form';
import type { NumberFieldPath } from '.';

type Props<T extends FieldValues> = {
  name: NumberFieldPath<T>;
  label: string;
  min: number;
  max: number;
  step: number;
  formatValue: (v: number) => string;
};

export function RangeField<T extends FieldValues>({
  name,
  label,
  min,
  max,
  step,
  formatValue,
}: Props<T>) {
  const { control } = useFormContext<T>();
  const { field } = useController({ name, control });
  const numericValue = (field.value as number | undefined) ?? min;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-base font-semibold tabular-nums text-brand-700">
          {formatValue(numericValue)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={(e) => field.onChange(e.target.valueAsNumber)}
        onBlur={field.onBlur}
        ref={field.ref}
        name={field.name}
        className="range-slider w-full"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
