type Props = {
  message?: string;
};

export function FieldError({ message }: Props) {
  if (!message) return null;
  return (
    <p className="text-red-600 text-sm mt-1" aria-live="polite">
      {message}
    </p>
  );
}
