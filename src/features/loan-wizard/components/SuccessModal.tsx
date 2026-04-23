import { Fragment } from 'react';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Button } from '@/ui';
import { pluralizeDay } from '../utils/pluralize';

type Props = {
  open: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  amount: number;
  term: number;
};

export function SuccessModal({ open, onClose, firstName, lastName, amount, term }: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-center mb-5">
                <div className="animate-success-pop flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-9 w-9 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" pathLength={1} className="animate-success-draw" />
                  </svg>
                </div>
              </div>

              <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                Заявка одобрена
              </DialogTitle>

              <Description className="mt-2 text-center text-base leading-relaxed text-slate-600">
                Поздравляем,{' '}
                <span className="font-semibold text-slate-900">
                  {lastName} {firstName}
                </span>
                .
                <br />
                Вам одобрена <span className="font-semibold text-brand-700">${amount}</span> на{' '}
                <span className="font-semibold text-brand-700">
                  {term} {pluralizeDay(term)}
                </span>
                .
              </Description>

              <p className="mt-5 text-center text-xs text-slate-400">
                Менеджер свяжется с вами в ближайшее время.
              </p>

              <Button fullWidth onClick={onClose} className="mt-6">
                Готово
              </Button>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
