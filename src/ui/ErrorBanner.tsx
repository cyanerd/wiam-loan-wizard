import { Button } from './Button';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span>{message}</span>
      {onRetry && (
        <Button variant="text" onClick={onRetry} className="focus:ring-red-400">
          Повторить
        </Button>
      )}
    </div>
  );
}
