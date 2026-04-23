import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { PhoneField } from '@/ui';
import { defaultLoanValues } from '@/features/loan-wizard/constants';
import type { LoanFormValues } from '@/features/loan-wizard/types';

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<LoanFormValues>({ defaultValues: defaultLoanValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PhoneField', () => {
  it('форматирует введённые цифры в маску 0XXX XXX XXX', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <PhoneField<LoanFormValues> name="phone" label="Телефон" />
      </Wrapper>,
    );
    const input = screen.getByLabelText('Телефон') as HTMLInputElement;
    await user.type(input, '0501234567');
    expect(input.value).toBe('0501 234 567');
  });

  it('не даёт ввести больше 10 цифр', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <PhoneField<LoanFormValues> name="phone" label="Телефон" />
      </Wrapper>,
    );
    const input = screen.getByLabelText('Телефон') as HTMLInputElement;
    await user.type(input, '05012345678999');
    expect(input.value).toBe('0501 234 567');
  });

  it('авто-подставляет 0 если пользователь начал ввод с другой цифры', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <PhoneField<LoanFormValues> name="phone" label="Телефон" />
      </Wrapper>,
    );
    const input = screen.getByLabelText('Телефон') as HTMLInputElement;
    // Пользователь забыл про 0 и ввёл только 9 цифр - маска добавит 0 в начало
    await user.type(input, '501234567');
    expect(input.value).toBe('0501 234 567');
  });
});
