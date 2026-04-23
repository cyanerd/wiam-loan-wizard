import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WizardLayout } from '@/features/loan-wizard/WizardLayout';
import { Step1Personal } from '@/features/loan-wizard/steps/Step1Personal';
import { Step2Address } from '@/features/loan-wizard/steps/Step2Address';
import { Step3Loan } from '@/features/loan-wizard/steps/Step3Loan';

// Общая точка рендера для интеграционных тестов. retry: false — чтобы
// одна ошибка API не уходила на фоновый ретрай и тест проверял честно
// ветку isError.
export function renderApp(initialEntry = '/step-1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<WizardLayout />}>
            <Route index element={<Navigate to="step-1" replace />} />
            <Route path="step-1" element={<Step1Personal />} />
            <Route path="step-2" element={<Step2Address />} />
            <Route path="step-3" element={<Step3Loan />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
