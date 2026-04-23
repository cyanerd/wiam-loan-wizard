import { FormField, PhoneField, SelectField } from '@/ui';
import { WizardNav } from '../components/WizardNav';
import { GENDER_OPTIONS } from '../constants';
import { useScrollToTop } from '../hooks/useScrollToTop';
import type { LoanFormValues } from '../types';

export function Step1Personal() {
  useScrollToTop();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Личные данные</h2>
      <PhoneField<LoanFormValues> name="phone" label="Телефон" autoFocus />
      <FormField<LoanFormValues> name="firstName" label="Имя" autoComplete="given-name" />
      <FormField<LoanFormValues> name="lastName" label="Фамилия" autoComplete="family-name" />
      <SelectField<LoanFormValues> name="gender" label="Пол" options={GENDER_OPTIONS} />

      <WizardNav stepFields={['phone', 'firstName', 'lastName', 'gender']} nextTo="/step-2" />
    </section>
  );
}
