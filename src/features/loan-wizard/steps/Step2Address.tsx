import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/api/categories';
import { ErrorBanner, FormField, SelectField } from '@/ui';
import { WizardNav } from '../components/WizardNav';
import { step1Schema } from '../schema';
import { useStepGuard } from '../hooks/useStepGuard';
import { useScrollToTop } from '../hooks/useScrollToTop';
import type { LoanFormValues } from '../types';

function formatCategoryLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function Step2Address() {
  useStepGuard(step1Schema, '/step-1');
  useScrollToTop();

  const {
    data: categories = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // React Query v5 не имеет onError в useQuery - логируем через эффект.
  useEffect(() => {
    if (error) console.error('[loan-wizard:categories] fetch failed', error);
  }, [error]);

  const options = useMemo(
    () => categories.map((slug) => ({ value: slug, label: formatCategoryLabel(slug) })),
    [categories],
  );

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Адрес и место работы</h2>

      {isError && (
        <ErrorBanner message="Не удалось загрузить список категорий." onRetry={() => refetch()} />
      )}

      <SelectField<LoanFormValues>
        name="workplace"
        label="Место работы"
        options={options}
        disabled={isPending || isError}
        placeholder={
          isPending ? 'Загрузка…' : isError ? 'Нажмите «Повторить»' : 'Выберите категорию'
        }
      />
      <FormField<LoanFormValues>
        name="address"
        label="Адрес проживания"
        autoComplete="street-address"
      />

      <WizardNav
        stepFields={['workplace', 'address']}
        backTo="/step-1"
        nextTo="/step-3"
        nextDisabled={isPending || isError}
      />
    </section>
  );
}
