import type { z } from 'zod';
import type { loanFormSchema } from './schema';

export type LoanFormValues = z.infer<typeof loanFormSchema>;
