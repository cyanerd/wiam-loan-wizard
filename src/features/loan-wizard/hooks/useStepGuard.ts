import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import type { LoanFormValues } from '../types';

/**
 * Гарантирует что пользователь не попал на шаг напрямую, минуя предыдущие.
 * При монтировании прогоняет текущее состояние формы через requiredSchema -
 * если не проходит (поля не заполнены), редиректит на fallbackPath.
 */
export function useStepGuard(
  requiredSchema: z.ZodType<Partial<LoanFormValues>>,
  fallbackPath: string,
) {
  const { getValues } = useFormContext<LoanFormValues>();
  const navigate = useNavigate();

  useEffect(() => {
    const result = requiredSchema.safeParse(getValues());
    if (!result.success) {
      navigate(fallbackPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
