import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { submitLoan } from '@/api/loan';
import { ErrorBanner, RangeField } from '@/ui';
import { WizardNav } from '../components/WizardNav';
import { SuccessModal } from '../components/SuccessModal';
import { pluralizeDay } from '../utils/pluralize';
import { clearDraft } from '../hooks/useDraftPersistence';
import { step1Schema, step2Schema } from '../schema';
import { useStepGuard } from '../hooks/useStepGuard';
import { useScrollToTop } from '../hooks/useScrollToTop';
import {
  AMOUNT_MIN,
  AMOUNT_MAX,
  AMOUNT_STEP,
  TERM_MIN,
  TERM_MAX,
  TERM_STEP,
  defaultLoanValues,
} from '../constants';
import type { LoanFormValues } from '../types';

export function Step3Loan() {
  useStepGuard(step1Schema.merge(step2Schema), '/step-1');
  useScrollToTop();

  const { getValues, trigger, reset } = useFormContext<LoanFormValues>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: submitLoan,
    onSuccess: () => setModalOpen(true),
    onError: (err) => console.error('[loan-wizard:submit] failed', err),
  });

  const handleSubmit = async () => {
    const valid = await trigger(['amount', 'term']);
    if (!valid) return;
    const { firstName, lastName } = getValues();
    mutation.mutate({ title: `${firstName} ${lastName}` });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    reset(defaultLoanValues);
    clearDraft();
    navigate('/step-1', { replace: true });
  };

  const values = getValues();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Параметры займа</h2>

      {mutation.isError && (
        <ErrorBanner
          message="Не удалось отправить заявку. Попробуйте ещё раз."
          onRetry={handleSubmit}
        />
      )}

      <RangeField<LoanFormValues>
        name="amount"
        label="Сумма займа"
        min={AMOUNT_MIN}
        max={AMOUNT_MAX}
        step={AMOUNT_STEP}
        formatValue={(v) => `$${v}`}
      />
      <RangeField<LoanFormValues>
        name="term"
        label="Срок займа"
        min={TERM_MIN}
        max={TERM_MAX}
        step={TERM_STEP}
        formatValue={(v) => `${v} ${pluralizeDay(v)}`}
      />

      <WizardNav
        stepFields={['amount', 'term']}
        backTo="/step-2"
        backDisabled={mutation.isPending || mutation.isSuccess}
        submit={{
          onSubmit: handleSubmit,
          isPending: mutation.isPending,
          isSuccess: mutation.isSuccess,
        }}
      />

      <SuccessModal
        open={modalOpen}
        onClose={handleCloseModal}
        firstName={values.firstName}
        lastName={values.lastName}
        amount={values.amount}
        term={values.term}
      />
    </section>
  );
}
