import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://dummyjson.com/products/category-list', () =>
    HttpResponse.json(['beauty', 'electronics', 'furniture', 'groceries']),
  ),
  http.post('https://dummyjson.com/products/add', async ({ request }) => {
    const body = (await request.json()) as { title: string };
    return HttpResponse.json({ id: 101, title: body.title });
  }),
];
