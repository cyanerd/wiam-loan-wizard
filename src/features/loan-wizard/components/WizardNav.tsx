import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui';
import type { LoanFormValues } from '../types';

type SubmitConfig = {
  onSubmit: () => void;
  isPending: boolean;
  isSuccess: boolean;
  label?: string;
};

type Props = {
  stepFields: (keyof LoanFormValues)[];
  backTo?: string;
  backDisabled?: boolean;
  nextTo?: string;
  submit?: SubmitConfig;
  nextDisabled?: boolean;
};

export function WizardNav({
  stepFields,
  backTo,
  backDisabled,
  nextTo,
  submit,
  nextDisabled,
}: Props) {
  const { trigger } = useFormContext<LoanFormValues>();
  const navigate = useNavigate();

  const handleNext = async () => {
    const valid = await trigger(stepFields);
    if (valid && nextTo) navigate(nextTo);
  };

  return (
    <div className="flex justify-between gap-3 mt-6">
      {backTo ? (
        <Button variant="secondary" onClick={() => navigate(backTo)} disabled={backDisabled}>
          Назад
        </Button>
      ) : (
        <span />
      )}

      {nextTo && (
        <Button onClick={handleNext} disabled={nextDisabled}>
          Далее
        </Button>
      )}

      {submit && (
        <Button onClick={submit.onSubmit} disabled={submit.isPending || submit.isSuccess}>
          {submit.isPending ? 'Отправка…' : (submit.label ?? 'Подать заявку')}
        </Button>
      )}
    </div>
  );
}
