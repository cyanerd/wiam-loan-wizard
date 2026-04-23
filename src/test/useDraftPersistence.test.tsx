import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useDraftPersistence, clearDraft } from '@/features/loan-wizard/hooks/useDraftPersistence';
import { defaultLoanValues, DRAFT_STORAGE_KEY } from '@/features/loan-wizard/constants';
import type { LoanFormValues } from '@/features/loan-wizard/types';

function setupHook() {
  return renderHook(() => {
    const methods = useForm<LoanFormValues>({ defaultValues: defaultLoanValues });
    useDraftPersistence(methods);
    return methods;
  });
}

describe('useDraftPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('debounced write (fake timers)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('быстрые setValue → одна запись через 500мс с последним значением', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = setupHook();

      act(() => {
        result.current.setValue('firstName', 'A');
        result.current.setValue('firstName', 'AB');
        result.current.setValue('firstName', 'ABC');
      });

      expect(setItemSpy).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      const draftCalls = setItemSpy.mock.calls.filter(([key]) => key === DRAFT_STORAGE_KEY);
      expect(draftCalls).toHaveLength(1);
      expect(JSON.parse(draftCalls[0][1] as string).firstName).toBe('ABC');

      setItemSpy.mockRestore();
    });

    it('на ошибке setItem персистенс отключается, следующие записи не идут', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      const { result } = setupHook();

      act(() => {
        result.current.setValue('firstName', 'A');
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);

      setItemSpy.mockClear();
      warnSpy.mockClear();
      act(() => {
        result.current.setValue('firstName', 'B');
        result.current.setValue('firstName', 'C');
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(setItemSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();

      setItemSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('clearDraft отменяет pending write — перезаписи на дефолты не происходит', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { result } = setupHook();

      // 1. пользователь что-то пишет → таймер заряжен
      act(() => {
        result.current.setValue('firstName', 'A');
      });

      // 2. clearDraft до того, как сработал таймер
      act(() => {
        clearDraft();
      });

      // 3. отматываем время — таймер не должен выстрелить
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const draftCalls = setItemSpy.mock.calls.filter(([key]) => key === DRAFT_STORAGE_KEY);
      expect(draftCalls).toHaveLength(0);
      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();

      setItemSpy.mockRestore();
    });
  });

  describe('clearDraft', () => {
    it('удаляет draft из sessionStorage', () => {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, '{"firstName":"x"}');
      clearDraft();
      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });

    it('не падает если removeItem бросает (private mode и т.п.)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new DOMException('SecurityError');
      });

      expect(() => clearDraft()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      removeSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });
});
