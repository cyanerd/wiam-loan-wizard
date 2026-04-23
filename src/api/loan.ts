import { z } from 'zod';
import { api } from './client';

export type LoanSubmitPayload = { title: string };

const loanSubmitResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export type LoanSubmitResponse = z.infer<typeof loanSubmitResponseSchema>;

export async function submitLoan(payload: LoanSubmitPayload): Promise<LoanSubmitResponse> {
  const { data } = await api.post('/products/add', payload);
  return loanSubmitResponseSchema.parse(data);
}
