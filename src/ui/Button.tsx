import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'text';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

// type="button" по умолчанию - защита от случайного submit внутри <form>
// стили вариантов определены в src/styles/index.css как .btn-primary / .btn-secondary / .btn-text.
export function Button({
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'text' && 'btn-text',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
