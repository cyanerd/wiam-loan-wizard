import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderApp } from './renderApp';
import { server } from './msw/server';

const VALID_STEP1_DRAFT = {
  phone: '0501234567',
  firstName: 'Иван',
  lastName: 'Петров',
  gender: 'male',
  workplace: '',
  address: '',
  amount: 200,
  term: 10,
};

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Телефон'), '0501234567');
  await user.type(screen.getByLabelText('Имя'), 'Иван');
  await user.type(screen.getByLabelText('Фамилия'), 'Петров');
  await user.selectOptions(screen.getByLabelText('Пол'), 'male');
}

describe('wizard flow', () => {
  beforeEach(() => sessionStorage.clear());

  it('переход Step 1 → Step 2 → Назад сохраняет данные', async () => {
    const user = userEvent.setup();
    renderApp();

    await fillStep1(user);
    await user.click(screen.getByRole('button', { name: 'Далее' }));

    await waitFor(() => expect(screen.getByText('Адрес и место работы')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Назад' }));

    expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('Иван');
    expect((screen.getByLabelText('Фамилия') as HTMLInputElement).value).toBe('Петров');
    expect((screen.getByLabelText('Телефон') as HTMLInputElement).value).toBe('0501 234 567');
  });

  it('блокирует переход с невалидного Step 1', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(screen.getByText('Личные данные')).toBeInTheDocument();
    expect(await screen.findByText('Введите имя')).toBeInTheDocument();
  });

  it('редиректит со Step 3 на Step 1 при прямом переходе без заполнения', async () => {
    renderApp('/step-3');
    await waitFor(() => expect(screen.getByText('Личные данные')).toBeInTheDocument());
  });

  it('редиректит со Step 2 на Step 1 при прямом переходе без заполнения', async () => {
    renderApp('/step-2');
    await waitFor(() => expect(screen.getByText('Личные данные')).toBeInTheDocument());
  });

  it('F5 на Step 2: восстанавливает черновик из sessionStorage и не редиректит', async () => {
    sessionStorage.setItem('loan-wizard:draft', JSON.stringify(VALID_STEP1_DRAFT));

    renderApp('/step-2');

    await waitFor(() => expect(screen.getByText('Адрес и место работы')).toBeInTheDocument());
  });

  describe('categories error + retry', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    it('500 на GET /category-list → ErrorBanner, Next disabled → retry → Next enabled', async () => {
      const user = userEvent.setup();

      let attempts = 0;
      server.use(
        http.get('https://dummyjson.com/products/category-list', () => {
          attempts++;
          if (attempts === 1) return new HttpResponse(null, { status: 500 });
          return HttpResponse.json(['beauty', 'electronics']);
        }),
      );

      sessionStorage.setItem('loan-wizard:draft', JSON.stringify(VALID_STEP1_DRAFT));
      renderApp('/step-2');

      // Ждём первой (неудачной) попытки - виден баннер
      expect(await screen.findByText('Не удалось загрузить список категорий.')).toBeInTheDocument();

      const select = screen.getByLabelText('Место работы') as HTMLSelectElement;
      expect(select).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();

      // Клик «Повторить» - refetch успешен
      await user.click(screen.getByRole('button', { name: 'Повторить' }));

      await waitFor(() => expect(select).not.toBeDisabled());
      expect(screen.queryByText('Не удалось загрузить список категорий.')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Далее' })).not.toBeDisabled();
      expect(attempts).toBe(2);
    });
  });

  describe('readDraft resilience', () => {
    // Подавляем ожидаемые console.warn внутри readDraft во время этих тестов.
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => warnSpy.mockRestore());

    it('невалидный JSON в sessionStorage → форма стартует с дефолтов', () => {
      sessionStorage.setItem('loan-wizard:draft', 'not a json{{{');
      renderApp();
      expect(screen.getByText('Личные данные')).toBeInTheDocument();
      expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('');
      expect(sessionStorage.getItem('loan-wizard:draft')).toBeNull();
    });

    it('несовместимая shape (лишний ключ) → черновик выбрасывается', () => {
      sessionStorage.setItem(
        'loan-wizard:draft',
        JSON.stringify({ firstName: 'Иван', unknownField: 'x' }),
      );
      renderApp();
      expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('');
      expect(sessionStorage.getItem('loan-wizard:draft')).toBeNull();
    });

    it('неверный тип (amount: string вместо number) → черновик выбрасывается', () => {
      sessionStorage.setItem(
        'loan-wizard:draft',
        JSON.stringify({ firstName: 'Иван', amount: 'пятьсот' }),
      );
      renderApp();
      expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('');
      expect(sessionStorage.getItem('loan-wizard:draft')).toBeNull();
    });
  });
});
