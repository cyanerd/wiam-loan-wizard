import { useLocation } from 'react-router-dom';

const STEPS = ['/step-1', '/step-2', '/step-3'] as const;

export function StepIndicator() {
  const location = useLocation();
  const current = STEPS.indexOf(location.pathname as (typeof STEPS)[number]);
  const stepNumber = current >= 0 ? current + 1 : 1;
  const progress = (stepNumber / STEPS.length) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>
          Шаг {stepNumber} из {STEPS.length}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
