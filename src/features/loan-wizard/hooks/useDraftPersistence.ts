import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { DRAFT_STORAGE_KEY, defaultLoanValues } from '../constants';
import { draftSchema } from '../schema';
import type { LoanFormValues } from '../types';

// Module-level, чтобы clearDraft мог отменить pending write.
let pendingWriteTimer: ReturnType<typeof setTimeout> | undefined;
let storageBroken = false;

export function readDraft(): LoanFormValues {
  const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return defaultLoanValues;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[loan-wizard:draft] invalid JSON, discarding', err);
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    return defaultLoanValues;
  }

  const result = draftSchema.safeParse(parsed);
  if (!result.success) {
    console.warn('[loan-wizard:draft] shape mismatch, discarding', result.error.issues);
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    return defaultLoanValues;
  }

  return { ...defaultLoanValues, ...result.data };
}

export function useDraftPersistence(methods: UseFormReturn<LoanFormValues>) {
  useEffect(() => {
    storageBroken = false;
    const subscription = methods.watch((values) => {
      if (storageBroken) return;
      if (pendingWriteTimer) clearTimeout(pendingWriteTimer);
      pendingWriteTimer = setTimeout(() => {
        try {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
        } catch (err) {
          console.warn('[loan-wizard:draft] write failed, disabling persistence', err);
          storageBroken = true;
        } finally {
          pendingWriteTimer = undefined;
        }
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (pendingWriteTimer) {
        clearTimeout(pendingWriteTimer);
        pendingWriteTimer = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function clearDraft() {
  if (pendingWriteTimer) {
    clearTimeout(pendingWriteTimer);
    pendingWriteTimer = undefined;
  }
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.warn('[loan-wizard:draft] clear failed', err);
  }
}
