import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Outlet } from 'react-router-dom';
import { loanFormSchema } from './schema';
import type { LoanFormValues } from './types';
import { readDraft, useDraftPersistence } from './hooks/useDraftPersistence';
import { StepIndicator } from './components/StepIndicator';

export function WizardLayout() {
  const methods = useForm<LoanFormValues>({
    defaultValues: readDraft(),
    resolver: zodResolver(loanFormSchema),
    mode: 'onSubmit',
  });

  useDraftPersistence(methods);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6 md:p-8">
          <StepIndicator />
          <Outlet />
        </div>
      </div>
    </FormProvider>
  );
}
