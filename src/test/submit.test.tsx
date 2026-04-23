import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { DRAFT_STORAGE_KEY } from '@/features/loan-wizard/constants';
import { renderApp } from './renderApp';
import { server } from './msw/server';

async function fillAllSteps(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Телефон'), '0501234567');
  await user.type(screen.getByLabelText('Имя'), 'Иван');
  await user.type(screen.getByLabelText('Фамилия'), 'Петров');
  await user.selectOptions(screen.getByLabelText('Пол'), 'male');
  await user.click(screen.getByRole('button', { name: 'Далее' }));

  await waitFor(() => expect(screen.getByText('Адрес и место работы')).toBeInTheDocument());
  await waitFor(() =>
    expect((screen.getByLabelText('Место работы') as HTMLSelectElement).disabled).toBe(false),
  );
  await user.selectOptions(screen.getByLabelText('Место работы'), 'beauty');
  await user.type(screen.getByLabelText('Адрес проживания'), 'Киев, Крещатик 1');
  await user.click(screen.getByRole('button', { name: 'Далее' }));

  await waitFor(() => expect(screen.getByText('Параметры займа')).toBeInTheDocument());
}

describe('submit flow', () => {
  beforeEach(() => sessionStorage.clear());

  it('полный flow → POST /products/add → модалка с правильным текстом', async () => {
    const user = userEvent.setup();

    let capturedBody: { title: string } | null = null;
    server.use(
      http.post('https://dummyjson.com/products/add', async ({ request }) => {
        capturedBody = (await request.json()) as { title: string };
        return HttpResponse.json({ id: 101, title: capturedBody.title });
      }),
    );

    renderApp();
    await fillAllSteps(user);
    await user.click(screen.getByRole('button', { name: 'Подать заявку' }));

    // Modal: текст разбит по span'ам для акцентов, поэтому сверяемся с textContent
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Заявка одобрена');
    expect(dialog).toHaveTextContent('Поздравляем, Петров Иван');
    expect(dialog).toHaveTextContent('Вам одобрена $200 на 10 дней');

    expect(capturedBody).toEqual({ title: 'Иван Петров' });
  });

  it('«Готово» в модалке → reset формы + стирание черновика + редирект на /step-1', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('https://dummyjson.com/products/add', async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json({ id: 101, title: body.title });
      }),
    );

    renderApp();
    await fillAllSteps(user);
    await user.click(screen.getByRole('button', { name: 'Подать заявку' }));
    await screen.findByRole('dialog');

    // sessionStorage мог успеть заполниться debounced-записью к этому моменту
    await user.click(screen.getByRole('button', { name: 'Готово' }));

    await waitFor(() => expect(screen.getByText('Личные данные')).toBeInTheDocument());
    expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Фамилия') as HTMLInputElement).value).toBe('');
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  describe('submit error + retry', () => {
    // Ошибка submit пишется в console.error через onError mutation'а.
    // Подавляем, чтобы лог тестов был чистый.
    let errorSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    it('500 на submit → ErrorBanner + Retry → успех → модалка', async () => {
      const user = userEvent.setup();

      let attempts = 0;
      server.use(
        http.post('https://dummyjson.com/products/add', async ({ request }) => {
          attempts++;
          if (attempts === 1) return new HttpResponse(null, { status: 500 });
          const body = (await request.json()) as { title: string };
          return HttpResponse.json({ id: 202, title: body.title });
        }),
      );

      renderApp();
      await fillAllSteps(user);
      await user.click(screen.getByRole('button', { name: 'Подать заявку' }));

      // Первая попытка упала - видим баннер с кнопкой «Повторить»
      expect(
        await screen.findByText('Не удалось отправить заявку. Попробуйте ещё раз.'),
      ).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: 'Повторить' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Повторяем - на этот раз API отвечает успехом, появляется модалка
      await user.click(retryBtn);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveTextContent('Заявка одобрена');
      expect(attempts).toBe(2);
    });
  });
});
