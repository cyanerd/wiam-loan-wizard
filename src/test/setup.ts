import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from './msw/server';

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
