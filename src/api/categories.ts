import { z } from 'zod';
import { api } from './client';

const categoriesResponseSchema = z.array(z.string()).min(1);

export async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get('/products/category-list');
  return categoriesResponseSchema.parse(data);
}
